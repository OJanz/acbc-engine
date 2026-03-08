# Domain Logic: Studies, Attributes, Rules

## Entity Graph

### Core Entities

```
User (1) ────── (N) Study (1) ────── (N) Attribute (1) ────── (N) Level
  │                │
  │                │
  │                └────── (N) ConceptRule (1) ────── (N) ConceptRuleCondition ──── (1) Level
  │                                        if/then
  │
  └────── (N) Participant
```

## Study Model

**File**: `backend/app/models/study.py`

### Fields
| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| `id` | UUID | PK | `uuid.uuid4()` |
| `user_id` | UUID | FK → users.id, RESTRICT | Required |
| `name` | String(255) | NOT NULL | Required |
| `description` | Text | NULLABLE | `None` |
| `status` | StudyStatus | draft/active/closed | `draft` |
| `n_screening_concepts` | Integer | NOT NULL | `12` |
| `n_choice_tasks` | Integer | NOT NULL | `10` |
| `concepts_per_choice_task` | Integer | NOT NULL | `3` |

### Relationships
```python
user: User              # Owner (backref)
attributes: List[Attribute]    # Cascade delete
participants: List[Participant] # Keep orphan records
rules: List[ConceptRule]       # Cascade delete
```

### Status Machine
```
draft → active → closed
  ↑        ↓        ↓
  └────────────────┘
```

**Transitions**:
- `draft → active`: ActivateStudyDialog
- `active → closed`: Close study
- `active → draft`: Deactivate study

## Attribute Model

**File**: `backend/app/models/study.py`

### Fields
| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| `id` | UUID | PK | `uuid.uuid4()` |
| `study_id` | UUID | FK → studies.id, CASCADE | Required |
| `name` | String(255) | NOT NULL | Required |
| `order` | Integer | NOT NULL | Required |
| `type` | AttributeType | text/image/mixed | `text` |

### Attribute Types
| Type | Zweck | Media-Unterstützung |
|------|-------|---------------------|
| `text` | Nur Text | Nein |
| `image` | Nur Bilder | Ja |
| `mixed` | Text + Bilder | Ja |

### Relationships
```python
study: Study            # Parent (back_populates)
levels: List[Level]     # Cascade delete
```

## Level Model

**File**: `backend/app/models/study.py`

### Fields
| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| `id` | UUID | PK | `uuid.uuid4()` |
| `attribute_id` | UUID | FK → attributes.id, CASCADE | Required |
| `label` | String(255) | NOT NULL | Required |
| `order` | Integer | NOT NULL | Required |
| `media_type` | MediaType | text/image/gif | `None` |
| `media_url` | String(2048) | NULLABLE | `None` |

### Media Types
| Type | Verwendung |
|------|-------------|
| `text` | Nur Label-Text |
| `image` | Statisches Bild |
| `gif` | Animierte Grafik |

### Relationships
```python
attribute: Attribute     # Parent
concept_rules: List[ConceptRuleCondition]  # Referenced by rules
```

## Rule System

**File**: `backend/app/models/rule.py`

### ConceptRule Model

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| `id` | UUID | PK | `uuid.uuid4()` |
| `study_id` | UUID | FK → studies.id, CASCADE | Required |
| `description` | Text | NULLABLE | `None` |

### ConceptRuleCondition Model

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| `id` | UUID | PK | `uuid.uuid4()` |
| `rule_id` | UUID | FK → concept_rules.id, CASCADE | Required |
| `role` | ConditionRole | `if_`/`then` | Required |
| `level_id` | UUID | FK → levels.id, CASCADE | Required |

### Unique Constraint
```python
UniqueConstraint("rule_id", "level_id", "role")
```
**Zweck**: Verhindert doppelte if/then-Bedingungen für denselben Level

### Rule Logic
```python
# Beispiel: "Wenn Level A gewählt, dann auch Level B zeigen"
ConceptRule {
  conditions: [
    { role: "if_", level_id: A },
    { role: "then", level_id: B }
  ]
}
```

