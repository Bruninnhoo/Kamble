'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { classesApi, booksApi, ClassData, BookData } from '@/lib/api'
import { BookViewer } from '@/components/BookViewer'

export default function ClassPage() {
  const { id } = useParams<{ id: string }>()
  const [cls, setCls] = useState<ClassData | null>(null)
  const [books, setBooks] = useState<BookData[]>([])
  const [role, setRole] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [open, setOpen] = useState<{ data: ArrayBuffer | null; page: number } | null>(null)

  useEffect(() => {
    setRole(localStorage.getItem('kamble_user_role'))
    Promise.all([classesApi.findById(id), booksApi.byClass(id)])
      .then(([c, b]) => {
        setCls(c)
        setBooks(b)
      })
      .catch((e: Error) => setError(e.message))
  }, [id])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const book = await booksApi.upload(id, file, file.name.replace(/\.pdf$/i, ''))
      setBooks((prev) => [book, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar livro')
    } finally {
      setUploading(false)
    }
  }

  async function openBook(bookId: string) {
    setOpen({ data: null, page: 1 })
    try {
      const data = await booksApi.file(id, bookId)
      setOpen({ data, page: 1 })
    } catch (err) {
      setOpen(null)
      setError(err instanceof Error ? err.message : 'Erro ao abrir livro')
    }
  }

  const back = role === 'TEACHER' ? '/dashboard/teacher' : '/dashboard/student'

  if (open) {
    return (
      <div className="h-dvh bg-[#09090b] flex flex-col p-3 md:p-6 gap-3">
        <button onClick={() => setOpen(null)} className="self-start text-sm text-zinc-400 hover:text-zinc-200">
          ← Voltar aos livros
        </button>
        <BookViewer
          data={open.data}
          page={open.page}
          onPageChange={(page) => setOpen((o) => o && { ...o, page })}
        />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#09090b] px-4 py-6 md:px-10 md:py-10 max-w-3xl mx-auto">
      <Link href={back} className="text-sm text-zinc-500 hover:text-zinc-300">
        ← Dashboard
      </Link>

      <h1 className="text-2xl font-bold mt-4">{cls?.name ?? 'Turma'}</h1>
      {cls && (
        <p className="text-sm text-zinc-500 mt-1">
          Nível {cls.level}
          {cls.studentsCount !== undefined && ` · ${cls.studentsCount} aluno${cls.studentsCount === 1 ? '' : 's'}`}
        </p>
      )}

      <div className="flex items-center justify-between mt-8 mb-3">
        <h2 className="text-sm font-semibold text-zinc-300">Livros</h2>
        {role === 'TEACHER' && (
          <label className="cursor-pointer text-sm font-semibold px-4 py-2.5 rounded-xl bg-lime-500/20 text-lime-400 hover:bg-lime-500 hover:text-black transition-all">
            {uploading ? 'Enviando…' : '+ Enviar PDF'}
            <input type="file" accept="application/pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3">{error}</p>
      )}

      {books.length === 0 ? (
        <p className="text-sm text-zinc-600 py-10 text-center glass rounded-2xl">
          {role === 'TEACHER' ? 'Envie o primeiro livro desta turma.' : 'Nenhum livro disponível ainda.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {books.map((b) => (
            <li key={b.id}>
              <button
                onClick={() => openBook(b.id)}
                className="w-full text-left glass rounded-2xl px-4 py-4 hover:bg-white/5 transition-colors"
              >
                <span className="text-sm text-zinc-200">📖 {b.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
