import Link from 'next/link'
import Navbar from '@/components/Navbar'

const features = [
  {
    icon: '🎥',
    title: 'Aulas ao Vivo',
    description: 'Participe de aulas interativas em tempo real com vídeo, chat e lousa compartilhada.',
  },
  {
    icon: '🏆',
    title: 'Professores Verificados',
    description: 'Todos os professores passam por um processo rigoroso de verificação antes de entrar na plataforma.',
  },
  {
    icon: '📚',
    title: 'Material Didático',
    description: 'Acesse PDFs, exercícios e gravações organizadas por aula, disponíveis a qualquer momento.',
  },
  {
    icon: '✏️',
    title: 'Lousa Interativa',
    description: 'O professor pode chamar alunos para resolver exercícios na lousa digital durante a aula.',
  },
  {
    icon: '📊',
    title: 'Acompanhamento',
    description: 'Receba notas, feedbacks e acompanhe seu progresso ao longo das aulas.',
  },
  {
    icon: '📅',
    title: 'Horários Flexíveis',
    description: 'Escolha turmas com horários que se encaixam na sua rotina. Manhã, tarde ou noite.',
  },
]

const levels = [
  { code: 'A1', name: 'Iniciante', desc: 'Primeiros passos no idioma' },
  { code: 'A2', name: 'Básico', desc: 'Conversas simples do dia a dia' },
  { code: 'B1', name: 'Intermediário', desc: 'Expressa ideias com clareza' },
  { code: 'B2', name: 'Interm. Superior', desc: 'Fluência em tópicos complexos' },
  { code: 'C1', name: 'Avançado', desc: 'Comunicação sofisticada' },
  { code: 'C2', name: 'Fluente', desc: 'Domínio completo do inglês' },
]

const steps = [
  { number: '01', title: 'Crie sua conta', description: 'Cadastro gratuito em menos de 2 minutos, sem cartão de crédito.' },
  { number: '02', title: 'Teste seu nível', description: 'Avaliação rápida para encontrar a turma certa para você.' },
  { number: '03', title: 'Entre ao vivo', description: 'Participe da sua primeira aula com professor real — de graça.' },
]

function AppMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow behind */}
      <div className="absolute inset-0 bg-yellow-400/10 rounded-3xl blur-3xl scale-110 pointer-events-none" />

      {/* Browser window */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60" style={{ background: 'rgba(18,18,22,0.95)' }}>
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5" style={{ background: 'rgba(30,30,36,0.95)' }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-zinc-600" />
            <div className="w-3 h-3 rounded-full bg-zinc-600" />
            <div className="w-3 h-3 rounded-full bg-zinc-600" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-zinc-700/50 rounded-md px-3 py-1 text-[11px] text-zinc-500">
              kamble.app/sala/ingles-b1
            </div>
          </div>
        </div>

        {/* Classroom content */}
        <div className="p-4 space-y-3">
          {/* Live bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-[11px] font-medium text-zinc-300">Inglês B1 · Conversação Avançada</span>
            </div>
            <span className="text-[11px] text-zinc-500 tabular-nums font-mono">42:17</span>
          </div>

          {/* Video grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Teacher - big */}
            <div className="col-span-2 aspect-video bg-zinc-800 rounded-xl overflow-hidden relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/15 via-transparent to-transparent" />
              <div className="text-center relative z-10">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-bold text-xl mx-auto mb-2 shadow-lg shadow-yellow-500/30">
                  S
                </div>
                <p className="text-[11px] text-zinc-200 font-medium">Miss Sarah</p>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-0.5 text-[10px] text-yellow-400 font-semibold">
                Professora ✓
              </div>
              <div className="absolute top-2 right-2 bg-yellow-400/10 border border-yellow-400/25 rounded px-1.5 py-0.5 text-[10px] text-yellow-400">
                🎤
              </div>
            </div>

            {/* Students */}
            <div className="flex flex-col gap-2">
              {[
                { name: 'João M.', color: 'from-sky-500/25' },
                { name: 'Ana S.', color: 'from-violet-500/25' },
                { name: '+4 alunos', color: 'from-zinc-600/40' },
              ].map((s) => (
                <div
                  key={s.name}
                  className={`flex-1 min-h-[52px] rounded-lg bg-gradient-to-br ${s.color} to-zinc-800/60 flex items-center justify-center border border-white/5`}
                >
                  <span className="text-[10px] text-zinc-400">{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="bg-zinc-800/40 rounded-xl p-3 space-y-2 border border-white/5">
            {[
              { from: 'Sarah', text: "Let's practice past tense today! 📝", color: 'text-yellow-400' },
              { from: 'João', text: 'I studied this yesterday, ready! 💪', color: 'text-sky-400' },
              { from: 'Ana', text: 'Me too! Can we start? 😊', color: 'text-violet-400' },
            ].map((m) => (
              <div key={m.from} className="flex items-start gap-2">
                <span className={`text-[11px] font-semibold shrink-0 ${m.color}`}>{m.from}:</span>
                <span className="text-[11px] text-zinc-400 leading-snug">{m.text}</span>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {[
              { icon: '🎤', active: true },
              { icon: '📷', active: true },
              { icon: '🖥️', active: false },
              { icon: '✏️', active: false },
            ].map((btn) => (
              <div
                key={btn.icon}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm border transition-colors ${btn.active ? 'bg-zinc-700/70 border-white/10' : 'bg-zinc-800/40 border-white/5'}`}
              >
                {btn.icon}
              </div>
            ))}
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-sm ml-2">
              📞
            </div>
          </div>
        </div>
      </div>

      {/* Floating chips */}
      <div className="absolute -top-4 -right-4 glass rounded-xl px-3 py-2 border border-yellow-400/20 shadow-xl shadow-black/40 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white font-semibold">Ao vivo agora</span>
        </div>
      </div>
      <div className="absolute -bottom-4 -left-4 glass rounded-xl px-3 py-2 border border-white/10 shadow-xl shadow-black/40 backdrop-blur-md">
        <p className="text-[11px] text-zinc-400">Próxima aula</p>
        <p className="text-xs text-white font-semibold">Inglês A2 · 19h00</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Subtle dot-grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Navbar ──────────────────────────────────────────── */}
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-yellow-500/6 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-8">

            {/* ── Left: copy ── */}
            <div className="flex flex-col justify-center animate-fade-up">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-zinc-400 mb-8 w-fit">
                <span className="text-yellow-400 text-base leading-none">✦</span>
                Nova plataforma de inglês ao vivo
              </div>

              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Aprenda inglês
                <br />
                com{' '}
                <span className="gradient-text">professores reais</span>
                <br />
                ao vivo
              </h1>

              <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-md">
                Turmas pequenas, aulas interativas e professores verificados.
                Do iniciante ao fluente — no seu ritmo e horário.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 glow-brand text-base"
                >
                  Começar gratuitamente
                  <span>→</span>
                </Link>
                <Link
                  href="/auth/register?role=teacher"
                  className="inline-flex items-center justify-center glass hover:bg-white/10 text-white font-medium px-8 py-4 rounded-xl transition-all duration-200 text-base"
                >
                  Quero ser professor
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {['Sem mensalidade surpresa', 'Cancele quando quiser', 'Primeira aula grátis'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-zinc-500">
                    <span className="text-yellow-400 font-bold">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: mockup ── */}
            <div className="flex items-center justify-center animate-fade-up delay-200 pb-8 lg:pb-0">
              <AppMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider strip ─────────────────────────────────────── */}
      <div className="border-y border-white/5 py-6 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-3 text-sm text-zinc-600 font-medium">
          {['Aulas ao vivo', 'Turmas pequenas', 'Professores verificados', 'Lousa digital', 'Chat em tempo real', 'Material incluso'].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <span className="w-1 h-1 bg-yellow-400/60 rounded-full" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">Funcionalidades</p>
            <h2 className="text-4xl font-bold mb-4">
              Tudo para você{' '}
              <span className="gradient-text">aprender de verdade</span>
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto text-base">
              Uma plataforma completa que vai além das aulas gravadas — aprenda ao vivo, com interação real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative glass rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-yellow-400/15 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 group-hover:from-yellow-400/5 to-transparent transition-all duration-500 pointer-events-none" />
                <div className="text-3xl mb-4 group-hover:animate-float inline-block">{feature.icon}</div>
                <h3 className="text-base font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-6 bg-zinc-900/60 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">Como funciona</p>
            <h2 className="text-4xl font-bold mb-4">
              Três passos para{' '}
              <span className="gradient-text">começar</span>
            </h2>
            <p className="text-zinc-400">Simples assim. Sem burocracia.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={step.number} className="relative glass rounded-2xl p-8 border border-white/5 group hover:border-yellow-400/15 transition-all duration-300">
                {/* Step connector line (desktop only) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-6 h-px bg-gradient-to-r from-white/10 to-white/5 z-10" />
                )}
                <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-6 group-hover:bg-yellow-400/15 transition-colors">
                  <span className="text-yellow-400 font-bold text-sm">{step.number}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-white">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Levels ───────────────────────────────────────────── */}
      <section id="levels" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">Níveis CEFR</p>
            <h2 className="text-4xl font-bold mb-4">
              Turmas para{' '}
              <span className="gradient-text">todos os níveis</span>
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              Fazemos uma avaliação inicial gratuita para encontrar a turma ideal para você.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {levels.map((level, i) => {
              const intensity = Math.round(10 + i * 8)
              return (
                <div
                  key={level.code}
                  className="group glass rounded-2xl p-5 border border-white/5 hover:border-yellow-400/20 hover:-translate-y-1 transition-all duration-200 cursor-pointer text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-yellow-400/20 transition-colors">
                    <span className="text-yellow-400 font-bold text-xs">{level.code}</span>
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">{level.name}</p>
                  <p className="text-[11px] text-zinc-500 leading-snug">{level.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-zinc-900/60 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="relative glass rounded-3xl p-12 text-center border border-yellow-400/10 animate-pulse-glow overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-amber-500/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="text-5xl mb-6">🚀</div>
              <h2 className="text-4xl font-bold mb-4">
                Pronto para falar inglês com{' '}
                <span className="gradient-text">confiança</span>?
              </h2>
              <p className="text-zinc-400 mb-10 max-w-lg mx-auto leading-relaxed">
                Crie sua conta, faça o teste de nível e entre na sua primeira aula ao vivo —{' '}
                <strong className="text-white">totalmente de graça</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 text-base glow-brand"
                >
                  Criar conta gratuita →
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center glass hover:bg-white/10 text-zinc-300 font-medium px-8 py-4 rounded-xl transition-all duration-200 text-base"
                >
                  Já tenho uma conta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black font-bold text-xs">
              K
            </div>
            <span className="text-sm font-semibold text-zinc-400">Kamble</span>
            <span className="text-sm text-zinc-600 ml-1">© 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-600">
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">Termos</Link>
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacidade</Link>
            <Link href="/contact" className="hover:text-zinc-400 transition-colors">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