## Cascade Delete Behavior

| Relationship | OnDelete | Effekt |
|--------------|----------|--------|
| `Study → Attribute` | CASCADE | Attribute gelöscht |
| `Study → ConceptRule` | CASCADE | Rules gelöscht |
| `Attribute → Level` | CASCADE | Levels gelöscht |
| `ConceptRule → ConceptRuleCondition` | CASCADE | Conditions gelöscht |
| `Study → Participant` | RESTRICT | Löschen verhindert |
| `Study → User` | RESTRICT | Löschen verhindert |

## Type Consistency

### SQLAlchemy → Pydantic → TypeScript

#### Study
| SQLAlchemy | Pydantic | TypeScript |
|------------|----------|------------|
| `StudyStatus` (Enum) | `StudyStatus` (Enum) | `StudyStatus` (Enum) |
| `UUID(as_uuid=True)` | `uuid.UUID` | `string` |
| `DateTime` | `datetime` | `string` (ISO) |

#### Attribute
| SQLAlchemy | Pydantic | TypeScript |
|------------|----------|------------|
| `AttributeType` (Enum) | `AttributeType` (Enum) | `AttributeType` (Enum) |
| `Integer` | `int` | `number` |

#### Level
| SQLAlchemy | Pydantic | TypeScript |
|------------|----------|------------|
| `MediaType` (Enum) | `MediaType` (Enum) | `MediaType` (Enum) |
| `String(2048)` | `str | None` | `string \| null` |

## Constraints & Validation

### Database Constraints
```sql
-- FK Constraints
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE

-- Unique Constraint
UNIQUE (rule_id, level_id, role)
```

### Pydantic Validation
```python
class StudyCreate(BaseModel):
    name: str                    # Required
    description: str | None = None  # Optional
    status: StudyStatus = StudyStatus.draft  # Default
```

### TypeScript Validation
```typescript
interface StudyCreate {
  name: string
  description?: string
  status?: StudyStatus
}
```

## Query Patterns

### Study mit Relationen
```python
# Get study with attributes
stmt = (
    select(Study)
    .options(selectinload(Study.attributes))
    .where(Study.id == study_id)
)
```

### Rule mit Conditions
```python
# Get rule with conditions and levels
stmt = (
    select(ConceptRule)
    .options(
        selectinload(ConceptRule.conditions)
        .joinedload(ConceptRuleCondition.level)
    )
    .where(ConceptRule.study_id == study_id)
)
```

## Business Rules

### Study Creation
1. User muss authentifiziert sein
2. `user_id` wird automatisch gesetzt
3. Status initialisiert als `draft`

### Attribute Management
1. Attribute gehören zu genau einer Study
2. `order` bestimmt Anzeigereihenfolge
3. Mindestens 2 Attribute pro Study

### Level Management
1. Level gehören zu genau einem Attribute
2. `order` bestimmt Anzeigereihenfolge
3. Media-URL optional für Text-Attribute

### Rule Validation
1. Mindestens 1 `if_` und 1 `then` Condition
2. `if_` und `then` können nicht auf denselben Level zeigen
3. Cyclische Abhängigkeiten verhindern

## Migration History

| Version | Beschreibung | Files |
|---------|--------------|-------|
| `65d9c774153f` | Users Table | `models/user.py` |
| `80eeb56cb2aa` | ACBC Models (Study, Attribute, Level) | `models/study.py` |
| `50db6ed15459` | Concept Rules | `models/rule.py` |

## Data Integrity Checks

### Checkliste für neue Features
- [ ] FK Constraints definiert
- [ ] Cascade Delete Behavior geprüft
- [ ] Unique Constraints gesetzt
- [ ] Enum-Werte konsistent
- [ ] Pydantic Schemas synchron
- [ ] TypeScript Interfaces synchron