# Backend: FastAPI + SQLAlchemy

## FastAPI-Instanz

**File**: `backend/app/main.py`

### Konfiguration
```python
app = FastAPI(
    title="ACBC Survey Engine",
    docs_url="/docs",           # Nur in development
    redoc_url="/redoc",         # Nur in development
    openapi_url="/openapi.json" # Nur in development
)
```

### CORS Middleware
| Parameter | Wert | Zweck |
|-----------|------|-------|
| `allow_origins` | `settings.FRONTEND_URL` | Whitelist Frontend-Domain |
| `allow_credentials` | `True` | Cookie-basierte Auth |
| `allow_methods` | `*` | Alle HTTP-Methoden |
| `allow_headers` | `*` | Alle Header |

### Router Registration
```python
app.include_router(studies.router, prefix="/api/v1/studies")
app.include_router(attributes.router, prefix="/api/v1/studies")
app.include_router(rules.router, prefix="/api/v1/studies")
```

## Dependency Injection

**File**: `backend/app/api/deps.py`

### Basale Dependencies
| Dependency | Zweck | Export aus |
|------------|-------|------------|
| `current_active_user` | Aktiver User erforderlich | `fastapi_users.current_user(active=True)` |
| `current_superuser` | Superuser erforderlich | `fastapi_users.current_user(active=True, superuser=True)` |

### Role-Based Access Control
```python
def require_role(*roles: UserRole) -> Callable:
    """
    Usage:
        @router.get("/surveys")
        async def list_surveys(user: User = Depends(require_role(UserRole.researcher))):
            ...
    """
```

**Verhalten**:
- Prüft `user.role` gegen übergebene Rollen
- `UserRole.admin` wird immer akzeptiert (Bypass)
- Löst `HTTPException 403` bei fehlender Berechtigung

## FastAPI-Users Auth

**File**: `backend/app/api/v1/auth.py`

### Auth Backends

| Backend | Transport | Use Case |
|---------|-----------|----------|
| `cookie_backend` | `CookieTransport` | Browser Clients (Standard) |
| `bearer_backend` | `BearerTransport` | API Testing, Postman, Mobile |

### Cookie Transport
```python
cookie_transport = CookieTransport(
    cookie_name="acbc_auth",
    cookie_max_age=settings.AUTH_TOKEN_LIFETIME_SECONDS,
    cookie_secure=True,      # Nur HTTPS
    cookie_httponly=True,   # Kein JS-Zugriff
    cookie_samesite="strict" # CSRF-Schutz
)
```

### JWT Strategie
```python
def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=settings.AUTH_SECRET,
        lifetime_seconds=settings.AUTH_TOKEN_LIFETIME_SECONDS
    )
```

### UserManager
**Overrides**:
- `on_after_register`: Keine Aktion (Manuelle User-Erstellung)
- `on_after_forgot_password`: Sendet Reset-Email via Lettermint
- `on_after_request_verify`: Sendet Verifizierungs-Email

## API-Routes

**File**: `backend/app/api/v1/studies.py`

### CRUD Pattern
```python
@router.get("/", response_model=list[StudyRead])
async def list_studies(db: AsyncSession, user: User):
    # SELECT * FROM studies WHERE user_id = ?
    
@router.post("/", response_model=StudyRead, status_code=201)
async def create_study(data: StudyCreate, db: AsyncSession, user: User):
    # INSERT mit user.id aus Dependency

@router.get("/{study_id}", response_model=StudyRead)
async def get_study(study_id: uuid.UUID, db: AsyncSession, user: User):
    # SELECT WHERE id = ? AND user_id = ?
    
@router.patch("/{study_id}", response_model=StudyRead)
async def update_study(study_id: uuid.UUID, data: StudyUpdate, db: AsyncSession, user: User):
    # Partial Update mit model_dump(exclude_unset=True)
```

### Isolation Pattern
```python
# Ownership Check
select(Study).where(Study.id == study_id, Study.user_id == user.id)
```

## Datenbank

**Files**: `backend/app/db/session.py`, `backend/app/db/base.py`

### AsyncSession
```python
async def get_db():
    async with async_session_maker() as session:
        yield session
```

### Base Class
```python
class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=func.now())

class Base(TimestampMixin, DeclarativeBase):
    pass
```

## Pydantic Schemas

**File**: `backend/app/schemas/study.py`

### Schema-Hierarchie
```python
StudyBase      # Shared Fields
├── StudyCreate # POST /studies
├── StudyUpdate # PATCH /studies/{id}
└── StudyRead   # GET /studies, /studies/{id}
```

### Config
```python
model_config = ConfigDict(from_attributes=True)  # ORM → Schema
```

## Auth Routes

**Files**: `backend/app/main.py` (Registration)

| Router | Prefix | Endpunkte |
|--------|--------|-----------|
| Cookie Auth | `/api/v1/auth/cookie` | `/login`, `/logout` |
| Bearer Auth | `/api/v1/auth/jwt` | `/login` |
| Password Reset | `/api/v1/auth` | `/forgot-password`, `/reset-password` |
| Email Verify | `/api/v1/auth` | `/request-verify-token`, `/verify` |
| User Management | `/api/v1/users` | `GET /`, `PATCH /{id}`, `DELETE /{id}` |

## Migrationen

**Directory**: `backend/alembic/`

### Workflow
```bash
# Revision erstellen
alembic revision --autogenerate -m "description"

# Upgrade
alembic upgrade head

# Downgrade
alembic downgrade -1
```

### Constraints
- Alle Models verwenden `UUID(as_uuid=True)` als Primary Key
- Foreign Keys mit `ondelete="RESTRICT"` oder `ondelete="CASCADE"`
- UniqueConstraints in `__table_args__`

## Coding Conventions

### Python
- Use `async`/`await` für DB-Operationen
- Type-Hints für alle Function-Signatures
- `db.commit()` und `db.refresh()` nachwrites
- `scalar_one_or_none()` für Single-Results

### Fehlerbehandlung
```python
if not study:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Study not found"
    )
```

### Dependencies Chain
```python
Route → get_db → AsyncSession
Route → current_active_user → User
Route → require_role(UserRole.admin) → User