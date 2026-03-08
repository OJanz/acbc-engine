import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { getStudies, type Study } from '@/lib/studies'

export default function StudiesPage() {
  const navigate = useNavigate()
  const [studies, setStudies] = useState<Study[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getStudies()
      .then(setStudies)
      .catch(() => setError('Studien konnten nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Meine Studien</h1>
        <Button onClick={() => navigate('/studies/new')}>Neue Studie anlegen</Button>
      </div>

      {loading && <p className="text-muted-foreground">Laden…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && studies.length === 0 && (
        <p className="text-muted-foreground">Noch keine Studien vorhanden.</p>
      )}

      <ul className="flex flex-col gap-3">
        {studies.map((study) => (
          <li key={study.id}>
            <button
              onClick={() => navigate(`/studies/${study.id}`)}
              className="w-full rounded-lg border bg-card px-5 py-4 text-left text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span className="font-medium">{study.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
