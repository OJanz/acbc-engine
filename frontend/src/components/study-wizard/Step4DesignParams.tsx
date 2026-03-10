import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const schema = z.object({
  n_screening_concepts: z.coerce.number().int().min(1, 'Mindestens 1'),
  n_choice_tasks: z.coerce.number().int().min(1, 'Mindestens 1'),
  concepts_per_choice_task: z.coerce.number().int().min(2, 'Mindestens 2').max(10, 'Maximal 10'),
})

type FormValues = z.infer<typeof schema>

interface Step3DesignParamsProps {
  studyId: string
  studyStatus: 'draft' | 'active' | 'closed'
  defaultValues: {
    n_screening_concepts: number
    n_choice_tasks: number
    concepts_per_choice_task: number
  }
  onSave: (data: FormValues) => Promise<void>
  onBack: () => void
  onActivate: () => void
  saving: boolean
  activating: boolean
  canActivate: boolean
  error: string
}

export default function Step3DesignParams({
  studyId,
  studyStatus,
  defaultValues,
  onSave,
  onBack,
  onActivate,
  saving,
  activating,
  canActivate,
  error,
}: Step3DesignParamsProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const values = useWatch({ control })
  const n = values.n_screening_concepts ?? defaultValues.n_screening_concepts
  const tasks = values.n_choice_tasks ?? defaultValues.n_choice_tasks
  const perTask = values.concepts_per_choice_task ?? defaultValues.concepts_per_choice_task

  const participantUrl = `${window.location.origin}/survey/${studyId}`

  return (
    <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="n_screening_concepts">Screening-Konzepte</Label>
          <Input
            id="n_screening_concepts"
            type="number"
            min={1}
            {...register('n_screening_concepts')}
          />
          {errors.n_screening_concepts && (
            <p className="text-sm text-destructive">{errors.n_screening_concepts.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Zufällig generierte Konzepte in der Screening-Phase
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="n_choice_tasks">Choice Tasks</Label>
          <Input
            id="n_choice_tasks"
            type="number"
            min={1}
            {...register('n_choice_tasks')}
          />
          {errors.n_choice_tasks && (
            <p className="text-sm text-destructive">{errors.n_choice_tasks.message}</p>
          )}
          <p className="text-xs text-muted-foreground">Anzahl der Auswahlaufgaben</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="concepts_per_choice_task">Konzepte pro Task</Label>
          <Input
            id="concepts_per_choice_task"
            type="number"
            min={2}
            max={10}
            {...register('concepts_per_choice_task')}
          />
          {errors.concepts_per_choice_task && (
            <p className="text-sm text-destructive">{errors.concepts_per_choice_task.message}</p>
          )}
          <p className="text-xs text-muted-foreground">Optionen je Auswahlaufgabe (2–10)</p>
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-md border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        Jeder Teilnehmer sieht{' '}
        <span className="font-medium text-foreground">{n}</span> Screening-Konzepte, danach{' '}
        <span className="font-medium text-foreground">{tasks}</span> Auswahlaufgaben mit je{' '}
        <span className="font-medium text-foreground">{perTask}</span> Konzepten.
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          ← Zurück
        </Button>

        <div className="flex gap-3">
          <Button type="submit" variant="outline" disabled={saving}>
            {saving ? 'Speichern…' : 'Speichern'}
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    type="button"
                    onClick={onActivate}
                    disabled={!canActivate || activating}
                  >
                    {activating ? 'Aktivieren…' : 'Studie aktivieren'}
                  </Button>
                </span>
              </TooltipTrigger>
              {!canActivate && (
                <TooltipContent>
                  Mindestens 2 Attribute mit je 2 Levels erforderlich
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {studyStatus === 'active' && (
        <div className="flex flex-col gap-1.5 pt-2">
          <Label>Probanden-URL</Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={participantUrl}
              className="bg-muted font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => navigator.clipboard.writeText(participantUrl)}
            >
              Kopieren
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}
