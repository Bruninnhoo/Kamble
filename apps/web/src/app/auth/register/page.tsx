import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Criar conta',
  description: 'Crie sua conta no Kamble e comece a aprender inglês com professores ao vivo.',
}

const roles = [
  {
    id: 'STUDENT',
    label: 'Sou aluno',
    description: 'Quero aprender inglês',
    icon: '🎓',
  },
  {
    id: 'TEACHER',
    label: 'Sou professor',
    description: 'Quero dar aulas na plataforma',
    icon: '👨‍🏫',
  },
]

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

        <form id="register-form" className="space-y-5">
          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">Você é…</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => (
                <label
                  key={role.id}
                  htmlFor={`role-${role.id}`}
                  className="relative flex flex-col items-center gap-2 p-4 rounded-xl border border-zinc-700 bg-zinc-800/40 cursor-pointer hover:border-sky-500/50 hover:bg-sky-500/5 transition-all duration-200 group has-[:checked]:border-sky-500 has-[:checked]:bg-sky-500/10"
                >
                  <input
                    id={`role-${role.id}`}
                    type="radio"
                    name="role"
                    value={role.id}
                    defaultChecked={role.id === 'STUDENT'}
                    className="sr-only"
                  />
                  <span className="text-2xl">{role.icon}</span>
                  <div className="text-center">
                    <div className="text-sm font-medium text-zinc-200">{role.label}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{role.description}</div>
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
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Repita a senha"
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Criar conta gratuita
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
