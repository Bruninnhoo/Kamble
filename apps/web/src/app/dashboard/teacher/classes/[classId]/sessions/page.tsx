'use client'

import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { classesApi, sessionsApi, ClassData, SessionData } from '@/lib/api'

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusBadge({ status }: { status: SessionData['status'] }) {
  const map = {
    SCHEDULED: { label: 'Agendada', cls: 'bg-amber-500/15 text-amber-400' },
    LIVE: { label: 'Ao vivo', cls: 'bg-red-500/15 text-red-400' },
    ENDED: { label: 'Encerrada', cls: 'bg-zinc-700/60 text-zinc-500' },
    CANCELLED: { label: 'Cancelada', cls: 'bg-zinc-800/60 text-zinc-600' },
  }
  const { label, cls } = map[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>
      {status === 'LIVE' && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
      )}
      {label}
    </span>
  )
}

// ── Modal de criação ───────────────────────────────────────────────────────

function CreateSessionModal({
  classId,
  onClose,
  onCreated,
}: {
  classId: string
  onClose: () => void
  onCreated: (session: SessionData) => void
}) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !time) {
      setError('Preencha a data e o horário.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString()
      const session = await sessionsApi.create({ classId, scheduledAt })
      onCreated(session)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar sessão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 p-8 shadow-2xl"
        style={{ background: 'rgba(18,18,22,0.98)' }}
      >
        <h2 className="text-lg font-bold mb-1">Nova sessão</h2>
        <p className="text-sm text-zinc-500 mb-6">Agende uma nova aula ao vivo para a turma.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5" htmlFor="session-date">
              Data
            </label>
            <input
              id="session-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full bg-zinc-800/60 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-lime-500/50 focus:bg-zinc-800 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5" htmlFor="session-time">
              Horário
            </label>
            <input
              id="session-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full bg-zinc-800/60 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-lime-500/50 focus:bg-zinc-800 transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              id="cancel-session-btn"
              className="flex-1 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-700/60 transition-all border border-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="confirm-create-session-btn"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-lime-500/20 text-lime-400 hover:bg-lime-500 hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Agendando...' : 'Agendar sessão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Session card ───────────────────────────────────────────────────────────

function SessionCard({
  session,
  onEnter,
}: {
  session: SessionData
  onEnter: (id: string) => void
}) {
  const canEnter = session.status === 'SCHEDULED' || session.status === 'LIVE'

  return (
    <div className="p-4 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        {/* Date block */}
        <div className="shrink-0 w-12 h-12 rounded-xl bg-zinc-700/50 flex flex-col items-center justify-center text-center border border-white/5">
          <span className="text-[10px] text-zinc-500 leading-none uppercase">
            {new Date(session.scheduledAt).toLocaleDateString('pt-BR', { month: 'short' })}
          </span>
          <span className="text-base font-bold text-zinc-200 leading-none mt-0.5">
            {new Date(session.scheduledAt).getDate()}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-zinc-200">
              {formatDate(session.scheduledAt)}
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-sm text-zinc-400">{formatTime(session.scheduledAt)}</span>
          </div>
          <div className="mt-1">
            <StatusBadge status={session.status} />
          </div>
        </div>
      </div>

      {canEnter && (
        <button
          id={`enter-session-${session.id}-btn`}
          onClick={() => onEnter(session.id)}
          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            session.status === 'LIVE'
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
              : 'bg-lime-500/15 text-lime-400 hover:bg-lime-500 hover:text-black'
          }`}
        >
          {session.status === 'LIVE' ? '🔴 Entrar ao vivo' : '▶ Entrar'}
        </button>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function ClassSessionsPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string

  const [cls, setCls] = useState<ClassData | null>(null)
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const name = localStorage.getItem('kamble_user_name') ?? ''
    const role = localStorage.getItem('kamble_user_role')
    if (!name || role !== 'TEACHER') {
      router.replace('/auth/login')
      return
    }
    setUserName(name)

    Promise.all([
      classesApi.findById(classId),
      sessionsApi.byClass(classId),
    ])
      .then(([classData, sessionList]) => {
        setCls(classData)
        setSessions(sessionList)
      })
      .catch(() => router.replace('/dashboard/teacher'))
      .finally(() => setLoading(false))
  }, [classId, router])

  function handleSessionCreated(newSession: SessionData) {
    setSessions((prev) =>
      [...prev, newSession].sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      ),
    )
    setShowModal(false)
  }

  function handleEnter(sessionId: string) {
    router.push(`/session/${sessionId}`)
  }

  const initial = userName.charAt(0).toUpperCase()

  const upcoming = sessions.filter((s) => s.status === 'SCHEDULED' || s.status === 'LIVE')
  const past = sessions.filter((s) => s.status === 'ENDED' || s.status === 'CANCELLED')

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <div className="fixed inset-y-0 left-0 w-64 glass border-r border-white/5 flex flex-col z-40">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-lime-400 flex items-center justify-center text-black font-bold text-sm">
              K
            </div>
            <span className="font-semibold text-lg">Kamble</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/dashboard/teacher', label: 'Início', icon: '🏠' },
            { href: '/dashboard/teacher/classes', label: 'Minhas Turmas', icon: '📚' },
            { href: '/dashboard/teacher/students', label: 'Alunos', icon: '🎓' },
            { href: '/dashboard/teacher/assignments', label: 'Tarefas', icon: '📝' },
            { href: '/dashboard/teacher/materials', label: 'Materiais', icon: '📂' },
            { href: '/dashboard/teacher/earnings', label: 'Ganhos', icon: '💰' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-400 to-sky-400 flex items-center justify-center text-black font-bold text-xs">
              {initial || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-zinc-200 truncate">{userName || '—'}</div>
              <div className="text-xs text-zinc-500">Professor</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="ml-64 p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-600 mb-6">
          <Link href="/dashboard/teacher" className="hover:text-zinc-400 transition-colors">
            Dashboard
          </Link>
          <span>›</span>
          <span className="text-zinc-400">
            {loading ? '...' : cls?.name ?? 'Turma'}
          </span>
          <span>›</span>
          <span className="text-zinc-300">Sessões</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {loading ? (
                <span className="inline-block h-8 w-48 rounded-lg bg-zinc-800/60 animate-pulse" />
              ) : (
                `${cls?.name} — Sessões`
              )}
            </h1>
            <p className="text-zinc-500 text-sm">
              {loading
                ? 'Carregando...'
                : `${upcoming.length} sessão${upcoming.length !== 1 ? 'ões' : ''} agendada${upcoming.length !== 1 ? 's' : ''} · Nível ${cls?.level}`}
            </p>
          </div>

          <button
            id="open-create-session-btn"
            onClick={() => setShowModal(true)}
            disabled={loading}
            className="shrink-0 bg-lime-500/15 hover:bg-lime-500 text-lime-400 hover:text-black font-medium px-4 py-2 rounded-xl text-sm transition-all duration-200 disabled:opacity-50"
          >
            + Nova sessão
          </button>
        </div>

        {/* Sessions list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-zinc-800/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold text-sm text-zinc-400 uppercase tracking-wide mb-4">
                Próximas & ao vivo
              </h2>
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="text-3xl mb-3">📅</div>
                  <p className="text-zinc-400 font-medium mb-1">Nenhuma sessão agendada</p>
                  <p className="text-zinc-600 text-sm mb-4">
                    Crie uma sessão para os alunos poderem entrar.
                  </p>
                  <button
                    id="empty-create-session-btn"
                    onClick={() => setShowModal(true)}
                    className="bg-lime-500/15 hover:bg-lime-500 text-lime-400 hover:text-black font-medium px-4 py-2 rounded-xl text-sm transition-all duration-200"
                  >
                    + Criar primeira sessão
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((s) => (
                    <SessionCard key={s.id} session={s} onEnter={handleEnter} />
                  ))}
                </div>
              )}
            </div>

            {/* Past */}
            {past.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h2 className="font-semibold text-sm text-zinc-400 uppercase tracking-wide mb-4">
                  Histórico
                </h2>
                <div className="space-y-3">
                  {past.map((s) => (
                    <SessionCard key={s.id} session={s} onEnter={handleEnter} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Modal ────────────────────────────────────────────── */}
      {showModal && (
        <CreateSessionModal
          classId={classId}
          onClose={() => setShowModal(false)}
          onCreated={handleSessionCreated}
        />
      )}
    </div>
  )
}
