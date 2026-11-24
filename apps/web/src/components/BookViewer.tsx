'use client'

import { useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'

export interface Stroke {
  points: [number, number][] // normalized 0..1 relative to the page
  color: string
  width: number
}

const COLORS = ['#ef4444', '#3b82f6', '#22c55e']

/**
 * Renders one PDF page at the device's own resolution with a drawing layer on top.
 * Strokes use page-relative coordinates, so they line up on any screen size.
 */
export function BookViewer({
  data,
  page,
  onPageChange,
  strokes = [],
  canDraw = false,
  onStroke,
  onClear,
}: {
  data: ArrayBuffer | null
  page: number
  onPageChange?: (page: number) => void
  strokes?: Stroke[]
  canDraw?: boolean
  onStroke?: (stroke: Stroke) => void
  onClear?: () => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const pdfCanvas = useRef<HTMLCanvasElement>(null)
  const inkCanvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef<Stroke | null>(null)
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [width, setWidth] = useState(0)
  const [color, setColor] = useState(COLORS[0])

  // Load document (pdf.js is imported lazily: it needs browser globals)
  useEffect(() => {
    if (!data) return
    let cancelled = false
    let task: { destroy: () => Promise<void> } | null = null
    ;(async () => {
      const pdfjs = await import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString()
      if (cancelled) return
      // getDocument detaches the buffer it receives, so hand it a copy
      const loading = pdfjs.getDocument({ data: data.slice(0) })
      task = loading
      const loaded = await loading.promise
      if (!cancelled) setDoc(loaded)
    })()
    return () => {
      cancelled = true
      task?.destroy()
      setDoc(null)
    }
  }, [data])

  // Track container width
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Render the page, fit to width, at devicePixelRatio
  useEffect(() => {
    if (!doc || !width || !pdfCanvas.current || !inkCanvas.current) return
    let task: { cancel: () => void; promise: Promise<void> } | null = null
    let cancelled = false
    ;(async () => {
      const p = await doc.getPage(Math.min(page, doc.numPages))
      if (cancelled) return
      const dpr = window.devicePixelRatio || 1
      const base = p.getViewport({ scale: 1 })
      const viewport = p.getViewport({ scale: (width / base.width) * dpr })
      for (const c of [pdfCanvas.current!, inkCanvas.current!]) {
        c.width = viewport.width
        c.height = viewport.height
        c.style.width = `${width}px`
        c.style.height = `${viewport.height / dpr}px`
      }
      task = p.render({ canvas: pdfCanvas.current!, viewport })
      await task.promise.catch(() => {})
      redraw()
    })()
    return () => {
      cancelled = true
      task?.cancel()
    }
  }, [doc, page, width]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(redraw, [strokes])

  function redraw() {
    const c = inkCanvas.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    ctx.clearRect(0, 0, c.width, c.height)
    for (const s of strokes) drawStroke(ctx, c, s)
  }

  function drawStroke(ctx: CanvasRenderingContext2D, c: HTMLCanvasElement, s: Stroke) {
    if (s.points.length === 0) return
    const dpr = window.devicePixelRatio || 1
    ctx.strokeStyle = s.color
    ctx.lineWidth = s.width * dpr
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    s.points.forEach(([x, y], i) => (i ? ctx.lineTo(x * c.width, y * c.height) : ctx.moveTo(x * c.width, y * c.height)))
    if (s.points.length === 1) ctx.lineTo(s.points[0][0] * c.width + 0.1, s.points[0][1] * c.height)
    ctx.stroke()
  }

  function point(e: React.PointerEvent<HTMLCanvasElement>): [number, number] {
    const r = e.currentTarget.getBoundingClientRect()
    const round = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 10000) / 10000
    return [round((e.clientX - r.left) / r.width), round((e.clientY - r.top) / r.height)]
  }

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canDraw) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = { points: [point(e)], color, width: 3 }
  }

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = drawing.current
    const c = inkCanvas.current
    const ctx = c?.getContext('2d')
    if (!s || !c || !ctx) return
    s.points.push(point(e))
    drawStroke(ctx, c, { ...s, points: s.points.slice(-2) })
  }

  const handleUp = () => {
    const s = drawing.current
    drawing.current = null
    if (s) onStroke?.(s)
  }

  const numPages = doc?.numPages ?? 0

  return (
    <div className="flex flex-col gap-2 w-full h-full min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        {onPageChange ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="w-11 h-11 rounded-xl bg-white/5 text-zinc-300 hover:bg-white/10 disabled:opacity-30"
              aria-label="Página anterior"
            >
              ‹
            </button>
            <span className="text-xs text-zinc-400 tabular-nums px-2">
              {page} / {numPages || '…'}
            </span>
            <button
              onClick={() => onPageChange(Math.min(numPages || page, page + 1))}
              disabled={!numPages || page >= numPages}
              className="w-11 h-11 rounded-xl bg-white/5 text-zinc-300 hover:bg-white/10 disabled:opacity-30"
              aria-label="Próxima página"
            >
              ›
            </button>
          </div>
        ) : (
          <span className="text-xs text-zinc-500 tabular-nums">
            Página {page} / {numPages || '…'}
          </span>
        )}

        {canDraw && (
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={`Cor ${c}`}
                className={`w-9 h-9 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
            {onClear && (
              <button
                onClick={onClear}
                className="h-11 px-3 rounded-xl bg-white/5 text-xs text-zinc-300 hover:bg-white/10"
              >
                Limpar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Page */}
      <div ref={wrapRef} className="flex-1 min-h-0 overflow-auto rounded-xl bg-zinc-900">
        {!doc && <p className="text-sm text-zinc-500 text-center py-16">Carregando livro…</p>}
        <div className="relative" style={{ width: width || undefined }}>
          <canvas ref={pdfCanvas} className="block bg-white" />
          <canvas
            ref={inkCanvas}
            className="absolute inset-0"
            style={{ touchAction: canDraw ? 'none' : 'auto', cursor: canDraw ? 'crosshair' : 'default' }}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerCancel={handleUp}
          />
        </div>
      </div>
    </div>
  )
}
