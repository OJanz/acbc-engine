# API Integration: Frontend ↔ Backend

## API Client

**File**: `frontend/src/lib/api.ts`

### ApiError Class
```typescript
export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: unknown,
  ) {
    super(`API error ${status}`)
  }
}
```

**Verwendung**:
```typescript
try {
  await apiFetch('/api/endpoint')
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Status: ${error.status}`, error.detail)
  }
}
```

### apiFetch Wrapper

**Signature**:
```typescript
async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T>
```

**Features**:
| Feature | Konfiguration |
|---------|--------------|
| Credentials | `include` (Cookies senden) |
| Content-Type | `application/json` |
| Error Handling | Wirft `ApiError` bei `!res.ok` |
| 204 Response | Gibt `undefined` zurück |

**Usage**:
```typescript
// GET Request
const studies = await apiFetch<Study[]>('/api/v1/studies')

// POST Request
const newStudy = await apiFetch<Study>('/api/v1/studies', {
  method: 'POST',
  body: JSON.stringify({ name: 'My Study' })
})

// DELETE (kein Body, 204 Response)
await apiFetch('/api/v1/studies/123', {
  method: 'DELETE'
})
```

## Auth Flow

### Cookie-basierte Auth (Standard)

**Login**:
```typescript
await apiFetch('/api/v1/auth/cookie/login', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'secret'
  })
})
// Cookie 'acbc_auth' wird automatisch gesetzt
```

**Logout**:
```typescript
await apiFetch('/api/v1/auth/cookie/logout', {
  method: 'POST'
})
// Cookie wird gelöscht
```

**User abfragen**:
```typescript
const user = await apiFetch<UserProfile>('/api/v1/users/me')
```

### JWT Bearer Auth (API Testing)

**Login**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/jwt/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'

# Response: {"access_token":"eyJ...","token_type":"bearer"}
```

**Verwendung**:
```bash
curl http://localhost:8000/api/v1/studies \
  -H "Authorization: Bearer eyJ..."
```

## Error Handling

### Error Types

| Status Code | Typ | Beispiel |
|-------------|-----|----------|
| 400 | Bad Request | Validierungsfehler |
| 401 | Unauthorized | Token abgelaufen |
| 403 | Forbidden | Keine Berechtigung |
| 404 | Not Found | Resource existiert nicht |
| 422 | Unprocessable Entity | Schema-Validierung |
| 500 | Internal Server Error | Backend-Fehler |

### Error Response Format
```json
{
  "detail": "Study not found"
}
```

### Error Handling Pattern
```typescript
try {
  const study = await apiFetch<Study>(`/api/v1/studies/${id}`)
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        // Redirect zu Login
        navigate('/login')
        break
      case 403:
        // Zeige Permission Error
        showError('Keine Berechtigung')
        break
      case 404:
        // Resource nicht gefunden
        showError('Studie nicht gefunden')
        break
      default:
        showError('Ein Fehler ist aufgetreten')
    }
  }
}
```

## API Endpoints

### Studies

| Methode | Endpoint | Auth | Request | Response |
|---------|----------|------|---------|----------|
| GET | `/api/v1/studies` | Active User | - | `Study[]` |
| POST | `/api/v1/studies` | Active User | `StudyCreate` | `Study` |
| GET | `/api/v1/studies/{id}` | Active User | - | `Study` |
| PATCH | `/api/v1/studies/{id}` | Active User | `StudyUpdate` | `Study` |
| DELETE | `/api/v1/studies/{id}` | Active User | - | `204 No Content` |

### Attributes

| Methode | Endpoint | Auth | Request | Response |
|---------|----------|------|---------|----------|
| GET | `/api/v1/studies/{id}/attributes` | Active User | - | `Attribute[]` |
| POST | `/api/v1/studies/{id}/attributes` | Active User | `AttributeCreate` | `Attribute` |
| PATCH | `/api/v1/studies/attributes/{id}` | Active User | `AttributeUpdate` | `Attribute` |
| DELETE | `/api/v1/studies/attributes/{id}` | Active User | - | `204 No Content` |

### Levels

| Methode | Endpoint | Auth | Request | Response |
|---------|----------|------|---------|----------|
| POST | `/api/v1/studies/attributes/{id}/levels` | Active User | `LevelCreate` | `Level` |
| PATCH | `/api/v1/studies/levels/{id}` | Active User | `LevelUpdate` | `Level` |
| DELETE | `/api/v1/studies/levels/{id}` | Active User | - | `204 No Content` |

### Rules

