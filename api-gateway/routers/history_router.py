# 📁 api-gateway/routes/history_router.py
from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_user

router = APIRouter(prefix="/history", tags=["History"])

# Exemple fictif de récupération (en réalité tu dois te connecter à un microservice avec DB)
fake_history_db = [
    {"action": "upload", "details": "3 images", "timestamp": "2025-06-02 14:12"},
    {"action": "annotate", "details": "chat.jpg → chat", "timestamp": "2025-06-02 14:18"},
    {"action": "export", "details": "fichier JSON généré", "timestamp": "2025-06-02 14:22"},
]

@router.get("/me")
async def get_user_history(current_user: dict = Depends(get_current_user)):
    try:
        return fake_history_db  # ⛔ Remplace par un appel réel à Mongo si dispo
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
