'use client'

import { useState, FormEvent, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi, saveSession } from '@/lib/api'

const roles = [
  { id: 'STUDENT' as const, label: 'Sou aluno', description: 'Quero aprender inglês', icon: '🎓' },
  { id: 'TEACHER' as const, label: 'Sou professor', description: 'Quero dar aulas na plataforma', icon: '👨‍🏫' },
]

// ─── Componente interno que usa useSearchParams ───────────────────────────────
function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pré-seleciona o papel via ?role=teacher (vindo da landing page)
  const initialRole = searchParams.get('role')?.toUpperCase() === 'TEACHER' ? 'TEACHER' : 'STUDENT'

  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>(initialRole)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Atualiza o papel se o query param mudar
  useEffect(() => {
    const r = searchParams.get('role')?.toUpperCase()
    if (r === 'TEACHER' || r === 'STUDENT') setRole(r)
  }, [searchParams])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    setLoading(true)

    try {
      const data = await authApi.register(name, email, password, role)
      saveSession(data)

      if (data.user.role === 'TEACHER') {
        router.push('/dashboard/teacher')
      } else {
        router.push('/dashboard/student')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form id="register-form" onSubmit={handleSubmit} className="space-y-5">
      {/* Seletor de papel */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">Você é…</label>
        <div className="grid grid-cols-2 gap-3">
          {roles.map((r) => (
            <label
              key={r.id}
              htmlFor={`role-${r.id}`}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                role === r.id
                  ? 'border-sky-500 bg-sky-500/10'
                  : 'border-zinc-700 bg-zinc-800/40 hover:border-sky-500/50 hover:bg-sky-500/5'
              }`}
            >
              <input
                id={`role-${r.id}`}
                type="radio"
                name="role"
                value={r.id}
                checked={role === r.id}
                onChange={() => setRole(r.id)}
                className="sr-only"
              />
              <span className="text-2xl">{r.icon}</span>
              <div className="text-center">
                <div className="text-sm font-medium text-zinc-200">{r.label}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{r.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Nome completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="João Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Confirmar senha
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Repita a senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div
          id="register-error"
          role="alert"
          className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl"
        >
          <span aria-hidden>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <button
        id="register-submit-btn"
        type="submit"
        disabled={loading}
        className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Criando conta...
          </>
        ) : (
          'Criar conta gratuita'
        )}
      </button>

      <p className="text-xs text-zinc-600 text-center">
        Ao criar sua conta, você concorda com os{' '}
        <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors underline">
          Termos de Uso
        </Link>{' '}
        e{' '}
        <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </form>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-lime-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-lime-400 flex items-center justify-center text-black font-bold text-sm">
            K
          </div>
          <span className="font-semibold text-lg">Kamble</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Crie sua conta</h1>
          <p className="text-zinc-400">Comece sua jornada no inglês hoje mesmo.</p>
        </div>

        {/* Suspense necessário por causa do useSearchParams */}
        <Suspense fallback={<div className="h-96 animate-pulse bg-zinc-800/40 rounded-2xl" />}>
          <RegisterForm />
        </Suspense>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Já tem uma conta?{' '}
          <Link
            href="/auth/login"
            id="go-to-login-link"
            className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
