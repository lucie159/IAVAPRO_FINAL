# pattern_router.py (dans le Gateway)
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Query, Request
from auth import get_current_user
import httpx
import os
import traceback

PATTERN_API_URL = os.getenv("PATTERN_API_URL", "http://localhost:8002")  # Port du microservice pattern-matcher

router = APIRouter(prefix="/patterns", tags=["Pattern Matcher"])

@router.post("/match")
async def proxy_match_pattern(
    user_id: str = Depends(get_current_user),
    video_file: UploadFile = File(...),
    template_file: UploadFile = File(...),
    threshold: float = Form(0.7)
):
    try:
        print(f"📡 [GATEWAY → pattern-matcher] POST /match | threshold={threshold} | user_id={user_id}")

        async with httpx.AsyncClient() as client:
            files = {
                "video_file": (video_file.filename, await video_file.read(), video_file.content_type),
                "template_file": (template_file.filename, await template_file.read(), template_file.content_type),
            }
            data = {"threshold": str(threshold)}
            headers = {"user_id": user_id}

            response = await client.post(
                f"{PATTERN_API_URL}/match",
                headers=headers,
                files=files,
                data=data
            )

        print("✅ POST /match terminé avec status:", response.status_code)

        try:
            return response.json()
        except Exception as e:
            print("⚠️ Erreur de parsing JSON : ", response.text)
            raise HTTPException(status_code=500, detail="Réponse du microservice non exploitable")

    except httpx.RequestError as e:
        print("❌ Erreur réseau :", str(e))
        raise HTTPException(status_code=502, detail=f"Connexion au microservice échouée : {e}")
    except Exception as e:
        print("❌ Erreur interne proxy_match_pattern:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Erreur interne dans le proxy /match")


@router.get("/results")
async def proxy_get_results(
    user_id: str = Depends(get_current_user),
    video: str = Query(...),
    template: str = Query(...)
):
    try:
        async with httpx.AsyncClient() as client:
            headers = {"user_id": user_id}
            params = {"video": video, "template": template}

            response = await client.get(
                f"{PATTERN_API_URL}/results",
                headers=headers,
                params=params
            )

            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Aucun résultat trouvé")

            return response.json()

    except httpx.RequestError as e:
        print("❌ Erreur réseau:", e)
        raise HTTPException(status_code=502, detail=f"Connexion au microservice échouée : {e}")
    except Exception as e:
        print("❌ Erreur interne /patterns/results :", str(e))
        raise HTTPException(status_code=500, detail="Erreur dans la récupération des résultats")


@router.delete("/results")
async def proxy_delete_results(
    request: Request,
    video: str = Query(...),
    user_id: str = Depends(get_current_user)
):
    try:
        async with httpx.AsyncClient() as client:
            headers = {"user_id": user_id}
            params = {"video": video}

            response = await client.delete(
                f"{PATTERN_API_URL}/results",
                headers=headers,
                params=params
            )

        return response.json()

    except httpx.RequestError as e:
        print("❌ Erreur réseau:", e)
        raise HTTPException(status_code=502, detail=f"Connexion au microservice échouée : {e}")
    except Exception as e:
        print("❌ Erreur interne DELETE /patterns/results :", str(e))
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression des résultats")
