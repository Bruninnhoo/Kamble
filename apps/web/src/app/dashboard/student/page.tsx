'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { clearSession, classesApi, ClassData } from '@/lib/api'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function StudentDashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const name = localStorage.getItem('kamble_user_name')
    const role = localStorage.getItem('kamble_user_role')

    if (!name || role !== 'STUDENT') {
      router.replace('/auth/login')
      return
    }

    setUserName(name)

    classesApi.enrolledClasses()
      .then(setClasses)
      .catch(() => setClasses([]))
      .finally(() => setLoading(false))
  }, [router])

  async function handleLogout() {
    clearSession()
    router.push('/auth/login')
  }

  const firstName = userName.split(' ')[0]
  const initial = userName.charAt(0).toUpperCase()

  const stats = [
    { label: 'Turmas matriculadas', value: String(classes.length), icon: '📚' },
    { label: 'Tarefas entregues', value: '—', icon: '✅' },
    { label: 'Horas estudadas', value: '—', icon: '⏱️' },
    { label: 'Nível atual', value: classes[0]?.level ?? '—', icon: '📊' },
  ]

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
            { href: '/dashboard/student', label: 'Início', icon: '🏠', active: true },
            { href: '/dashboard/student/classes', label: 'Minhas Turmas', icon: '📚' },
            { href: '/dashboard/student/assignments', label: 'Tarefas', icon: '📝' },
            { href: '/dashboard/student/materials', label: 'Materiais', icon: '📂' },
            { href: '/dashboard/student/progress', label: 'Progresso', icon: '📈' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                item.active
                  ? 'bg-sky-500/15 text-sky-400 font-medium'
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-lime-400 flex items-center justify-center text-black font-bold text-xs">
              {initial || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-zinc-200 truncate">{userName || '—'}</div>
              <div className="text-xs text-zinc-500">Aluno</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            id="sidebar-logout-btn"
            className="mt-2 flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-600 hover:text-red-400 hover:bg-red-400/5 transition-all w-full"
          >
            <span>🚪</span> Sair
          </button>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">
            {firstName ? `${getGreeting()}, ${firstName}! 👋` : ''}
          </h1>
          <p className="text-zinc-500 text-sm">Aqui está o resumo das suas aulas e tarefas.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-5">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold gradient-text mb-1">
                {loading ? '—' : stat.value}
              </div>
              <div className="text-xs text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Classes */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Minhas turmas</h2>
            <Link
              href="/dashboard/student/classes"
              id="view-all-classes-link"
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
            >
              Ver todas →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-zinc-800/40 animate-pulse" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3">🎓</div>
              <p className="text-zinc-400 font-medium mb-1">Nenhuma turma ainda</p>
              <p className="text-zinc-600 text-sm">Você ainda não está matriculado em nenhuma turma.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/70 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400 font-bold text-xs shrink-0">
                    {cls.level}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-200 truncate">{cls.name}</div>
                    {cls.teacherName && (
                      <div className="text-xs text-zinc-500">Prof. {cls.teacherName}</div>
                    )}
                    <div className="text-xs text-zinc-600 mt-0.5">
                      {cls.studentsCount ?? 0}/{cls.maxStudents} alunos
                    </div>
                  </div>
                  <Link
                    href={`/classes/${cls.id}`}
                    id={`view-class-${cls.id}-btn`}
                    className="shrink-0 text-xs bg-sky-500/15 text-sky-400 hover:bg-sky-500 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    Ver turma
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
