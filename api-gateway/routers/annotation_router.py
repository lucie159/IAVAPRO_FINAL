from fastapi import APIRouter, Depends, Request, UploadFile, File, HTTPException, Header
from services.request_utils import forward_request, forward_upload
from auth import get_current_user
from typing import List, Optional
import os

ANNOTATOR_URL = os.getenv("ANNOTATOR_URL", "http://localhost:8001")

router = APIRouter(prefix="/annotation", tags=["Annotation"])

async def get_authorization_header(authorization: Optional[str] = Header(None)):
    return authorization

@router.get("/classes")
async def get_classes(
    user_id: str = Depends(get_current_user),
    authorization: str = Depends(get_authorization_header)
):
    """Récupérer les classes d'un utilisateur"""
    return await forward_request(
        url=f"{ANNOTATOR_URL}/classes",
        method="GET",
        headers={"user_id": user_id}
    )

@router.post("/classes")
async def add_class(
    request: Request,
    user_id: str = Depends(get_current_user),
    authorization: str = Depends(get_authorization_header)
):
    """Ajouter une nouvelle classe"""
    body = await request.json()
    body["user_id"] = user_id
    return await forward_request(
        url=f"{ANNOTATOR_URL}/classes",
        method="POST",
        json=body
    )

@router.delete("/classes/{label}")
async def delete_class(
    label: str,
    user_id: str = Depends(get_current_user),
    authorization: str = Depends(get_authorization_header)
):
    """Supprimer une classe"""
    return await forward_request(
        url=f"{ANNOTATOR_URL}/classes/{label}",
        method="DELETE",
        headers={"user_id": user_id}
    )

@router.post("/annotate-db")
async def annotate_db(
    request: Request,
    user_id: str = Depends(get_current_user),
    authorization: str = Depends(get_authorization_header)
):
    """Annoter une image"""
    body = await request.json()
    body["user_id"] = user_id
    return await forward_request(
        url=f"{ANNOTATOR_URL}/annotate-db",
        method="POST",
        json=body
    )

@router.get("/export")
async def export_annotations(
    user_id: str = Depends(get_current_user),
    authorization: str = Depends(get_authorization_header)
):
    """Exporter les annotations"""
    return await forward_request(
        url=f"{ANNOTATOR_URL}/export",
        method="GET",
        headers={"user_id": user_id}
    )

@router.get("/annotations")
async def get_annotations(
    user_id: str = Depends(get_current_user),
    authorization: str = Depends(get_authorization_header)
):
    """Récupérer toutes les annotations"""
    return await forward_request(
        url=f"{ANNOTATOR_URL}/annotations",
        method="GET",
        headers={"user_id": user_id}
    )
