'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCallSocket, disconnectCallSocket } from '@/lib/socket'
import { useWebRTC, RemotePeer, ChatMessage } from '@/lib/useWebRTC'

// ── Sub-components ────────────────────────────────────────────────────────────

function VideoTile({
  stream,
  muted = false,
  label,
  isCameraOff = false,
  initials = '?',
}: {
  stream: MediaStream | null | undefined
  muted?: boolean
  label?: string
  isCameraOff?: boolean
  initials?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="relative rounded-2xl overflow-hidden bg-zinc-900 aspect-video flex items-center justify-center group">
      {isCameraOff || !stream ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lime-400 to-sky-400 flex items-center justify-center text-2xl font-bold text-black">
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
        flex flex-col items-center gap-1 px-4 py-3 rounded-2xl text-xs font-medium transition-all duration-200
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
}: {
  messages: ChatMessage[]
  onSend: (msg: string) => void
  userId: string
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
      <div className="p-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-zinc-200">Chat da Aula</h3>
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
  const [chatOpen, setChatOpen] = useState(true)
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
    router.push('/dashboard/student')
  }, [socket, sessionId, cleanup, router])

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

  const peersArray = Array.from(peers.values())

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col overflow-hidden">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header className="h-14 glass border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-lime-400 flex items-center justify-center text-black font-bold text-xs">
            K
          </div>
          <span className="font-semibold text-sm">Kamble</span>
          <span className="text-zinc-700">·</span>
          <span className="text-xs text-zinc-500 font-mono">{sessionId.slice(0, 8)}...</span>
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
        {/* ── Video grid ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          {/* Main video area */}
          <div
            className={`flex-1 grid gap-3 ${peersArray.length === 0
                ? 'grid-cols-1'
                : peersArray.length === 1
                  ? 'grid-cols-2'
                  : peersArray.length <= 3
                    ? 'grid-cols-2'
                    : 'grid-cols-3'
              }`}
          >
            {/* Local video */}
            <VideoTile
              stream={localStream}
              muted
              label={`Você ${role === 'TEACHER' ? '(Professor)' : ''}`}
              isCameraOff={isCameraOff}
              initials="V"
            />

            {/* Remote peers */}
            {peersArray.map((peer: RemotePeer) => (
              <VideoTile
                key={peer.peerId}
                stream={peer.stream}
                label={`${peer.role === 'TEACHER' ? '👨‍🏫 Professor' : '🎓 Aluno'}`}
                initials={peer.role === 'TEACHER' ? 'P' : 'A'}
              />
            ))}

            {/* Empty state */}
            {peersArray.length === 0 && (
              <div className="flex flex-col items-center justify-center glass rounded-2xl aspect-video">
                <div className="text-3xl mb-3">👥</div>
                <p className="text-sm text-zinc-500">
                  {role === 'TEACHER'
                    ? 'Aguardando alunos entrarem...'
                    : 'Aguardando o professor iniciar a aula...'}
                </p>
              </div>
            )}
          </div>

          {/* ── Control bar ──────────────────────────────────────────── */}
          <div className="shrink-0 glass rounded-2xl p-3 flex items-center justify-center gap-2">
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

            <ControlButton
              id="toggle-screen-btn"
              onClick={toggleScreenShare}
              active={isSharingScreen}
              title={isSharingScreen ? 'Parar compartilhamento' : 'Compartilhar tela'}
            >
              <span className="text-lg">🖥️</span>
              <span>{isSharingScreen ? 'Parar' : 'Tela'}</span>
            </ControlButton>

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
            {role === 'TEACHER' && sessionStatus === 'WAITING' && (
              <button
                id="start-session-btn"
                onClick={startSession}
                className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl text-xs font-semibold bg-lime-500/20 text-lime-400 hover:bg-lime-500 hover:text-black transition-all duration-200"
              >
                <span className="text-lg">▶️</span>
                <span>Iniciar aula</span>
              </button>
            )}

            {/* Leave / End */}
            {role === 'TEACHER' ? (
              <button
                id="end-session-btn"
                onClick={handleEndSession}
                className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
              >
                <span className="text-lg">⏹️</span>
                <span>Encerrar aula</span>
              </button>
            ) : (
              <button
                id="leave-room-btn"
                onClick={leaveRoom}
                className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
              >
                <span className="text-lg">🚪</span>
                <span>Sair</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Chat sidebar ───────────────────────────────────────────── */}
        {chatOpen && (
          <div className="w-80 glass border-l border-white/5 flex flex-col shrink-0 overflow-hidden">
            <ChatPanel
              messages={chatMessages}
              onSend={sendChatMessage}
              userId={userId}
            />
          </div>
        )}
      </div>
    </div>
  )
}
