import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ChevronDown, ChevronRight, GripVertical, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Attribute, type Level, createLevel, deleteLevel, updateAttribute, updateLevel, reorderLevels } from '@/lib/attributes'
import LevelRow from './LevelRow'

interface AttributeCardProps {
  attribute: Attribute
  studyId: string
  isOpen: boolean
  onToggle: () => void
  onAttributeChange: (updated: Attribute) => void
  onDelete: (attributeId: string) => void
}

export default function AttributeCard({
  attribute,
  studyId,
  isOpen,
  onToggle,
  onAttributeChange,
  onDelete,
}: AttributeCardProps) {
  const { attributes: dndAttr, listeners, setNodeRef, transform, transition } = useSortable({
    id: attribute.id,
  })

  const [levels, setLevels] = useState<Level[]>(
    [...attribute.levels].sort((a, b) => a.order - b.order),
  )
  const [adding, setAdding] = useState(false)
  const nameRef = useRef(attribute.name)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  async function handleNameBlur() {
    const newName = nameRef.current
    if (newName === attribute.name) return
    // Optimistisch sofort aktualisieren
    onAttributeChange({ ...attribute, name: newName, levels })
    const updated = await updateAttribute(studyId, attribute.id, { name: newName })
    onAttributeChange({ ...updated, levels })
  }

  async function handleTypeChange(type: Attribute['type']) {
    const updated = await updateAttribute(studyId, attribute.id, { type })
    onAttributeChange({ ...updated, levels })
  }

  async function handleAddLevel() {
    setAdding(true)
    try {
      const newLevel = await createLevel(studyId, attribute.id, {
        label: '',
        order: levels.length,
      })
      const newLevels = [...levels, newLevel]
      setLevels(newLevels)
      onAttributeChange({ ...attribute, levels: newLevels })
    } finally {
      setAdding(false)
    }
  }

  async function handleLevelUpdate(
    levelId: string,
    data: Partial<Pick<Level, 'label' | 'media_url'>>,
  ) {
    // Optimistisch sofort anwenden
    const optimistic = levels.map((l) => (l.id === levelId ? { ...l, ...data } : l))
    setLevels(optimistic)
    onAttributeChange({ ...attribute, levels: optimistic })
    // Dann mit API-Response bestätigen
    const updated = await updateLevel(studyId, attribute.id, levelId, data)
    const confirmed = optimistic.map((l) => (l.id === levelId ? updated : l))
    setLevels(confirmed)
    onAttributeChange({ ...attribute, levels: confirmed })
  }

  async function handleLevelDelete(levelId: string) {
    await deleteLevel(studyId, attribute.id, levelId)
    const newLevels = levels.filter((l) => l.id !== levelId)
    setLevels(newLevels)
    onAttributeChange({ ...attribute, levels: newLevels })
  }

  async function handleLevelDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = levels.findIndex((l) => l.id === active.id)
    const newIndex = levels.findIndex((l) => l.id === over.id)
    const reordered = arrayMove(levels, oldIndex, newIndex)
    setLevels(reordered)
    onAttributeChange({ ...attribute, levels: reordered })
    await reorderLevels(studyId, attribute.id, reordered.map((l) => l.id))
  }

  const showMedia = attribute.type === 'image' || attribute.type === 'mixed'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...dndAttr}
      className="rounded-lg border bg-card shadow-sm"
    >
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
          aria-label="Attribut verschieben"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground"
          aria-label={isOpen ? 'Einklappen' : 'Ausklappen'}
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <Input
          defaultValue={attribute.name}
          placeholder="Attribut-Name eingeben"
          className="h-8 font-medium border-transparent bg-blue-50 shadow-none hover:border-input focus:border-input focus-visible:ring-0"
          onChange={(e) => { nameRef.current = e.target.value }}
          onBlur={handleNameBlur}
        />

        <Select value={attribute.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="h-8 w-32 shrink-0 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="image">Bild</SelectItem>
            <SelectItem value="mixed">Gemischt</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(attribute.id)}
          aria-label="Attribut löschen"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Collapsible body — immer im DOM, nur per CSS versteckt */}
      <div className={cn('border-t px-4 py-3 flex flex-col gap-1', !isOpen && 'hidden')}>
        {showMedia && (
          <div className="flex gap-2 mb-1 px-6">
            <span className="flex-1 text-xs text-muted-foreground font-medium">Label</span>
            <span className="flex-1 text-xs text-muted-foreground font-medium">Bild-URL</span>
            <span className="w-8" />
          </div>
        )}

        <DndContext collisionDetection={closestCenter} onDragEnd={handleLevelDragEnd}>
          <SortableContext
            items={levels.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {levels.map((level) => (
              <LevelRow
                key={level.id}
                level={level}
                studyId={studyId}
                attributeId={attribute.id}
                showMedia={showMedia}
                onUpdate={handleLevelUpdate}
                onDelete={handleLevelDelete}
              />
            ))}
          </SortableContext>
        </DndContext>

        {levels.length === 0 && (
          <p className="text-sm text-muted-foreground py-1">
            Noch keine Levels. Füge unten eines hinzu.
          </p>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 self-start"
          onClick={handleAddLevel}
          disabled={adding}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Level hinzufügen
        </Button>
      </div>
    </div>
  )
}
