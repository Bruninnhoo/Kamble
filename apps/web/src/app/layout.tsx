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
    'Sala de aula de inglês ao vivo no navegador: vídeo, chat, livro em PDF e lousa sincronizados.',
  keywords: ['inglês', 'aulas de inglês', 'learn english', 'curso de inglês online'],
  openGraph: {
    title: 'Kamble — Aprenda inglês com professores ao vivo',
    description: 'Sala de aula de inglês ao vivo no navegador: vídeo, chat, livro em PDF e lousa sincronizados.',
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
