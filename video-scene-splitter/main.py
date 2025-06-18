from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from scene_split_logic import (
    process_video,
    get_scenes_by_video_name,
    get_frames_by_video_name,
    delete_video_data
)
import os
from fastapi.responses import StreamingResponse
import os, shutil, zipfile, io
from db import scenes_col, frames_col


app = FastAPI(title="Video Scene Splitter Service")

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dossier statique pour frames
os.makedirs("static/frames", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Route pour détecter les scènes dans une vidéo
@app.post("/detect")
async def detect(request: Request, file: UploadFile = File(...)):
    user_id = request.headers.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Utilisateur non authentifié")
    try:
        return await process_video(file, user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l’analyse vidéo : {str(e)}")

# Route pour obtenir les scènes d'une vidéo
@app.get("/scenes/{video_name}")
def get_scenes(request: Request, video_name: str):
    user_id = request.headers.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Utilisateur non authentifié")
    try:
        return get_scenes_by_video_name(video_name, user_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")

# Route pour obtenir les frames d'une vidéo
@app.get("/frames/{video_name}")
def get_frames(request: Request, video_name: str):
    user_id = request.headers.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Utilisateur non authentifié")
    try:
        return get_frames_by_video_name(video_name, user_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")

# Route pour supprimer une vidéo
@app.delete("/delete")
def delete(request: Request, filename: str):
    user_id = request.headers.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Utilisateur non authentifié")
    try:
        return delete_video_data(filename, user_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression : {str(e)}")


@app.get("/export")
async def export_scene_split(request: Request):
    user_id = request.headers.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Utilisateur non authentifié")

    scenes = list(scenes_col.find({"user_id": user_id}, {"_id": 0}))
    frames = list(frames_col.find({"user_id": user_id}, {"_id": 0}))
    return JSONResponse(content={"scenes": scenes, "frames": frames})
