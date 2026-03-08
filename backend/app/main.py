from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import bearer_backend, cookie_backend, fastapi_users
from app.api.v1 import studies, attributes, rules
from app.core.config import settings
from app.schemas.user import UserCreate, UserRead, UserUpdate

_is_dev = settings.ENVIRONMENT == "development"

app = FastAPI(
    title="ACBC Survey Engine",
    docs_url="/docs" if _is_dev else None,
    redoc_url="/redoc" if _is_dev else None,
    openapi_url="/openapi.json" if _is_dev else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth – Cookie (browser)
app.include_router(
    fastapi_users.get_auth_router(cookie_backend),
    prefix="/api/v1/auth/cookie",
    tags=["auth"],
)

# Auth – Bearer (API / Postman)
app.include_router(
    fastapi_users.get_auth_router(bearer_backend),
    prefix="/api/v1/auth/jwt",
    tags=["auth"],
)

# Password reset, email verification (no public registration)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/api/v1/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/api/v1/auth",
    tags=["auth"],
)

# User management
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/api/v1/users",
    tags=["users"],
)


# Studies
app.include_router(studies.router, prefix="/api/v1/studies", tags=["studies"])
app.include_router(attributes.router, prefix="/api/v1/studies", tags=["attributes"])
app.include_router(rules.router, prefix="/api/v1/studies", tags=["rules"])


@app.get("/")
async def root():
    return {"status": "ok", "service": "ACBC Survey Engine"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
