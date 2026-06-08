'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { classesApi, EnglishLevel } from '@/lib/api'

const LEVELS: EnglishLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function NewClassPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [level, setLevel] = useState<EnglishLevel>('B1')
  const [maxStudents, setMaxStudents] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const role = localStorage.getItem('kamble_user_role')
    if (role !== 'TEACHER') router.replace('/auth/login')
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError('')

    try {
      await classesApi.create({ name: name.trim(), level, maxStudents })
      router.push('/dashboard/teacher')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar turma')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/dashboard/teacher"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
          >
            ← Voltar ao dashboard
          </Link>
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="mb-6">
            <div className="w-10 h-10 rounded-xl bg-lime-500/15 flex items-center justify-center text-lime-400 text-xl mb-4">
              📚
            </div>
            <h1 className="text-xl font-bold mb-1">Nova turma</h1>
            <p className="text-zinc-500 text-sm">Preencha os dados para criar uma nova turma.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Nome da turma
              </label>
              <input
                id="class-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Inglês B1 — Turma Manhã"
                required
                className="w-full bg-zinc-800/60 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-lime-500/40 focus:bg-zinc-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Nível
              </label>
              <div className="grid grid-cols-6 gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    id={`level-${l}-btn`}
                    onClick={() => setLevel(l)}
                    className={`py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      level === l
                        ? 'bg-lime-500/20 text-lime-400 border border-lime-500/40'
                        : 'bg-zinc-800/60 text-zinc-500 border border-white/5 hover:text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Máximo de alunos: <span className="text-lime-400">{maxStudents}</span>
              </label>
              <input
                id="max-students-input"
                type="range"
                min={1}
                max={30}
                value={maxStudents}
                onChange={(e) => setMaxStudents(Number(e.target.value))}
                className="w-full accent-lime-400"
              />
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>1</span>
                <span>30</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              id="create-class-submit-btn"
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-lime-500/15 text-lime-400 hover:bg-lime-500 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Criando...' : 'Criar turma'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
