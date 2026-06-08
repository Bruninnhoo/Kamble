/**
 * Cliente HTTP centralizado para a API Kamble.
 * Todas as chamadas de auth passam por aqui.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

// ── Tipos de resposta ──────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TEACHER'
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser
}

export interface ApiError {
  message: string | string[]
  statusCode: number
  error?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    const err = data as ApiError
    const msg = Array.isArray(err.message) ? err.message[0] : err.message
    throw new Error(msg ?? 'Erro inesperado')
  }

  return data as T
}

// ── Salvar / limpar sessão no localStorage ─────────────────────────────────

export function saveSession(data: AuthResponse) {
  localStorage.setItem('kamble_access_token', data.accessToken)
  localStorage.setItem('kamble_refresh_token', data.refreshToken)
  localStorage.setItem('kamble_user_id', data.user.id)
  localStorage.setItem('kamble_user_role', data.user.role)
  localStorage.setItem('kamble_user_name', data.user.name)
}

export function clearSession() {
  ;['kamble_access_token', 'kamble_refresh_token', 'kamble_user_id', 'kamble_user_role', 'kamble_user_name'].forEach(
    (k) => localStorage.removeItem(k),
  )
}

export function getAccessToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('kamble_access_token') : null
}

export function getRefreshToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('kamble_refresh_token') : null
}

// ── Endpoints de autenticação ──────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    post<AuthResponse>('/api/v1/auth/login', { email, password }),

  register: (name: string, email: string, password: string, role: 'STUDENT' | 'TEACHER') =>
    post<AuthResponse>('/api/v1/auth/register', { name, email, password, role }),

  refresh: (refreshToken: string) =>
    post<AuthTokens>('/api/v1/auth/refresh', { refreshToken }),

  logout: async (refreshToken: string) => {
    await post('/api/v1/auth/logout', { refreshToken })
    clearSession()
  },
}
