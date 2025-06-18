# track_router.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from auth import get_current_user
import httpx
import os
import traceback

TRACKING_API_URL = os.getenv("TRACKING_API_URL", "http://localhost:8003")

router = APIRouter(prefix="/tracks", tags=["Object Tracking"])

@router.post("/")
async def proxy_track_objects(
    user_id: str = Depends(get_current_user),
    video_file: UploadFile = File(...),
    annotations_json: UploadFile = File(...),
    tracker_type: str = Form("CSRT")
):
    try:
        print(f"📡 [GATEWAY → tracking] POST / | user_id={user_id} | tracker={tracker_type}")

        async with httpx.AsyncClient() as client:
            files = {
                "video_file": (video_file.filename, await video_file.read(), video_file.content_type),
                "annotations_json": (annotations_json.filename, await annotations_json.read(), annotations_json.content_type),
            }
            data = {"tracker_type": tracker_type}
            headers = {"user_id": user_id}

            response = await client.post(
                f"{TRACKING_API_URL}/",
                headers=headers,
                files=files,
                data=data
            )

        print("✅ POST /track terminé avec status:", response.status_code)

        try:
            return response.json()
        except Exception:
            print("⚠️ Erreur JSON:", response.text)
            raise HTTPException(status_code=500, detail="Réponse du microservice non exploitable")

    except httpx.RequestError as e:
        print("❌ Erreur réseau:", e)
        raise HTTPException(status_code=502, detail=f"Connexion au microservice échouée : {e}")
    except Exception as e:
        print("❌ Erreur proxy:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Erreur interne dans le proxy de tracking")
