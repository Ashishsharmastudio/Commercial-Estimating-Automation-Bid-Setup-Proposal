from fastapi import APIRouter, Depends
from app.models.user import User
from app.utils.rbac import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth & RBAC"])

@router.get("/users")
async def list_users():
    """Returns all seeded users so the frontend RBAC Role Switcher can switch between Karla, John, and Estimator."""
    users = await User.find_all().to_list()
    return [
        {
            "id": str(u.id),
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role.value,
            "title": u.title,
        }
        for u in users
    ]

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role.value,
        "title": current_user.title,
    }