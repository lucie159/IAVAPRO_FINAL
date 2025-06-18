from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from auth import get_current_user
import httpx
import os

SCENE_API_URL = os.getenv("SCENE_API_URL", "http://localhost:8004")

router = APIRouter(prefix="/scenes", tags=["Scene Splitter"])

@router.post("/detect")
async def detect_scenes(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    """
    Transmet une vidéo au microservice pour découpage en scènes
    """
    print(f"🎬 [GATEWAY] Requête /detect reçue pour user: {user_id}")
    print(f"📁 Fichier: {file.filename}")
    print(f"🔗 Service URL: {SCENE_API_URL}")
    
    try:
        async with httpx.AsyncClient() as client:
            files = {'file': (file.filename, await file.read(), file.content_type)}
            headers = {"user_id": user_id}
            
            print(f"📤 [GATEWAY] Envoi vers {SCENE_API_URL}/detect")
            response = await client.post(f"{SCENE_API_URL}/detect", files=files, headers=headers)
            response.raise_for_status()
            
            print(f"✅ [GATEWAY] Réponse reçue du service Scene")
            return JSONResponse(content=response.json())
            
    except httpx.HTTPStatusError as e:
        print(f"❌ [GATEWAY] Erreur HTTP {e.response.status_code}: {e.response.text}")
        return JSONResponse(status_code=e.response.status_code, content={"detail": e.response.text})
    except Exception as e:
        print(f"❌ [GATEWAY] Erreur interne: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Erreur interne dans la passerelle : {str(e)}"})

@router.delete("/delete")
async def delete_video(
    filename: str,
    user_id: str = Depends(get_current_user)
):
    print(f"🗑️ [GATEWAY] Suppression demandée pour: {filename} (user: {user_id})")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{SCENE_API_URL}/delete",
                params={"filename": filename},
                headers={"user_id": user_id}
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"❌ [GATEWAY] Erreur lors de la suppression: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scenes/{video_name}")
async def forward_scenes(
    video_name: str,
    user_id: str = Depends(get_current_user)
):
    print(f"📄 [GATEWAY] Récupération des scènes pour: {video_name} (user: {user_id})")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SCENE_API_URL}/scenes/{video_name}",
                headers={"user_id": user_id}
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"❌ [GATEWAY] Erreur lors de la récupération des scènes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/frames/{video_name}")
async def forward_frames(
    video_name: str,
    user_id: str = Depends(get_current_user)
):
    print(f"🖼️ [GATEWAY] Récupération des frames pour: {video_name} (user: {user_id})")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SCENE_API_URL}/frames/{video_name}",
                headers={"user_id": user_id}
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"❌ [GATEWAY] Erreur lors de la récupération des frames: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/video-data/{video_name}")
async def forward_all_data(
    video_name: str,
    user_id: str = Depends(get_current_user)
):
    print(f"📊 [GATEWAY] Récupération de toutes les données pour: {video_name} (user: {user_id})")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SCENE_API_URL}/video-data/{video_name}",
                headers={"user_id": user_id}
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"❌ [GATEWAY] Erreur lors de la récupération des données: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoints de test pour déboguer
@router.get("/test")
async def test_endpoint():
    """
    Endpoint de test pour vérifier que le router fonctionne
    """
    return {"status": "ok", "message": "Scene router is working", "service_url": SCENE_API_URL}

@router.get("/health")
async def health_check():
    """
    Vérifie si le service Scene Splitter est accessible
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{SCENE_API_URL}/")
            return {
                "gateway_status": "ok",
                "scene_service_status": "accessible",
                "scene_service_code": response.status_code,
                "scene_service_url": SCENE_API_URL
            }
    except Exception as e:
        return {
            "gateway_status": "ok",
            "scene_service_status": "inaccessible",
            "error": str(e),
            "scene_service_url": SCENE_API_URL
        }