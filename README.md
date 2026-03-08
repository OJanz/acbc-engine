# ACBC Survey Engine

Hybrid Conjoint Analysis Engine mit FastAPI-Backend und React-Frontend.

## Quickstart

### Voraussetzungen
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose

## Architektur-Überblick

### Tech-Stack
| Layer | Technologie | Zweck |
|-------|-------------|-------|
| Backend | FastAPI + SQLAlchemy | REST API, ORM, Auth |
| Frontend | React + TypeScript + Vite | SPA, State Management |
| UI | shadcn/ui + Tailwind | Komponenten, Styling |
| Auth | FastAPI-Users | JWT + Cookie Sessions |
| DB | PostgreSQL (async) | Persistenz |

### Struktur
```
ACBC/
├── backend/              # FastAPI Anwendung
│   ├── app/
│   │   ├── api/         # Router, Dependencies, Auth
│   │   ├── core/        # Config, Email
│   │   ├── db/          # Session, Base
│   │   ├── models/      # SQLAlchemy Models
│   │   ├── schemas/     # Pydantic Schemas
│   │   └── services/    # Business Logic
│   ├── alembic/         # DB Migrationen
│   └── scripts/         # Admin Tools
└── frontend/            # React Anwendung
    ├── src/
    │   ├── components/  # UI + Wizard
    │   ├── contexts/    # AuthContext
    │   ├── lib/         # API Client, Utilities
    │   ├── layouts/     # BaseLayout
    │   └── pages/       # Route Pages
    └── static/          # Assets
```

### Client-Server-Kommunikation
- **Auth**: Cookie-basiert (`acbc_auth`) mit JWT-Fallback für Bearer
- **API**: RESTful unter `/api/v1/`
- **CORS**: Konfiguriert für `FRONTEND_URL`
- **Error Handling**: `ApiError` Klasse mit Status-Code und Detail

## Dokumentation

| Dokument | Inhalt |
|----------|--------|
| [docs/context/backend.md](docs/context/backend.md) | FastAPI-Setup, DI, Auth-Flow, API-Routes |
| [docs/context/frontend.md](docs/context/frontend.md) | React-Struktur, Routing, Context-API, Layout |
| [docs/context/domain-logic.md](docs/context/domain-logic.md) | Studies, Attributes, Rules, Beziehungen |
| [docs/context/api-integration.md](docs/context/api-integration.md) | api.ts, Error-Handling, Cookie/JWT |
| [docs/context/component-library.md](docs/context/component-library.md) | study-wizard, shadcn/ui, Guidelines |

## API Endpoints

| Prefix | Route | Auth |
|--------|-------|------|
| `/api/v1/auth/cookie` | Cookie-Auth | Public |
| `/api/v1/auth/jwt` | Bearer-Auth | Public |
| `/api/v1/auth` | Password Reset, Verify | Public |
| `/api/v1/users` | User Management | Active User |
| `/api/v1/studies` | CRUD Studies | Active User |
| `/api/v1/studies/{id}/attributes` | CRUD Attributes | Active User |
| `/api/v1/studies/{id}/rules` | CRUD Rules | Active User |

## Development

### Backend
```bash
# Migration erstellen
alembic revision --autogenerate -m "description"
alembic upgrade head

# Shell starten
python -c "from app.db.session import engine; import asyncio; asyncio.run(engine.dispose())"
```

### Frontend
```bash
# Type-Check
npm run type-check

# Build
npm run build

# Preview
npm run preview
```

### Datenbank-Reset
```bash
docker-compose down -v
docker-compose up -d db
alembic upgrade head
```

## License

MIT