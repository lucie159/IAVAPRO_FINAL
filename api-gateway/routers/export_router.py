from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
import httpx
import os
from io import BytesIO

router = APIRouter(prefix="/exports", tags=["Export"])

EXPORT_SERVICE_URL = os.getenv("EXPORT_API_URL", "http://localhost:8006")

@router.get("/all")
async def export_all_data(request: Request):
    user_id = request.headers.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Utilisateur non authentifié")

    headers = {"user_id": user_id}
    token = request.headers.get("Authorization")
    if token:
        headers["Authorization"] = token

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{EXPORT_SERVICE_URL}/export/all",
                headers=headers
            )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)

        # Transmettre le fichier ZIP en streaming
        return StreamingResponse(
            BytesIO(response.content),
            media_type="application/zip",
            headers={
                "Content-Disposition": "attachment; filename=export_utilisateur.zip"
            }
        )

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Erreur réseau : {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l’export : {str(e)}")
