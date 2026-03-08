import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getStudy, createStudy, updateStudy, type Study } from '@/lib/studies'

export default function StudyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Study['status']>('draft')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    getStudy(id!)
      .then((study) => {
        setName(study.name)
        setDescription(study.description ?? '')
        setStatus(study.status)
      })
      .catch(() => setError('Studie konnte nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [id, isNew])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (isNew) {
        const created = await createStudy({ name, description: description || undefined })
        navigate(`/studies/${created.id}`, { replace: true })
      } else {
        await updateStudy(id!, { name, description: description || undefined, status })
      }
    } catch {
      setError('Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="mx-auto max-w-2xl py-8 text-muted-foreground">Laden…</p>
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/studies')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Zurück
        </button>
        <h1 className="text-2xl font-semibold">
          {isNew ? 'Neue Studie anlegen' : 'Studie bearbeiten'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Beschreibung</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {!isNew && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Study['status'])}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="draft">Entwurf</option>
              <option value="active">Aktiv</option>
              <option value="closed">Geschlossen</option>
            </select>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={saving} className="self-start">
          {saving ? 'Speichern…' : 'Speichern'}
        </Button>
      </form>
    </div>
  )
}
