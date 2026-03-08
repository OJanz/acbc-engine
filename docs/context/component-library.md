# Component Library: study-wizard & shadcn/ui

## Study Wizard

**Directory**: `frontend/src/components/study-wizard/`

### WizardStepper

**File**: `frontend/src/components/study-wizard/WizardStepper.tsx`

**Props**:
```typescript
interface WizardStepperProps {
  currentStep: 1 | 2 | 3 | 4
}
```

**Steps**:
| Step | Label | Component |
|------|-------|-----------|
| 1 | Grunddaten | `Step1BasicInfo` |
| 2 | Attribute & Levels | `Step2Attributes` |
| 3 | Ausschlussregeln | `Step3Rules` |
| 4 | Design-Parameter | `Step4DesignParams` |

**Visual States**:
- `isCompleted`: Primary Background, Check Icon
- `isActive`: Primary Border, Primary Text
- `inactive`: Muted Border, Muted Text

### Step1BasicInfo

**File**: `frontend/src/components/study-wizard/Step1BasicInfo.tsx`

**Fields**:
| Field | Type | Required | Default |
|-------|------|----------|---------|
| `name` | string | Ja | - |
| `description` | string | Nein | - |
| `status` | StudyStatus | Nein | `draft` |

**Components**:
- `Input` für Name
- `Textarea` für Description
- `Select` für Status

### Step2Attributes

**File**: `frontend/src/components/study-wizard/Step2Attributes.tsx`

**Features**:
- Liste aller Attribute
- AttributeCard für jedes Attribute
- Add Attribute Button
- Drag & Drop für Reordering (zukünftig)

**Components**:
- `AttributeCard` (siehe unten)
- `Button` (Add, Delete)
- `Input` (Search/Filter)

### AttributeCard

**File**: `frontend/src/components/study-wizard/AttributeCard.tsx`

**Props**:
```typescript
interface AttributeCardProps {
  attribute: Attribute
  onUpdate: (id: string, data: Partial<Attribute>) => void
  onDelete: (id: string) => void
}
```

**Fields**:
| Field | Type | Required |
|-------|------|----------|
| `name` | string | Ja |
| `type` | AttributeType | Ja |
| `order` | number | Ja |

**Sub-Components**:
- `LevelRow` für Level-Management
- `Select` für Type (text/image/mixed)
- `Button` für Delete

### LevelRow

**File**: `frontend/src/components/study-wizard/LevelRow.tsx`

**Props**:
```typescript
interface LevelRowProps {
  level: Level
  onUpdate: (id: string, data: Partial<Level>) => void
  onDelete: (id: string) => void
}
```

**Fields**:
| Field | Type | Required |
|-------|------|----------|
| `label` | string | Ja |
| `order` | number | Ja |
| `media_type` | MediaType | Nein |
| `media_url` | string | Nein |

**Components**:
- `Input` für Label
- `Select` für MediaType
- `Input` für Media-URL (wenn image/gif)
- `Button` für Delete

### Step3Rules

**File**: `frontend/src/components/study-wizard/Step3Rules.tsx`

**Features**:
- Liste aller Rules
- RuleBuilder für Rule-Editor
- Add Rule Button

**Components**:
- `RuleBuilder` (siehe unten)
- `Button` (Add, Delete)
- `Card` für Rule-Container

### RuleBuilder

**File**: `frontend/src/components/study-wizard/RuleBuilder.tsx`

**Props**:
```typescript
interface RuleBuilderProps {
  rule: ConceptRule
  levels: Level[]
  onUpdate: (id: string, data: Partial<ConceptRule>) => void
  onDelete: (id: string) => void
}
```

**Logic**:
- Mindestens 1 `if_` und 1 `then` Condition
- `if_` und `then` können nicht auf denselben Level zeigen
- Validierung vor Save

**Components**:
- `Select` für Level-Auswahl (if/then)
- `Input` für Description
- `Button` für Delete

### Step4DesignParams

**File**: `frontend/src/components/study-wizard/Step4DesignParams.tsx`

**Fields**:
| Field | Type | Required | Default |
|-------|------|----------|---------|
| `n_screening_concepts` | number | Ja | `12` |
| `n_choice_tasks` | number | Ja | `10` |
| `concepts_per_choice_task` | number | Ja | `3` |

**Components**:
- `Input` (type="number") für alle Felder
- `Button` für Save/Activate

### ActivateStudyDialog

**File**: `frontend/src/components/study-wizard/ActivateStudyDialog.tsx`

**Features**:
- Dialog für Study-Aktivierung
- Validierung vor Aktivierung
- Bestätigungs-Dialog

**Components**:
- `AlertDialog` (shadcn/ui)
- `Button` (Confirm/Cancel)

## shadcn/ui Components

**Directory**: `frontend/src/components/ui/`

### Button

**File**: `frontend/src/components/ui/button.tsx`

**Variants**:
| Variant | Verwendung |
|---------|-------------|
| `default` | Primäre Action |
| `destructive` | Delete/Danger |
| `outline` | Sekundäre Action |
| `ghost` | Subtle Actions |
| `link` | Navigation Links |

**Sizes**:
| Size | Verwendung |
|------|-------------|
| `default` | Standard |
| `sm` | Compact |
| `lg` | Prominent |
| `icon` | Icon-only |

**Usage**:
```typescript
<Button variant="default" size="default">Save</Button>
<Button variant="destructive" size="sm">Delete</Button>
```

### Card

**File**: `frontend/src/components/ui/card.tsx`

