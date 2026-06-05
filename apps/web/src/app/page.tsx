import Link from 'next/link'

const stats = [
  { value: '500+', label: 'Alunos ativos' },
  { value: '30+', label: 'Professores verificados' },
  { value: '4.9★', label: 'Avaliação média' },
  { value: '95%', label: 'Taxa de aprovação' },
]

const features = [
  {
    icon: '🎥',
    title: 'Aulas ao Vivo',
    description:
      'Participe de aulas interativas em tempo real com vídeo, chat e lousa compartilhada.',
  },
  {
    icon: '🏆',
    title: 'Professores Verificados',
    description:
      'Todos os professores passam por um processo rigoroso de verificação antes de entrar na plataforma.',
  },
  {
    icon: '📚',
    title: 'Material Didático',
    description:
      'Acesse PDFs, exercícios e gravações organizadas por aula, disponíveis a qualquer momento.',
  },
  {
    icon: '✏️',
    title: 'Lousa Interativa',
    description:
      'O professor pode chamar alunos para resolver exercícios na lousa digital durante a aula.',
  },
  {
    icon: '📊',
    title: 'Acompanhamento',
    description: 'Receba notas, feedbacks e acompanhe seu progresso ao longo das aulas.',
  },
  {
    icon: '📅',
    title: 'Horários Flexíveis',
    description:
      'Escolha turmas com horários que se encaixam na sua rotina. Manhã, tarde ou noite.',
  },
]

const levels = [
  { code: 'A1', name: 'Iniciante', color: 'from-green-500/20 to-green-500/5', badge: 'bg-green-500/20 text-green-400' },
  { code: 'A2', name: 'Básico', color: 'from-teal-500/20 to-teal-500/5', badge: 'bg-teal-500/20 text-teal-400' },
  { code: 'B1', name: 'Intermediário', color: 'from-sky-500/20 to-sky-500/5', badge: 'bg-sky-500/20 text-sky-400' },
  { code: 'B2', name: 'Interm. Superior', color: 'from-blue-500/20 to-blue-500/5', badge: 'bg-blue-500/20 text-blue-400' },
  { code: 'C1', name: 'Avançado', color: 'from-violet-500/20 to-violet-500/5', badge: 'bg-violet-500/20 text-violet-400' },
  { code: 'C2', name: 'Fluente', color: 'from-purple-500/20 to-purple-500/5', badge: 'bg-purple-500/20 text-purple-400' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-lime-400 flex items-center justify-center text-black font-bold text-sm">
              K
            </div>
            <span className="font-semibold text-lg tracking-tight">Kamble</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <Link href="#features" className="hover:text-white transition-colors">Funcionalidades</Link>
            <Link href="#levels" className="hover:text-white transition-colors">Níveis</Link>
            <Link href="#teachers" className="hover:text-white transition-colors">Professores</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              id="nav-login-btn"
              className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2"
            >
              Entrar
            </Link>
            <Link
              href="/auth/register"
              id="nav-register-btn"
              className="text-sm bg-sky-500 hover:bg-sky-400 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-lime-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-zinc-400 mb-8 animate-fade-up">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Aulas ao vivo acontecendo agora
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6 animate-fade-up delay-100">
            Aprenda inglês com
            <br />
            <span className="gradient-text">professores ao vivo</span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 animate-fade-up delay-200">
            Turmas pequenas, aulas interativas e professores verificados. Do iniciante ao fluente,
            no seu ritmo e horário.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
            <Link
              href="/auth/register"
              id="hero-cta-primary"
              className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 glow-brand text-lg"
            >
              Começar gratuitamente →
            </Link>
            <Link
              href="/auth/register?role=teacher"
              id="hero-cta-teacher"
              className="w-full sm:w-auto glass hover:bg-white/10 text-white font-medium px-8 py-4 rounded-xl transition-all duration-200 text-lg"
            >
              Quero ser professor
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 animate-fade-up delay-400">
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Tudo que você precisa para{' '}
              <span className="gradient-text">aprender de verdade</span>
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Uma plataforma completa que vai além das aulas gravadas — aqui você aprende ao vivo,
              com interação real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass rounded-2xl p-6 hover:bg-white/[0.08] transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="text-4xl mb-4 group-hover:animate-float inline-block">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Levels ───────────────────────────────────────────── */}
      <section id="levels" className="py-24 px-6 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Turmas para <span className="gradient-text">todos os níveis</span>
            </h2>
            <p className="text-zinc-400">
              Fazemos uma avaliação inicial para colocar você na turma certa.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {levels.map((level) => (
              <div
                key={level.code}
                className={`rounded-2xl bg-gradient-to-b ${level.color} border border-white/5 p-5 text-center hover:scale-105 transition-transform duration-200 cursor-pointer`}
              >
                <div className={`inline-block text-xs font-bold px-2 py-1 rounded-md mb-3 ${level.badge}`}>
                  {level.code}
                </div>
                <div className="text-sm font-medium text-zinc-200">{level.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 animate-pulse-glow">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para falar inglês com <span className="gradient-text">confiança</span>?
          </h2>
          <p className="text-zinc-400 mb-8">
            Entre em contato com um professor hoje e descubra qual turma é ideal para você.
          </p>
          <Link
            href="/auth/register"
            id="footer-cta-btn"
            className="inline-block bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-lime-400 text-white font-semibold px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 text-lg"
          >
            Criar conta gratuita →
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-sky-400 to-lime-400 flex items-center justify-center text-black font-bold text-xs">
              K
            </div>
            <span>Kamble © 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">Termos</Link>
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacidade</Link>
            <Link href="/contact" className="hover:text-zinc-400 transition-colors">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
