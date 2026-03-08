# Frontend: React + TypeScript

## React-Setup

**Files**: `frontend/vite.config.ts`, `frontend/tsconfig.json`

### Konfiguration
```typescript
// Vite
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

// TypeScript
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "strict": true
  }
}
```

### Stack
| Technologie | Version | Zweck |
|-------------|---------|-------|
| React | 18+ | UI Framework |
| TypeScript | 5+ | Type Safety |
| Vite | 5+ | Build Tool |
| React Router | 6+ | Routing |
| Tailwind CSS | 3+ | Styling |
| shadcn/ui | Latest | UI Components |

## Routing

**File**: `frontend/src/App.tsx`

### Route-Struktur
```typescript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  <Route path="/reset-password" element={<ResetPasswordPage />} />
  <Route path="/auth/verify" element={<VerifyEmailPage />} />
  
  <Route element={<ProtectedRoute />}>
    <Route path="/studies" element={<StudiesPage />} />
    <Route path="/studies/:id" element={<StudyPage />} />
  </Route>
</Routes>
```

### ProtectedRoute Component
**File**: `frontend/src/components/ProtectedRoute.tsx`

```typescript
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />
  
  return children
}
```

**Verhalten**:
- Zeigt Spinner während Auth-Check
- Redirect zu `/login` wenn nicht authentifiziert
- Wrapper für alle geschützten Routes

## AuthContext

**File**: `frontend/src/contexts/AuthContext.tsx`

### Context Interface
```typescript
interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  setUser: (user: UserProfile | null) => void
}
```

### AuthProvider
```typescript
export function AuthProvider({ children }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### useAuth Hook
```typescript
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

**Usage**:
```typescript
const { user, loading } = useAuth()
if (loading) return <Loading />
```

## Layout-System

**File**: `frontend/src/layouts/BaseLayout.tsx`

### Struktur
```typescript
<BaseLayout>
  <NavBar />      {/* Top Navigation */}
  <main>          {/* Content Area */}
    <Outlet />
  </main>
  <SideMenu />    {/* Sidebar (conditional) */}
</BaseLayout>
```

### NavBar Component
**File**: `frontend/src/components/NavBar.tsx`

**Features**:
- Logo / Branding
- User-Menu (Dropdown)
- Logout-Button
- Links zu Studies

### SideMenu Component
**File**: `frontend/src/components/SideMenu.tsx`

**Features**:
- Study-Navigation
- Wizard-Steps
- Aktiver Step-Highlight

## Pages

### LoginPage
**File**: `frontend/src/pages/LoginPage.tsx`

```typescript
// Login with email/password
await apiFetch('/api/v1/auth/cookie/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
```

### StudiesPage
**File**: `frontend/src/pages/StudiesPage.tsx`

```typescript
// List all studies for current user
const studies = await fetchStudies()
```

### StudyPage
**File**: `frontend/src/pages/StudyPage.tsx`

**Features**:
- Study-Details
- Wizard-Integration
- Attribute/Rule Management

## Component-Structure

### Directory Layout
```
components/
├── ui/                    # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── study-wizard/          # Wizard components
│   ├── Step1BasicInfo.tsx
│   ├── Step2Attributes.tsx
│   ├── Step3Rules.tsx
│   ├── ActivateStudyDialog.tsx
│   └── WizardStepper.tsx
├── NavBar.tsx            # Navigation
├── SideMenu.tsx          # Sidebar
└── ProtectedRoute.tsx    # Route Guard
```

## State Management

### Local State
```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

### Context State
```typescript
const { user, setUser } = useAuth()
```

### URL State
```typescript
const { id } = useParams<{ id: string }>()
```

## Error Handling

### Global Error Boundary
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

### Component-Level Errors
```typescript
try {
  await apiFetch('/api/endpoint')
} catch (error) {
  if (error instanceof ApiError) {
    setError(error.detail?.message || 'Request failed')
  }
}
```

## Styling

### Tailwind CSS
```typescript
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  {/* Content */}
</div>
```

### shadcn/ui Components
```typescript
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

<Button variant="default">Click me</Button>
<Card>Content</Card>
```

### Theme
- **Colors**: Slate/Zinc Palette
- **Typography**: Inter Font
- **Spacing**: Tailwind Standard
- **Shadows**: Subtle

## Coding Conventions

### TypeScript
- Use strict mode
- Type alle Props und Returns
- Use `type` für Interfaces wenn möglich
- Avoid `any`, use `unknown` statt

### React
- Functional Components mit Hooks
- Use `useCallback` für Event Handlers
- Use `useMemo` für teure Berechnungen
- Props destructuring

### File Naming
- Components: PascalCase (`UserProfile.tsx`)
- Utilities: camelCase (`apiHelpers.ts`)
- Types: camelCase (`userTypes.ts`)

### Imports
```typescript
// 1. React/Next
import { useState, useEffect } from 'react'

// 2. Third-party
import { useNavigate } from 'react-router-dom'

// 3. Local components
import { Button } from '@/components/ui/button'

// 4. Local utilities
import { apiFetch } from '@/lib/api'
```

## Performance

### Optimierungen
- Lazy Loading für Pages: `React.lazy()`
- Code Splitting via React Router
- Memoization für re-renders
- Debouncing für Search Inputs

### Best Practices
- Avoid inline arrow functions in JSX
- Use stable Keys für Lists
- Minimize Context Provider Depth
- Use React Query für Server State (zukünftig)