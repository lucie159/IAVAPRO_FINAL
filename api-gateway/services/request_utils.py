import aiohttp
import httpx
import jwt
import os
from fastapi import Request, HTTPException, UploadFile
from typing import List, Dict, Optional, Any

JWT_SECRET = os.getenv("JWT_SECRET", "votre_cle_secrete")  # synchrone avec le serveur Node.js
JWT_ALGORITHM = "HS256" 

# 🔐 Extraire le user_id à partir du token JWT
async def extract_user_id(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant ou invalide")
    
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token sans ID utilisateur")
        return str(user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")


# 🔁 Forward POST avec user_id injecté dans le JSON
async def forward_post_with_user_id(url: str, request: Request):
    user_id = await extract_user_id(request)
    data = await request.json()
    data["user_id"] = user_id

    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=data) as resp:
            return await resp.json()


# 🔁 GET sécurisé (avec Authorization)
async def forward_get_with_token(url: str, request: Request):
    headers = {}
    if auth := request.headers.get("Authorization"):
        headers["Authorization"] = auth

    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as resp:
            return await resp.json()


# 🔁 Requête générique toutes méthodes (GET, POST, etc.)
async def forward_request(
    url: str,
    method: str = "GET",
    request: Optional[Request] = None,
    json: Optional[Dict] = None,
    headers: Optional[Dict] = None
):
    try:
        request_headers = headers or {}
        request_json = json
        if request and method in ["POST", "PUT", "PATCH"]:
            try:
                request_json = await request.json()
            except:
                request_json = {}

        async with httpx.AsyncClient() as client:
            response = await client.request(method, url, json=request_json, headers=request_headers)
            if response.status_code >= 400:
                return {"error": f"Erreur HTTP {response.status_code}", "detail": response.text}
            try:
                return response.json()
            except:
                return {"message": response.text}
    except Exception as e:
        return {"error": f"Erreur dans forward_request : {str(e)}"}


# 📤 Upload simple de fichiers (sans métadonnées)
async def forward_upload(url: str, files: List[UploadFile], headers: Optional[Dict] = None):
    try:
        form_data = []
        for file in files:
            content = await file.read()
            form_data.append(("files", (file.filename, content, file.content_type)))

        async with httpx.AsyncClient() as client:
            response = await client.post(url, files=form_data, headers=headers or {})
            return response.json()
    except Exception as e:
        return {"error": f"Erreur dans forward_upload : {str(e)}"}


# 📤 Upload multipart avec métadonnées (ex: pour face-detector)
async def forward_upload_with_extra_data(
    url: str,
    files: Dict[str, UploadFile],
    data: Dict[str, Any],
    request: Optional[Request] = None
):
    try:
        # Récupérer token si besoin
        headers = {}
        if request:
            auth_header = request.headers.get("Authorization")
            if auth_header:
                headers["Authorization"] = auth_header

        # Préparer form-data
        form = aiohttp.FormData()

        for key, file in files.items():
            content = await file.read()
            form.add_field(key, content, filename=file.filename, content_type=file.content_type)

        for key, value in data.items():
            form.add_field(key, str(value))

        async with aiohttp.ClientSession() as session:
            async with session.post(url, data=form, headers=headers) as resp:
                if resp.status >= 400:
                    return {"error": f"Erreur HTTP {resp.status}", "detail": await resp.text()}
                return await resp.json()
    except Exception as e:
        return {"error": f"Erreur dans forward_upload_with_extra_data : {str(e)}"}
