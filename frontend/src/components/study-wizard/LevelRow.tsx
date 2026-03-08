import { useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type Level } from '@/lib/attributes'

interface LevelRowProps {
  level: Level
  studyId: string
  attributeId: string
  showMedia: boolean
  onUpdate: (levelId: string, data: Partial<Pick<Level, 'label' | 'media_url'>>) => void
  onDelete: (levelId: string) => void
}

export default function LevelRow({
  level,
  showMedia,
  onUpdate,
  onDelete,
}: LevelRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: level.id,
  })

  const labelRef = useRef(level.label)
  const mediaRef = useRef(level.media_url ?? '')

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-2 py-1"
    >
      <button
        type="button"
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
        aria-label="Verschieben"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <Input
        defaultValue={level.label}
        placeholder="Level-Name eingeben"
        className="h-8 text-sm bg-blue-50"
        onChange={(e) => { labelRef.current = e.target.value }}
        onBlur={() => onUpdate(level.id, { label: labelRef.current })}
      />

      {showMedia && (
        <Input
          defaultValue={level.media_url ?? ''}
          placeholder="Bild-URL"
          className="h-8 text-sm"
          onChange={(e) => { mediaRef.current = e.target.value }}
          onBlur={() => onUpdate(level.id, { media_url: mediaRef.current || undefined })}
        />
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(level.id)}
        aria-label="Level löschen"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
