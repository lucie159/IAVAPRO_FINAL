from fastapi import APIRouter, Request, HTTPException, Depends
from auth import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    try:
        return {
            "id": current_user["id"],
            "username": current_user["username"],
            "email": current_user["email"],
            "created_at": current_user.get("created_at", "N/A")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
