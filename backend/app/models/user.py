import enum
import uuid
from datetime import datetime

from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy import DateTime, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    researcher = "researcher"
    participant = "participant"


class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "users"

    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="userrole"), default=UserRole.researcher, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
