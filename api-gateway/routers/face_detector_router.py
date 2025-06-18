from fastapi import APIRouter, Request, HTTPException, Depends, Query, File, UploadFile, Form
from auth import get_current_user
import httpx
import traceback
import os

FACE_API_URL = os.getenv("FACE_API_URL", "http://localhost:8005")

router = APIRouter(prefix="/faces", tags=["Face Detection"])

@router.post("/detect")
async def proxy_detect_faces(
    user_id: str = Depends(get_current_user),
    video_file: UploadFile = File(...),
    reference_image: UploadFile = File(...),
    threshold: float = Form(0.5)
):
    try:
        print(f"📡 [GATEWAY → face-detector] POST /detect | threshold={threshold} | user_id={user_id}")

        async with httpx.AsyncClient() as client:
            files = {
                "video_file": (video_file.filename, await video_file.read(), video_file.content_type),
                "reference_image": (reference_image.filename, await reference_image.read(), reference_image.content_type),
            }
            data = {"threshold": str(threshold)}
            headers = {"user_id": user_id}

            response = await client.post(
                f"{FACE_API_URL}/detect",
                headers=headers,
                files=files,
                data=data
            )

        print("✅ POST /detect terminé avec status:", response.status_code)

        try:
            return response.json()
        except Exception as e:
            print("⚠️ Impossible de parser le JSON de la réponse : ", response.text)
            raise HTTPException(status_code=500, detail="Réponse du microservice non exploitable : " + str(e))

    except httpx.HTTPStatusError as http_err:
        print("❌ Erreur HTTP:", response.status_code, response.text)
        raise HTTPException(status_code=response.status_code, detail=response.text)
    except httpx.RequestError as e:
        print("❌ Erreur de connexion au microservice:", str(e))
        raise HTTPException(status_code=502, detail=f"Connexion au service échouée : {e}")
    except Exception as e:
        print("❌ Erreur interne proxy_detect_faces:", str(e))
        raise HTTPException(status_code=500, detail="Erreur interne dans proxy_detect_faces")


@router.get("/matches/structured")
async def proxy_get_structured_matches(
    user_id: str = Depends(get_current_user),
    reference: str = Query(...),
    video: str = Query(...)
):
    try:
        async with httpx.AsyncClient() as client:
            headers = {"user_id": user_id}
            params = {"reference": reference, "video": video}

            print(f"📡 [GATEWAY → face-detector] GET /matches/structured with params: {params}")

            response = await client.get(
                f"{FACE_API_URL}/matches/structured",
                headers=headers,
                params=params
            )

            print("✅ GET /matches/structured terminé avec status:", response.status_code)

            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Aucune détection trouvée pour cette image.")

            return response.json()

    except httpx.RequestError as e:
        print("❌ Erreur de requête HTTPX:", e)
        raise HTTPException(status_code=502, detail=f"Erreur de connexion au service de détection : {e}")
    except Exception as e:
        print("❌ Erreur interne /faces/matches/structured :", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des résultats structurés")
