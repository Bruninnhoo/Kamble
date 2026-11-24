'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCallSocket, disconnectCallSocket } from '@/lib/socket'
import { useWebRTC, RemotePeer, ChatMessage } from '@/lib/useWebRTC'
import { useBook } from '@/lib/useBook'
import { booksApi, sessionsApi, BookData } from '@/lib/api'
import { BookViewer } from '@/components/BookViewer'

// ── Sub-components ────────────────────────────────────────────────────────────

function VideoTile({
  stream,
  muted = false,
  label,
  isCameraOff = false,
  initials = '?',
  action,
  className = '',
}: {
  stream: MediaStream | null | undefined
  muted?: boolean
  label?: string
  isCameraOff?: boolean
  initials?: string
  action?: React.ReactNode
  className?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-zinc-900 aspect-video flex items-center justify-center group ${className}`}>
      {isCameraOff || !stream ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-lime-400 to-sky-400 flex items-center justify-center text-lg md:text-2xl font-bold text-black">
            {initials}
          </div>
          {isCameraOff && <span className="text-xs text-zinc-500">Câmera desligada</span>}
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      )}
      {action && <div className="absolute top-1.5 right-1.5">{action}</div>}
      {label && (
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-xs text-zinc-200 px-2 py-1 rounded-md">
          {label}
        </div>
      )}
    </div>
  )
}

function ControlButton({
  onClick,
  active,
  danger = false,
  title,
  children,
  id,
}: {
  onClick: () => void
  active: boolean
  danger?: boolean
  title: string
  children: React.ReactNode
  id: string
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      title={title}
      className={`
        flex flex-col items-center justify-center gap-1 min-w-11 min-h-11 px-2.5 py-2 sm:px-4 sm:py-3 rounded-2xl text-xs font-medium transition-all duration-200 [&>span:last-child]:hidden sm:[&>span:last-child]:inline
        ${danger
          ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
          : active
            ? 'bg-zinc-700/80 text-zinc-300 hover:bg-zinc-600'
            : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300'}
      `}
    >
      {children}
    </button>
  )
}

function ChatPanel({
  messages,
  onSend,
  userId,
  onClose,
}: {
  messages: ChatMessage[]
  onSend: (msg: string) => void
  userId: string
  onClose: () => void
}) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const msg = input.trim()
    if (!msg) return
    onSend(msg)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">Chat da Aula</h3>
        <button onClick={onClose} className="md:hidden w-11 h-11 -m-3 text-zinc-400" aria-label="Fechar chat">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-zinc-600 text-center mt-8">Nenhuma mensagem ainda</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col gap-0.5 ${msg.userId === userId ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${msg.userId === userId
                  ? 'bg-lime-500/20 text-lime-100 rounded-br-sm'
                  : 'bg-zinc-800/80 text-zinc-200 rounded-bl-sm'
                }`}
            >
              {msg.message}
            </div>
            <span className="text-[10px] text-zinc-600">
              {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-white/5">
        <div className="flex gap-2">
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Mensagem..."
            className="flex-1 bg-zinc-800/60 border border-white/5 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-lime-500/40 focus:bg-zinc-800 transition-all"
          />
          <button
            id="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-3 py-2 bg-lime-500/15 text-lime-400 hover:bg-lime-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-sm transition-all duration-200"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SessionRoomPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  // In a real app these would come from a store/cookie
  // Using localStorage as a simple approach for the demo
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('demo-user')
  const [role, setRole] = useState<string>('STUDENT')
  const [chatOpen, setChatOpen] = useState(false)
  const [isJoined, setIsJoined] = useState(false)

  // Load token from localStorage on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('kamble_access_token') ?? ''
      const storedUserId = localStorage.getItem('kamble_user_id') ?? 'demo-user'
      const storedRole = localStorage.getItem('kamble_user_role') ?? 'TEACHER'
      setAuthToken(token)
      setUserId(storedUserId)
      setRole(storedRole)
      // Chat starts open on desktop, as a closed drawer on mobile
      setChatOpen(window.matchMedia('(min-width: 768px)').matches)
    }
  }, [])

  const socket = authToken ? getCallSocket(authToken) : null

  const {
    localStream,
    peers,
    chatMessages,
    isMuted,
    isCameraOff,
    isSharingScreen,
    sessionStatus,
    error,
    startLocalMedia,
    cleanup,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    sendChatMessage,
    startSession,
    endSession,
  } = useWebRTC({ socket, sessionId, userId, role })

  const book = useBook(socket, sessionId)
  const isTeacher = role === 'TEACHER'
  const canDraw = isTeacher || book.penUserId === userId

  // Teacher's book picker
  const [classBooks, setClassBooks] = useState<BookData[]>([])
  useEffect(() => {
    if (!authToken || role !== 'TEACHER') return
    sessionsApi
      .findById(sessionId)
      .then((s) => booksApi.byClass(s.classId))
      .then(setClassBooks)
      .catch((e) => console.warn('[Books]', e))
  }, [authToken, role, sessionId])

  // ── Join room flow ────────────────────────────────────────────────────────

  const joinRoom = useCallback(async () => {
    if (!socket) return
    const stream = await startLocalMedia()
    if (!stream) return

    if (!socket.connected) {
      socket.connect()
      await new Promise<void>((resolve) => socket.once('connect', resolve))
    }

    socket.emit('join-room', { sessionId })
    setIsJoined(true)
  }, [socket, startLocalMedia, sessionId])

  // ── Leave room ────────────────────────────────────────────────────────────

  const leaveRoom = useCallback(() => {
    if (socket?.connected) {
      socket.emit('leave-room', { sessionId })
    }
    cleanup()
    disconnectCallSocket()
    router.push(role === 'TEACHER' ? '/dashboard/teacher' : '/dashboard/student')
  }, [socket, sessionId, cleanup, router, role])

  // ── End session (teacher only) ────────────────────────────────────────────

  const handleEndSession = useCallback(() => {
    endSession()
    leaveRoom()
  }, [endSession, leaveRoom])

  // Auto-join when token is ready
  useEffect(() => {
    if (authToken && !isJoined) {
      joinRoom()
    }
  }, [authToken]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Redirect on session ended ─────────────────────────────────────────────

  useEffect(() => {
    if (sessionStatus === 'ENDED' && role !== 'TEACHER') {
      setTimeout(() => {
        cleanup()
        disconnectCallSocket()
        router.push('/dashboard/student')
      }, 3000)
    }
  }, [sessionStatus, role, cleanup, router])

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  // ── Render states ─────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="glass rounded-2xl p-8 max-w-sm text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="font-semibold text-zinc-200 mb-2">Erro ao entrar na aula</h2>
          <p className="text-sm text-zinc-500 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-sm hover:bg-zinc-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  if (sessionStatus === 'ENDED') {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="glass rounded-2xl p-8 max-w-sm text-center">
          <div className="text-4xl mb-4">🎓</div>
          <h2 className="font-semibold text-zinc-200 mb-2">Aula encerrada</h2>
          <p className="text-sm text-zinc-500 mb-6">
            {role !== 'TEACHER' ? 'Você será redirecionado em instantes...' : 'A aula foi encerrada com sucesso.'}
          </p>
          <button
            onClick={leaveRoom}
            className="px-4 py-2 bg-lime-500/15 text-lime-400 rounded-xl text-sm hover:bg-lime-500 hover:text-black transition-all"
          >
            Ir para o dashboard
          </button>
        </div>
      </div>
    )
  }

  // Teacher first, so the strip and grid always lead with them
  const peersArray = Array.from(peers.values()).sort(
    (a, b) => Number(b.role === 'TEACHER') - Number(a.role === 'TEACHER'),
  )

  function renderTiles(tileClass = '') {
    const local = (
      <VideoTile
        key="local"
        className={tileClass}
        stream={localStream}
        muted
        label={`Você ${isTeacher ? '(Professor)' : ''}`}
        isCameraOff={isCameraOff}
        initials="V"
      />
    )
    const remotes = peersArray.map((peer: RemotePeer) => {
      const hasPen = book.penUserId === peer.userId
      return (
        <VideoTile
          key={peer.peerId}
          className={tileClass}
          stream={peer.stream}
          label={`${peer.role === 'TEACHER' ? '👨‍🏫 Professor' : '🎓 Aluno'}${hasPen ? ' ✏️' : ''}`}
          initials={peer.role === 'TEACHER' ? 'P' : 'A'}
          action={
            isTeacher && book.bookId && peer.role !== 'TEACHER' ? (
              <button
                onClick={() => book.grantPen(hasPen ? null : peer.userId)}
                title={hasPen ? 'Retirar caneta' : 'Liberar caneta'}
                className={`w-9 h-9 rounded-full text-sm backdrop-blur-sm ${hasPen ? 'bg-lime-500 text-black' : 'bg-black/60 text-zinc-200'}`}
              >
                ✏️
              </button>
            ) : undefined
          }
        />
      )
    })
    // Teacher's own tile leads; a student sees the teacher (first remote) first
    return isTeacher ? [local, ...remotes] : [...remotes.slice(0, 1), local, ...remotes.slice(1)]
  }

  return (
    <div className="h-dvh bg-[#09090b] flex flex-col overflow-hidden">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header className="h-12 md:h-14 glass border-b border-white/5 flex items-center justify-between px-3 md:px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-lime-400 flex items-center justify-center text-black font-bold text-xs">
            K
          </div>
          <span className="font-semibold text-sm">Kamble</span>
          <span className="hidden sm:inline text-zinc-700">·</span>
          <span className="hidden sm:inline text-xs text-zinc-500 font-mono">{sessionId.slice(0, 8)}...</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          {sessionStatus === 'LIVE' && (
            <div className="flex items-center gap-1.5 bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              AO VIVO
            </div>
          )}
          {sessionStatus === 'WAITING' && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Aguardando
            </div>
          )}
          <span className="text-xs text-zinc-600">
            {peersArray.length + 1} participante{peersArray.length !== 0 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 min-w-0 flex flex-col p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">
          {/* Teacher: book picker */}
          {isTeacher && classBooks.length > 0 && (
            <select
              value={book.bookId ?? ''}
              onChange={(e) => e.target.value && book.openBook(e.target.value)}
              className="shrink-0 self-start max-w-full bg-zinc-800/60 border border-white/5 rounded-xl px-3 h-11 text-sm text-zinc-200"
            >
              <option value="">📖 Abrir livro…</option>
              {classBooks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          )}

          {book.bookId ? (
            <>
              {/* Video strip, teacher first */}
              <div className="shrink-0 flex gap-2 overflow-x-auto">{renderTiles('w-28 md:w-44 shrink-0')}</div>
              {/* Book stage */}
              <div className="flex-1 min-h-0">
                <BookViewer
                  data={book.data}
                  page={book.page}
                  onPageChange={isTeacher ? book.setPage : undefined}
                  strokes={book.pageStrokes}
                  canDraw={canDraw}
                  onStroke={book.addStroke}
                  onClear={isTeacher ? book.clearPage : undefined}
                />
              </div>
            </>
          ) : (
            <div
              className={`flex-1 min-h-0 overflow-y-auto grid content-start gap-2 md:gap-3 grid-cols-1 ${
                peersArray.length === 0 ? '' : peersArray.length <= 3 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {renderTiles()}

              {/* Empty state */}
              {peersArray.length === 0 && (
                <div className="flex flex-col items-center justify-center glass rounded-2xl aspect-video">
                  <div className="text-3xl mb-3">👥</div>
                  <p className="text-sm text-zinc-500 px-4 text-center">
                    {isTeacher ? 'Aguardando alunos entrarem...' : 'Aguardando o professor iniciar a aula...'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Control bar ──────────────────────────────────────────── */}
          <div className="shrink-0 glass rounded-2xl p-2 md:p-3 flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
            <ControlButton
              id="toggle-mic-btn"
              onClick={toggleMic}
              active={!isMuted}
              title={isMuted ? 'Ligar microfone' : 'Silenciar microfone'}
            >
              <span className="text-lg">{isMuted ? '🔇' : '🎤'}</span>
              <span>{isMuted ? 'Silenciado' : 'Mic'}</span>
            </ControlButton>

            <ControlButton
              id="toggle-camera-btn"
              onClick={toggleCamera}
              active={!isCameraOff}
              title={isCameraOff ? 'Ligar câmera' : 'Desligar câmera'}
            >
              <span className="text-lg">{isCameraOff ? '📷' : '📹'}</span>
              <span>{isCameraOff ? 'Câmera off' : 'Câmera'}</span>
            </ControlButton>

            {/* Mobile browsers can't share their screen */}
            <div className="hidden md:contents">
              <ControlButton
                id="toggle-screen-btn"
                onClick={toggleScreenShare}
                active={isSharingScreen}
                title={isSharingScreen ? 'Parar compartilhamento' : 'Compartilhar tela (com áudio da aba)'}
              >
                <span className="text-lg">🖥️</span>
                <span>{isSharingScreen ? 'Parar' : 'Tela'}</span>
              </ControlButton>
            </div>

            <ControlButton
              id="toggle-chat-btn"
              onClick={() => setChatOpen((v) => !v)}
              active={chatOpen}
              title="Abrir/fechar chat"
            >
              <span className="text-lg">💬</span>
              <span>Chat</span>
            </ControlButton>

            {/* Teacher-only: Start session */}
            {isTeacher && sessionStatus === 'WAITING' && (
              <button
                id="start-session-btn"
                onClick={startSession}
                className="flex flex-col items-center justify-center gap-1 min-h-11 px-3 py-2 md:px-5 md:py-3 rounded-2xl text-xs font-semibold bg-lime-500/20 text-lime-400 hover:bg-lime-500 hover:text-black transition-all duration-200"
              >
                <span className="text-lg">▶️</span>
                <span className="hidden sm:inline">Iniciar aula</span>
              </button>
            )}

            {/* Leave / End */}
            {isTeacher ? (
              <button
                id="end-session-btn"
                onClick={handleEndSession}
                className="flex flex-col items-center justify-center gap-1 min-h-11 px-3 py-2 md:px-5 md:py-3 rounded-2xl text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
              >
                <span className="text-lg">⏹️</span>
                <span className="hidden sm:inline">Encerrar aula</span>
              </button>
            ) : (
              <button
                id="leave-room-btn"
                onClick={leaveRoom}
                className="flex flex-col items-center justify-center gap-1 min-h-11 px-3 py-2 md:px-5 md:py-3 rounded-2xl text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
              >
                <span className="text-lg">🚪</span>
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Chat: sidebar on desktop, bottom drawer on mobile ──────── */}
        {chatOpen && (
          <div className="fixed inset-x-0 bottom-0 h-[60dvh] z-20 rounded-t-2xl bg-[#121216] md:static md:h-auto md:z-auto md:rounded-none md:bg-transparent md:w-80 glass border-t md:border-t-0 md:border-l border-white/5 flex flex-col shrink-0 overflow-hidden">
            <ChatPanel
              messages={chatMessages}
              onSend={sendChatMessage}
              userId={userId}
              onClose={() => setChatOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
