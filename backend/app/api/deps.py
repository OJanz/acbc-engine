from fastapi import Depends, HTTPException, status

from app.api.v1.auth import fastapi_users
from app.models.user import User, UserRole

# Base dependencies provided by FastAPI-Users
current_active_user = fastapi_users.current_user(active=True)
current_superuser = fastapi_users.current_user(active=True, superuser=True)


def require_role(*roles: UserRole):
    """
    Dependency factory for role-based access control.
    Admins are always allowed regardless of the required role.

    Usage:
        @router.get("/surveys")
        async def list_surveys(user: User = Depends(require_role(UserRole.researcher))):
            ...
    """
    async def checker(user: User = Depends(current_active_user)) -> User:
        if user.role not in roles and user.role != UserRole.admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user

    return checker
