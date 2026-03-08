import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type Attribute, createAttribute, deleteAttribute, reorderAttributes } from '@/lib/attributes'
import AttributeCard from './AttributeCard'

interface Step2AttributesProps {
  studyId: string
  initialAttributes: Attribute[]
  onNext: () => void
  onBack: () => void
  onAttributesChange: (attributes: Attribute[]) => void
}

export default function Step2Attributes({
  studyId,
  initialAttributes,
  onNext,
  onBack,
  onAttributesChange,
}: Step2AttributesProps) {
  const [attributes, setAttributes] = useState<Attribute[]>(
    [...initialAttributes].sort((a, b) => a.order - b.order),
  )
  const [openCards, setOpenCards] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const totalLevels = attributes.reduce((sum, a) => sum + a.levels.length, 0)

  function updateAndNotify(newAttributes: Attribute[]) {
    setAttributes(newAttributes)
    onAttributesChange(newAttributes)
  }

  async function handleAddAttribute() {
    setAdding(true)
    setError('')
    try {
      const newAttr = await createAttribute(studyId, {
        name: '',
        order: attributes.length,
      })
      const newAttributes = [...attributes, { ...newAttr, levels: [] }]
      updateAndNotify(newAttributes)
      setOpenCards((prev) => new Set(prev).add(newAttr.id))
    } catch {
      setError('Attribut konnte nicht angelegt werden.')
    } finally {
      setAdding(false)
    }
  }

  async function handleDeleteAttribute(attributeId: string) {
    try {
      await deleteAttribute(studyId, attributeId)
      updateAndNotify(attributes.filter((a) => a.id !== attributeId))
    } catch {
      setError('Attribut konnte nicht gelöscht werden.')
    }
  }

  function handleAttributeChange(updated: Attribute) {
    updateAndNotify(attributes.map((a) => (a.id === updated.id ? updated : a)))
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = attributes.findIndex((a) => a.id === active.id)
    const newIndex = attributes.findIndex((a) => a.id === over.id)
    const reordered = arrayMove(attributes, oldIndex, newIndex)
    updateAndNotify(reordered)
    await reorderAttributes(studyId, reordered.map((a) => a.id))
  }

  function toggleCard(id: string) {
    setOpenCards((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {attributes.length} {attributes.length === 1 ? 'Attribut' : 'Attribute'}
        </Badge>
        <Badge variant="secondary">
          {totalLevels} {totalLevels === 1 ? 'Level' : 'Levels'}
        </Badge>
      </div>

      {/* Attribute list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={attributes.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {attributes.map((attr) => (
              <AttributeCard
                key={attr.id}
                attribute={attr}
                studyId={studyId}
                isOpen={openCards.has(attr.id)}
                onToggle={() => toggleCard(attr.id)}
                onAttributeChange={handleAttributeChange}
                onDelete={handleDeleteAttribute}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {attributes.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">
          Noch keine Attribute. Klicke unten, um das erste anzulegen.
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={handleAddAttribute}
        disabled={adding}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Attribut hinzufügen
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          ← Zurück
        </Button>
        <Button type="button" onClick={onNext}>
          Weiter →
        </Button>
      </div>
    </div>
  )
}
