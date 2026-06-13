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

// ── Tipos de turmas ────────────────────────────────────────────────────────

export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export interface ClassData {
  id: string
  name: string
  teacherId: string
  level: EnglishLevel
  maxStudents: number
  status: string
  createdAt: string
  studentsCount?: number
  teacherName?: string
}

export interface CreateClassPayload {
  name: string
  level: EnglishLevel
  maxStudents?: number
}

// ── Helper autenticado ─────────────────────────────────────────────────────

async function authGet<T>(path: string): Promise<T> {
  const token = getAccessToken()
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  const data = await res.json()
  if (!res.ok) {
    const err = data as ApiError
    const msg = Array.isArray(err.message) ? err.message[0] : err.message
    throw new Error(msg ?? 'Erro inesperado')
  }
  return data as T
}

async function authPost<T>(path: string, body: unknown): Promise<T> {
  const token = getAccessToken()
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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

// ── Endpoints de turmas ────────────────────────────────────────────────────

export const classesApi = {
  create: (payload: CreateClassPayload) =>
    authPost<ClassData>('/api/v1/classes', payload),

  myClasses: () =>
    authGet<ClassData[]>('/api/v1/classes/my'),

  enrolledClasses: () =>
    authGet<ClassData[]>('/api/v1/classes/enrolled'),

  findById: (id: string) =>
    authGet<ClassData>(`/api/v1/classes/${id}`),
}

// ── Tipos de sessões ───────────────────────────────────────────────────────

export type SessionStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'

export interface SessionData {
  id: string
  classId: string
  teacherId: string
  scheduledAt: string
  startedAt: string | null
  endedAt: string | null
  status: SessionStatus
  recordingUrl: string | null
  createdAt: string
}

export interface CreateSessionPayload {
  classId: string
  scheduledAt: string // ISO 8601
}

async function authPatch<T>(path: string): Promise<T> {
  const token = getAccessToken()
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  const data = await res.json()
  if (!res.ok) {
    const err = data as ApiError
    const msg = Array.isArray(err.message) ? err.message[0] : err.message
    throw new Error(msg ?? 'Erro inesperado')
  }
  return data as T
}

// ── Endpoints de sessões ───────────────────────────────────────────────────

export const sessionsApi = {
  create: (payload: CreateSessionPayload) =>
    authPost<SessionData>('/api/v1/sessions', payload),

  byClass: (classId: string) =>
    authGet<SessionData[]>(`/api/v1/classes/${classId}/sessions`),

  start: (id: string) =>
    authPatch<SessionData>(`/api/v1/sessions/${id}/start`),

  end: (id: string) =>
    authPatch<SessionData>(`/api/v1/sessions/${id}/end`),
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
