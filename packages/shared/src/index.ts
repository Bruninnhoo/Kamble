// ─── User & Auth ───────────────────────────────────────────────────────────────

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN'

export type TeacherStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
}

export interface Student extends User {
  role: 'STUDENT'
  level?: EnglishLevel
  enrolledClasses: string[] // class IDs
}

export interface Teacher extends User {
  role: 'TEACHER'
  status: TeacherStatus
  bio?: string
  classes: string[] // class IDs
}

// ─── English Level ─────────────────────────────────────────────────────────────

export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

// ─── Classes ───────────────────────────────────────────────────────────────────

export type ClassStatus = 'ACTIVE' | 'INACTIVE' | 'FULL'

export interface Class {
  id: string
  name: string
  teacherId: string
  level: EnglishLevel
  schedule: ClassSchedule[]
  maxStudents: number
  status: ClassStatus
  createdAt: string
}

export interface ClassSchedule {
  dayOfWeek: number // 0 = Sunday
  startTime: string // HH:mm
  durationMinutes: number
}

// ─── Sessions (Live Classes) ───────────────────────────────────────────────────

export type SessionStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'

export interface Session {
  id: string
  classId: string
  teacherId: string
  scheduledAt: string
  startedAt?: string
  endedAt?: string
  status: SessionStatus
  recordingUrl?: string
}

// ─── Assignments & Tests ───────────────────────────────────────────────────────

export type AssignmentStatus = 'OPEN' | 'SUBMITTED' | 'GRADED'

export interface Assignment {
  id: string
  classId: string
  title: string
  description: string
  dueDate: string
  createdAt: string
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  fileUrl?: string
  content?: string
  grade?: number
  feedback?: string
  submittedAt: string
  status: AssignmentStatus
}

// ─── Payments (Mock) ───────────────────────────────────────────────────────────

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'FAILED' | 'REFUNDED'

export interface Payment {
  id: string
  studentId: string
  classId: string
  amount: number // in cents
  currency: 'BRL'
  status: PaymentStatus
  createdAt: string
  paidAt?: string
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}

// ─── Auth Tokens ───────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: 'STUDENT' | 'TEACHER'
}