**Components**:
- `Card` (Container)
- `CardHeader` (Titel + Description)
- `CardTitle` (H3)
- `CardDescription` (Text)
- `CardContent` (Body)
- `CardFooter` (Actions)

**Usage**:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Study Name</CardTitle>
    <CardDescription>Description here</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

### Input

**File**: `frontend/src/components/ui/input.tsx`

**Types**:
| Type | Verwendung |
|------|-------------|
| `text` | Standard |
| `number` | Zahlen |
| `email` | E-Mail |
| `password` | Passwörter |

**Usage**:
```typescript
<Input type="text" placeholder="Name" value={name} onChange={...} />
<Input type="number" placeholder="Count" value={count} onChange={...} />
```

### Textarea

**File**: `frontend/src/components/ui/textarea.tsx`

**Usage**:
```typescript
<Textarea
  placeholder="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
/>
```

### Select

**File**: `frontend/src/components/ui/select.tsx`

**Components**:
- `Select` (Container)
- `SelectTrigger` (Button)
- `SelectValue` (Placeholder)
- `SelectContent` (Dropdown)
- `SelectItem` (Option)

**Usage**:
```typescript
<Select value={type} onValueChange={setType}>
  <SelectTrigger>
    <SelectValue placeholder="Select type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="text">Text</SelectItem>
    <SelectItem value="image">Image</SelectItem>
    <SelectItem value="mixed">Mixed</SelectItem>
  </SelectContent>
</Select>
```

### AlertDialog

**File**: `frontend/src/components/ui/alert-dialog.tsx`

**Components**:
- `AlertDialog` (Container)
- `AlertDialogTrigger` (Button)
- `AlertDialogContent` (Dialog)
- `AlertDialogHeader` (Titel)
- `AlertDialogTitle` (H2)
- `AlertDialogDescription` (Text)
- `AlertDialogFooter` (Actions)
- `AlertDialogCancel` (Cancel Button)
- `AlertDialogAction` (Confirm Button)

**Usage**:
```typescript
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Study?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Sheet

**File**: `frontend/src/components/ui/sheet.tsx`

**Verwendung**: SideMenu, Mobile Navigation

**Components**:
- `Sheet` (Container)
- `SheetTrigger` (Button)
- `SheetContent` (Sidebar)
- `SheetHeader` (Titel)
- `SheetTitle` (H2)
- `SheetDescription` (Text)

**Usage**:
```typescript
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Menu</Button>
  </SheetTrigger>
  <SheetContent side="left">
    <SheetHeader>
      <SheetTitle>Navigation</SheetTitle>
    </SheetHeader>
    {/* Navigation Items */}
  </SheetContent>
</Sheet>
```

## Component Guidelines

### Typisierte Komponenten

**Props Interface**:
```typescript
interface MyComponentProps {
  data: Study
  onUpdate: (id: string) => void
  className?: string
}

export function MyComponent({ data, onUpdate, className }: MyComponentProps) {
  return (
    <div className={cn('base-styles', className)}>
      {/* Content */}
    </div>
  )
}
```

### State Management in Wizard

**Lokaler State**:
```typescript
const [name, setName] = useState(study.name)
const [error, setError] = useState<string | null>(null)
```

**Callback Pattern**:
```typescript
const handleSave = async () => {
  try {
    await updateStudy(id, { name })
    onSuccess()
  } catch (error) {
    setError('Failed to save')
  }
}
```

### Validation

**Frontend Validation**:
```typescript
const validateForm = (): boolean => {
  if (!name.trim()) {
    setError('Name is required')
    return false
  }
  return true
}
```

**Backend Validation**:
- Pydantic Schemas
- HTTP 422 für Validierungsfehler

### Error Handling

**Component Level**:
```typescript
if (error) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}
```

### Loading States

**Spinner**:
```typescript
{loading && <LoadingSpinner />}
{!loading && <Content />}
```

**Button Loading**:
```typescript
<Button disabled={loading}>
  {loading ? <Spinner /> : 'Save'}
</Button>
```

## Styling Conventions

### Tailwind Classes

**Spacing**:
```typescript
// Padding
p-4, px-6, py-2

// Margin
mb-4, mt-8, mx-2
```

**Flexbox**:
```typescript
// Container
flex, flex-col, flex-row

// Alignment
items-center, justify-between, justify-center
```

**Borders**:
```typescript
// Border
border, border-2

// Rounded
rounded, rounded-lg, rounded-full

// Colors
border-muted, border-primary
```

**Colors**:
```typescript
// Background
bg-background, bg-primary, bg-muted

// Text
text-foreground, text-primary, text-muted-foreground

// Utilities
hover:bg-muted/50, active:scale-95
```

### Utility Functions

**cn()** (Class Names):
```typescript
import { cn } from '@/lib/utils'

cn('base-classes', isActive && 'active-classes', className)
```

## Best Practices

### Component Composition
- Klele, fokussierte Komponenten
- Props übergeben, State nach unten
- Callbacks nach oben

### Reusability
- Generic Props wenn möglich
- Flexible Styling via `className`
- Configurable Behavior

### Performance
- `React.memo()` für große Listen
- `useCallback()` für Event Handlers
- `useMemo()` für teure Berechnungen

### Accessibility
- Semantic HTML
- ARIA Labels für Icons
- Keyboard Navigation
- Screen Reader Support

## Checkliste für neue Komponenten

- [ ] Props Interface definiert
- [ ] TypeScript Types strikt
- [ ] Error Handling implementiert
- [ ] Loading States hinzugefügt
- [ ] Responsive Design
- [ ] Accessibility geprüft
- [ ] Unit Tests (zukünftig)
- [ ] Storybook (zukünftig)