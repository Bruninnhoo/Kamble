'use client'

import { useCallback, useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { booksApi } from '@/lib/api'
import type { Stroke } from '@/components/BookViewer'

const NO_STROKES: Stroke[] = []

interface RoomState {
  classId?: string
  bookId?: string
  page: number
  strokes: Record<number, Stroke[]>
  penUserId?: string | null
}

/** Book + whiteboard state synced through the call socket. The server is the source of truth. */
export function useBook(socket: Socket | null, sessionId: string) {
  const [state, setState] = useState<RoomState>({ page: 1, strokes: {} })
  const [loaded, setLoaded] = useState<{ bookId: string; data: ArrayBuffer } | null>(null)

  useEffect(() => {
    if (!socket) return
    const onState = (s: RoomState) => setState(s)
    const onPage = ({ page }: { page: number }) => setState((p) => ({ ...p, page }))
    const onStroke = ({ page, stroke }: { page: number; stroke: Stroke }) =>
      setState((p) => ({ ...p, strokes: { ...p.strokes, [page]: [...(p.strokes[page] ?? []), stroke] } }))
    const onClear = ({ page }: { page: number }) =>
      setState((p) => ({ ...p, strokes: { ...p.strokes, [page]: [] } }))
    const onPen = ({ userId }: { userId: string | null }) => setState((p) => ({ ...p, penUserId: userId }))

    socket.on('room-state', onState)
    socket.on('book-page', onPage)
    socket.on('draw-stroke', onStroke)
    socket.on('draw-clear', onClear)
    socket.on('pen-grant', onPen)
    return () => {
      socket.off('room-state', onState)
      socket.off('book-page', onPage)
      socket.off('draw-stroke', onStroke)
      socket.off('draw-clear', onClear)
      socket.off('pen-grant', onPen)
    }
  }, [socket])

  // Download the PDF whenever the open book changes
  const { classId, bookId } = state
  useEffect(() => {
    if (!classId || !bookId) return
    let cancelled = false
    booksApi
      .file(classId, bookId)
      .then((data) => !cancelled && setLoaded({ bookId, data }))
      .catch((e) => console.warn('[Book]', e))
    return () => {
      cancelled = true
    }
  }, [classId, bookId])

  const openBook = useCallback(
    (bookId: string) => socket?.emit('book-open', { sessionId, bookId }),
    [socket, sessionId],
  )

  const setPage = useCallback(
    (page: number) => socket?.emit('book-page', { sessionId, page }),
    [socket, sessionId],
  )

  // Own strokes are applied locally; the server relays them to everyone else
  const addStroke = useCallback(
    (stroke: Stroke) => {
      setState((p) => ({ ...p, strokes: { ...p.strokes, [p.page]: [...(p.strokes[p.page] ?? []), stroke] } }))
      socket?.emit('draw-stroke', { sessionId, page: state.page, stroke })
    },
    [socket, sessionId, state.page],
  )

  const clearPage = useCallback(
    () => socket?.emit('draw-clear', { sessionId, page: state.page }),
    [socket, sessionId, state.page],
  )

  const grantPen = useCallback(
    (userId: string | null) => socket?.emit('pen-grant', { sessionId, userId }),
    [socket, sessionId],
  )

  return {
    ...state,
    // Only hand out the bytes of the book that is open now
    data: loaded && loaded.bookId === bookId ? loaded.data : null,
    pageStrokes: state.strokes[state.page] ?? NO_STROKES,
    openBook,
    setPage,
    addStroke,
    clearPage,
    grantPen,
  }
}
