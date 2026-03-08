import { apiFetch } from './api'

export interface UserProfile {
  id: string
  email: string
  role: 'admin' | 'researcher' | 'participant'
  is_active: boolean
  is_verified: boolean
  created_at: string
}

// FastAPI-Users login expects form-encoded data (username + password)
export async function login(email: string, password: string): Promise<void> {
  const body = new URLSearchParams({ username: email, password })
  const res = await fetch('/api/v1/auth/cookie/login', {
    method: 'POST',
    credentials: 'include',
    body,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => null)
    throw { status: res.status, detail }
  }
}

export async function logout(): Promise<void> {
  await apiFetch('/api/v1/auth/cookie/logout', { method: 'POST' })
}

export async function getMe(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/v1/users/me')
}

export async function forgotPassword(email: string): Promise<void> {
  await apiFetch('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiFetch('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}

export async function verifyEmail(token: string): Promise<void> {
  await apiFetch('/api/v1/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}
