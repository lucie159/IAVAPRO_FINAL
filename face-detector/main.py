from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Request
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from face_detection_service import handle_face_detection
from db import detections_col
from pymongo import MongoClient
import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from db import detections_col



load_dotenv()
app = FastAPI(title="Face Detector Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Folders setup
os.makedirs("references", exist_ok=True)
os.makedirs("static/output", exist_ok=True)
os.makedirs("uploads", exist_ok=True)

app.mount("/references", StaticFiles(directory="references"), name="references")
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.post("/detect")
async def local_detect_faces(
    request: Request,
    video_file: UploadFile = File(...),
    reference_image: UploadFile = File(...),
    threshold: float = Form(0.5)
):
    user_id = request.headers.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Utilisateur non authentifié")

    return await handle_face_detection(video_file, reference_image, threshold, user_id)


@app.get("/matches/structured")
def get_structured_matches(request: Request, reference: str = Query(...), video: str = Query(...)):
    user_id = request.headers.get("user_id")
    print(f"📥 [GET /matches/structured] user_id={user_id}, reference={reference}, video={video}")

    if not user_id:
        raise HTTPException(status_code=401, detail="Utilisateur non authentifié")

    try:
        client = MongoClient()
        scene_db = client["scene_frame_split_db"]
        scenes_col = scene_db["scenes"]
        print("✅ Connexion Mongo OK")

        matches = list(detections_col.find({
            "$or": [
                {"reference": reference},
                {"stored_filename": reference}
            ],
            "video": video,
            "user_id": user_id
        }, {"_id": 0}))
        print(f"📦 {len(matches)} détections récupérées")

        if not matches:
            raise HTTPException(status_code=404, detail="Aucune correspondance trouvée")

        # Préparation des scènes
        scenes_raw = list(scenes_col.find({"video_name": video}, {"_id": 0}))
        scene_map = {s["scene_id"]: s for s in scenes_raw}
        print(f"🎬 {len(scene_map)} scènes chargées")

        grouped = {}
        for match in matches:
            sid = match["scene_id"]
            if sid not in grouped:
                grouped[sid] = {
                    "scene_id": sid,
                    "start": scene_map.get(sid, {}).get("start"),
                    "end": scene_map.get(sid, {}).get("end"),
                    "frames": []
                }
            grouped[sid]["frames"].append({
                "frame": match["frame"],
                "similarity": match["similarity"],
                "box": match.get("box", [])
            })

        print("✅ Résultats regroupés par scène")
        return {
            "reference": reference,
            "video": video,
            "scenes_with_matches": list(grouped.values())
        }

    except Exception as e:
        print(f"❌ Erreur interne: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors du regroupement: {str(e)}")
    

@app.get("/export")
async def export_faces(request: Request):
    user_id = request.headers.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Utilisateur non authentifié")
    results = list(detections_col.find({"user_id": user_id}, {"_id": 0}))
    return JSONResponse(content=results)
