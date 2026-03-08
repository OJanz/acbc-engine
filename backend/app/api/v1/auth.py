import uuid

from fastapi import Depends
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    CookieTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.email import send_password_reset_email, send_verification_email
from app.db.session import get_db
from app.models.user import User


async def get_user_db(session: AsyncSession = Depends(get_db)):
    yield SQLAlchemyUserDatabase(session, User)


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.AUTH_SECRET
    verification_token_secret = settings.AUTH_SECRET

    async def on_after_register(self, user: User, request=None):
        pass

    async def on_after_forgot_password(self, user: User, token: str, request=None):
        await send_password_reset_email(user.email, token)

    async def on_after_request_verify(self, user: User, token: str, request=None):
        await send_verification_email(user.email, token)


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)


# Cookie backend – primary transport for browser clients
cookie_transport = CookieTransport(
    cookie_name="acbc_auth",
    cookie_max_age=settings.AUTH_TOKEN_LIFETIME_SECONDS,
    cookie_secure=True,
    cookie_httponly=True,
    cookie_samesite="strict",
)

# Bearer backend – for API testing / Postman / mobile
bearer_transport = BearerTransport(tokenUrl="/api/v1/auth/jwt/login")


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=settings.AUTH_SECRET,
        lifetime_seconds=settings.AUTH_TOKEN_LIFETIME_SECONDS,
    )


cookie_backend = AuthenticationBackend(
    name="cookie",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

bearer_backend = AuthenticationBackend(
    name="bearer",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [cookie_backend, bearer_backend],
)
