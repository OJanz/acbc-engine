import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import SurveyProgress from '@/components/survey/SurveyProgress'
import {
  getSurveyEntry,
  startSurvey,
  getSurveyAttributes,
  submitByo,
  type SurveyEntry,
  type SurveyAttribute,
} from '@/lib/survey'

type Screen = 'welcome' | 'byo' | 'placeholder'

export default function SurveyPage() {
  const { id } = useParams<{ id: string }>()

  const [screen, setScreen] = useState<Screen>('welcome')
  const [entry, setEntry] = useState<SurveyEntry | null>(null)
  const [attributes, setAttributes] = useState<SurveyAttribute[]>([])
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    getSurveyEntry(id!)
      .then(setEntry)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStart() {
    setStarting(true)
    try {
      await startSurvey(id!)
      const attrs = await getSurveyAttributes(id!)
      setAttributes(attrs)
      setScreen('byo')
    } catch {
      setError(true)
    } finally {
      setStarting(false)
    }
  }

  async function handleByoSubmit() {
    setSubmitting(true)
    try {
      await submitByo(id!, selections)
      setScreen('placeholder')
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCount = Object.keys(selections).length

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Laden…</p>
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Diese Studie ist nicht verfügbar.</p>
      </div>
    )
  }

  if (screen === 'welcome') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <SurveyProgress currentPhase={1} />
          <h1 className="text-2xl font-semibold mb-4">{entry.study_name}</h1>
          {entry.welcome_message && (
            <div
              className="prose max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: entry.welcome_message }}
            />
          )}
          <Button onClick={handleStart} disabled={starting}>
            {starting ? 'Laden…' : 'Studie starten'}
          </Button>
        </div>
      </div>
    )
  }

  if (screen === 'byo') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <SurveyProgress currentPhase={2} />

          <h2 className="text-xl font-semibold mb-2">
            {entry.byo_instruction_title ?? 'Ihr Idealprodukt'}
          </h2>
          {entry.byo_instruction_text && (
            <div
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: entry.byo_instruction_text }}
            />
          )}

          <p className="text-sm text-muted-foreground mb-4">
            {selectedCount} / {attributes.length} Merkmale ausgewählt
          </p>

          <div className="flex flex-col gap-4 mb-8">
            {attributes.map((attr) => (
              <div key={attr.id} className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium mb-3">{attr.name}</p>
                <div className="flex flex-wrap gap-2">
                  {attr.levels.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() =>
                        setSelections((prev) => ({ ...prev, [attr.id]: level.id }))
                      }
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-sm transition-colors',
                        selections[attr.id] === level.id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background hover:border-primary/60',
                      )}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setScreen('welcome')}>
              ← Zurück
            </Button>
            <Button
              onClick={handleByoSubmit}
              disabled={selectedCount < attributes.length || submitting}
            >
              {submitting ? 'Speichern…' : 'Weiter →'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <SurveyProgress currentPhase={3} />
        <p className="text-muted-foreground">Screening – wird in Kürze implementiert.</p>
      </div>
    </div>
  )
}
