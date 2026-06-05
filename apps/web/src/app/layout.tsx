import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Kamble — Aprenda inglês com professores ao vivo',
    template: '%s | Kamble',
  },
  description:
    'Plataforma de ensino de inglês com aulas ao vivo, material didático e professores verificados. Aprenda no seu ritmo com turmas personalizadas.',
  keywords: ['inglês', 'aulas de inglês', 'learn english', 'curso de inglês online'],
  openGraph: {
    title: 'Kamble — Aprenda inglês com professores ao vivo',
    description: 'Plataforma de ensino de inglês com aulas ao vivo e professores verificados.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="antialiased bg-[#09090b] text-white">{children}</body>
    </html>
  )
}
