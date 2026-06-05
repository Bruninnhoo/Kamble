import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dashboard — Professor',
  description: 'Gerencie suas turmas, aulas e alunos no Kamble',
}

const todayClasses = [
  {
    id: '1',
    name: 'Inglês B1 — Turma Manhã',
    studentsCount: 8,
    maxStudents: 10,
    scheduledAt: '2026-06-05T09:00:00',
    level: 'B1',
    status: 'SCHEDULED' as const,
  },
  {
    id: '2',
    name: 'Conversação Avançada',
    studentsCount: 5,
    maxStudents: 6,
    scheduledAt: '2026-06-05T14:00:00',
    level: 'C1',
    status: 'SCHEDULED' as const,
  },
]

const pendingSubmissions = [
  { id: '1', studentName: 'Ana Souza', taskTitle: 'Essay: My Daily Routine', submittedAt: '2026-06-04T10:30:00' },
  { id: '2', studentName: 'Bruno Lima', taskTitle: 'Reading Comprehension', submittedAt: '2026-06-04T15:00:00' },
  { id: '3', studentName: 'Carla Mendes', taskTitle: 'Essay: My Daily Routine', submittedAt: '2026-06-04T18:20:00' },
]

const stats = [
  { label: 'Turmas ativas', value: '4', icon: '📚' },
  { label: 'Alunos', value: '32', icon: '🎓' },
  { label: 'Aulas este mês', value: '18', icon: '🎥' },
  { label: 'Correções pendentes', value: '3', icon: '✏️' },
]

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Agora há pouco'
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)}d`
}

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* ── Sidebar ──────────────────────────────────────── */}
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
            { href: '/dashboard/teacher', label: 'Início', icon: '🏠', active: true },
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                item.active
                  ? 'bg-lime-500/15 text-lime-400 font-medium'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-400 to-sky-400 flex items-center justify-center text-black font-bold text-xs">
              C
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-zinc-200 truncate">Carlos Oliveira</div>
              <div className="text-xs text-zinc-500">Professor · Aprovado</div>
            </div>
          </div>
          <Link
            href="/auth/login"
            id="sidebar-logout-btn"
            className="mt-2 flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-600 hover:text-red-400 hover:bg-red-400/5 transition-all w-full"
          >
            <span>🚪</span> Sair
          </Link>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Olá, Carlos! 👨‍🏫</h1>
            <p className="text-zinc-500 text-sm">Você tem {todayClasses.length} aulas agendadas para hoje.</p>
          </div>
          <Link
            href="/dashboard/teacher/classes/new"
            id="create-class-btn"
            className="bg-lime-500/15 hover:bg-lime-500 text-lime-400 hover:text-black font-medium px-4 py-2 rounded-xl text-sm transition-all duration-200"
          >
            + Nova turma
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-5">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #a3e635, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stat.value}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's classes */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold">Aulas de hoje</h2>
              <Link href="/dashboard/teacher/classes" id="view-all-classes-link" className="text-xs text-lime-400 hover:text-lime-300 transition-colors">
                Ver todas →
              </Link>
            </div>

            <div className="space-y-3">
              {todayClasses.map((cls) => (
                <div key={cls.id} className="p-4 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/70 transition-colors group">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-200">{cls.name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {formatTime(cls.scheduledAt)} · {cls.studentsCount}/{cls.maxStudents} alunos
                      </div>
                    </div>
                    <span className="shrink-0 text-xs bg-zinc-700 text-zinc-400 px-2 py-1 rounded-md font-medium">
                      {cls.level}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/classes/${cls.id}/live`}
                      id={`start-class-${cls.id}-btn`}
                      className="flex-1 text-center text-xs bg-lime-500/15 text-lime-400 hover:bg-lime-500 hover:text-black px-3 py-1.5 rounded-lg transition-all duration-200 font-medium"
                    >
                      🎥 Iniciar aula
                    </Link>
                    <Link
                      href={`/classes/${cls.id}`}
                      id={`manage-class-${cls.id}-btn`}
                      className="text-xs text-zinc-600 hover:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-200"
                    >
                      Gerenciar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending corrections */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold">Correções pendentes</h2>
              <Link href="/dashboard/teacher/assignments" id="view-all-assignments-link" className="text-xs text-lime-400 hover:text-lime-300 transition-colors">
                Ver todas →
              </Link>
            </div>

            <div className="space-y-3">
              {pendingSubmissions.map((sub) => (
                <div key={sub.id} className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/70 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300 shrink-0">
                    {sub.studentName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-200 truncate">{sub.studentName}</div>
                    <div className="text-xs text-zinc-500 truncate">{sub.taskTitle}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-xs text-zinc-600">{timeAgo(sub.submittedAt)}</span>
                    <Link
                      href={`/assignments/submissions/${sub.id}`}
                      id={`correct-submission-${sub.id}-btn`}
                      className="text-xs bg-amber-400/10 text-amber-400 hover:bg-amber-400 hover:text-black px-2 py-1 rounded-md transition-all duration-200 font-medium"
                    >
                      Corrigir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
