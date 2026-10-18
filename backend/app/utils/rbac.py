from typing import List, Optional
from fastapi import Header, HTTPException, status, Depends
from app.models.user import User, UserRole

async def get_current_user(
    x_user_email: Optional[str] = Header(default="karla@atlanticflooring.com"),
) -> User:
    user = await User.find_one(User.email == x_user_email)
    if not user:
        # Fallback to Karla (Senior Estimator) if header email isn't found yet
        user = await User.find_one(User.role == UserRole.SENIOR_ESTIMATOR)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Active user account required.",
        )
    return user

def require_roles(allowed_roles: List[UserRole]):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            allowed_names = ", ".join([r.value for r in allowed_roles])
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"RBAC Access Denied: Your role '{current_user.role.value}' ({current_user.full_name}) "
                    f"is not permitted to perform this action. Required role(s): [{allowed_names}]."
                ),
            )
        return current_user

    return role_checker