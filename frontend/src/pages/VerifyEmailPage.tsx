import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { verifyEmail } from '@/lib/auth'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  if (status === 'loading') {
    return (
      <div className="mx-auto mt-16 max-w-sm text-center">
        <p className="text-muted-foreground">E-Mail wird verifiziert…</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="mx-auto mt-16 max-w-sm text-center">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">E-Mail bestätigt</h2>
        <p className="mb-6 text-muted-foreground">
          Deine E-Mail-Adresse wurde erfolgreich verifiziert.
        </p>
        <Link to="/login" className="text-primary hover:underline">
          Zum Login
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-16 max-w-sm text-center">
      <h2 className="mb-4 text-2xl font-semibold text-destructive">Fehler</h2>
      <p className="text-muted-foreground">
        Der Verifikations-Link ist ungültig oder abgelaufen.
      </p>
    </div>
  )
}
