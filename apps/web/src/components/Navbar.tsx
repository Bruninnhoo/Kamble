'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'navbar-solid'
          : 'navbar-top'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black font-bold text-sm shadow-sm shadow-yellow-500/30">
            K
          </div>
          <span className="font-semibold text-lg tracking-tight">Kamble</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
          <Link href="#features" className="hover:text-white transition-colors">Funcionalidades</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">Como funciona</Link>
          <Link href="#levels" className="hover:text-white transition-colors">Níveis</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2"
          >
            Entrar
          </Link>
          <Link
            href="/auth/register"
            className="text-sm bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          >
            Começar grátis
          </Link>
        </div>
      </div>
    </nav>
  )
}