| Methode | Endpoint | Auth | Request | Response |
|---------|----------|------|---------|----------|
| GET | `/api/v1/studies/{id}/rules` | Active User | - | `ConceptRule[]` |
| POST | `/api/v1/studies/{id}/rules` | Active User | `ConceptRuleCreate` | `ConceptRule` |
| DELETE | `/api/v1/studies/rules/{id}` | Active User | - | `204 No Content` |

## Type Safety

### Pydantic → TypeScript Mapping

#### Study
```typescript
// Backend (Pydantic)
class StudyRead(BaseModel):
    id: uuid.UUID
    name: str
    status: StudyStatus
    created_at: datetime

// Frontend (TypeScript)
interface Study {
  id: string              // UUID als string
  name: string
  status: StudyStatus
  created_at: string      // ISO 8601
}
```

#### Attribute
```typescript
interface Attribute {
  id: string
  study_id: string
  name: string
  order: number
  type: AttributeType
}
```

#### Level
```typescript
interface Level {
  id: string
  attribute_id: string
  label: string
  order: number
  media_type: MediaType | null
  media_url: string | null
}
```

## Request/Response Patterns

### GET Collection
```typescript
// Frontend
const studies = await apiFetch<Study[]>('/api/v1/studies')

// Backend
@router.get("/", response_model=list[StudyRead])
async def list_studies(user: User = Depends(current_active_user)):
    return await db.execute(select(Study).where(Study.user_id == user.id))
```

### POST Resource
```typescript
// Frontend
const newStudy = await apiFetch<Study>('/api/v1/studies', {
  method: 'POST',
  body: JSON.stringify({ name: 'My Study' })
})

// Backend
@router.post("/", response_model=StudyRead, status_code=201)
async def create_study(
    data: StudyCreate,
    user: User = Depends(current_active_user)
):
    study = Study(user_id=user.id, **data.model_dump())
    db.add(study)
    await db.commit()
    return study
```

### PATCH Resource
```typescript
// Frontend
const updated = await apiFetch<Study>(`/api/v1/studies/${id}`, {
  method: 'PATCH',
  body: JSON.stringify({ status: 'active' })
})

// Backend
@router.patch("/{study_id}", response_model=StudyRead)
async def update_study(
    study_id: uuid.UUID,
    data: StudyUpdate,
    db: AsyncSession,
    user: User
):
    study = await get_study_or_404(study_id, user.id, db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(study, field, value)
    await db.commit()
    return study
```

## CORS Configuration

**Backend**: `backend/app/main.py`

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],  # z.B. "http://localhost:3000"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Frontend**: `vite.config.ts`

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

## Cookie Configuration

**Backend**: `backend/app/api/v1/auth.py`

```python
cookie_transport = CookieTransport(
    cookie_name="acbc_auth",
    cookie_max_age=3600,           # 1 Stunde
    cookie_secure=True,            # Nur HTTPS
    cookie_httponly=True,          # Kein JS-Zugriff
    cookie_samesite="strict"       # CSRF-Schutz
)
```

**Frontend**: Automatisch via `credentials: 'include'`

## Coding Conventions

### API Calls
- Verwende `apiFetch<T>` statt `fetch` direkt
- Type-Annotationen für Responses
- Error Handling mit `try/catch`
- Loading States anzeigen

### Type Definitions
- Exportiere Interfaces aus `types/` Verzeichnis
- Nutze `| null` für optionale Felder
- Enum-Werte als Union Types

### Authentication
- Prüfe `user` vor geschützten Calls
- Redirect zu `/login` bei 401
- Logout bei Auth-Errors

### Pagination
```typescript
// Future: Implementierung
const page1 = await apiFetch<Study[]>('/api/v1/studies?offset=0&limit=20')
const page2 = await apiFetch<Study[]>('/api/v1/studies?offset=20&limit=20')
```

## Debugging

### Network Tab (DevTools)
- Request/Response Payloads prüfen
- Cookie-Werte überprüfen
- Status Codes analysieren

### Backend Logs
```python
# FastAPI Logs im Terminal
INFO:     "GET /api/v1/studies HTTP/1.1" 200 OK
```

### Console Errors
```typescript
// Frontend Error Logging
console.error('API Error:', error.status, error.detail)
```

## Performance

### Best Practices
- Batch Requests wenn möglich
- Debouncing für Search/Filter
- Cache Responses (zukünftig React Query)
- Lazy Loading für große Listen

### Optimierung
```typescript
// Debounce Example
import { debounce } from '@/lib/utils'

const debouncedSearch = debounce((query: string) => {
  searchStudies(query)
}, 300)