import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPassword } from '@/lib/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword(email)
    } finally {
      // Always show success to avoid email enumeration
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="mx-auto mt-16 max-w-sm text-center">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">E-Mail gesendet</h2>
        <p className="text-muted-foreground">
          Falls ein Konto mit dieser E-Mail-Adresse existiert, erhältst du in Kürze einen
          Reset-Link.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h2 className="mb-2 text-2xl font-semibold text-foreground">Passwort zurücksetzen</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Gib deine E-Mail-Adresse ein. Du erhältst einen Link zum Zurücksetzen deines Passworts.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Senden…' : 'Link anfordern'}
        </Button>
      </form>
    </div>
  )
}
