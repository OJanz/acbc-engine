import uuid
from datetime import datetime

from fastapi_users import schemas

from app.models.user import UserRole


class UserRead(schemas.BaseUser[uuid.UUID]):
    role: UserRole
    created_at: datetime


class UserCreate(schemas.BaseUserCreate):
    pass


class UserUpdate(schemas.BaseUserUpdate):
    pass
