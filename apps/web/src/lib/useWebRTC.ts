'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Socket } from 'socket.io-client'

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

export interface RemotePeer {
  peerId: string
  userId: string
  role: string
  stream?: MediaStream
}

export interface ChatMessage {
  from: string
  userId: string
  message: string
  timestamp: string
}

interface UseWebRTCOptions {
  socket: Socket | null
  sessionId: string
}

export function useWebRTC({ socket, sessionId }: UseWebRTCOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [peers, setPeers] = useState<Map<string, RemotePeer>>(new Map())
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isSharingScreen, setIsSharingScreen] = useState(false)
  const [sessionStatus, setSessionStatus] = useState<'WAITING' | 'LIVE' | 'ENDED'>('WAITING')
  const [error, setError] = useState<string | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const audioMixRef = useRef<AudioContext | null>(null)
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())

  // ── Media ─────────────────────────────────────────────────────────────────

  const startLocalMedia = useCallback(async () => {
    // Guard: mediaDevices is undefined in insecure contexts (HTTP on non-localhost)
    if (!navigator.mediaDevices?.getUserMedia) {
      const msg =
        'Acesso à câmera/microfone requer uma conexão segura (HTTPS). Por favor, acesse via https:// ou localhost.'
      setError(msg)
      console.error('[WebRTC] getUserMedia not available – insecure context or unsupported browser')
      return null
    }

    // Attempt 1: full HD + facingMode
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true },
      })
      localStreamRef.current = stream
      setLocalStream(stream)
      return stream
    } catch (err1) {
      const e1 = err1 as DOMException
      console.warn('[WebRTC] getUserMedia attempt 1 failed:', e1.name, e1.message)

      // Attempt 2: simple video (no facingMode – avoids OverconstrainedError on desktop cams)
      if (e1.name === 'NotFoundError' || e1.name === 'OverconstrainedError') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: { echoCancellation: true, noiseSuppression: true },
          })
          localStreamRef.current = stream
          setLocalStream(stream)
          return stream
        } catch (err2) {
          const e2 = err2 as DOMException
          console.warn('[WebRTC] getUserMedia attempt 2 failed:', e2.name, e2.message)

          // Attempt 3: audio-only (no camera available)
          if (e2.name === 'NotFoundError') {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: { echoCancellation: true, noiseSuppression: true },
              })
              localStreamRef.current = stream
              setLocalStream(stream)
              console.warn('[WebRTC] Running audio-only – no camera found')
              return stream
            } catch (err3) {
              const e3 = err3 as DOMException
              console.error('[WebRTC] getUserMedia attempt 3 (audio-only) failed:', e3)
            }
          }
        }
      }

      // Map final error to user-friendly message
      const domErr = e1 as DOMException
      let msg = 'Não foi possível acessar câmera/microfone.'
      if (domErr?.name === 'NotFoundError') {
        msg = 'Nenhuma câmera ou microfone encontrado. Conecte um dispositivo e tente novamente.'
      } else if (domErr?.name === 'NotAllowedError') {
        msg = 'Permissão negada. Permita o acesso à câmera/microfone nas configurações do navegador.'
      } else if (domErr?.name === 'NotReadableError') {
        msg =
          'Câmera ou microfone em uso por outro aplicativo. Feche outros apps (Zoom, Teams…) e tente novamente.'
      } else if (domErr?.name === 'OverconstrainedError') {
        msg = 'As configurações de vídeo solicitadas não são suportadas pelo seu dispositivo.'
      }
      setError(msg)
      console.error('[WebRTC] getUserMedia error:', err1)
      return null
    }
  }, [])

  const stopLocalMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    localStreamRef.current = null
    setLocalStream(null)
  }, [])

  // ── Peer connection factory ───────────────────────────────────────────────

  const createPeerConnection = useCallback(
    (peerId: string) => {
      const pc = new RTCPeerConnection(ICE_SERVERS)

      // Add local tracks
      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!)
      })

      // Remote stream
      const remoteStream = new MediaStream()
      pc.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach((track) => remoteStream.addTrack(track))
        setPeers((prev) => {
          const next = new Map(prev)
          const peer = next.get(peerId)
          if (peer) next.set(peerId, { ...peer, stream: remoteStream })
          return next
        })
      }

      // ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit('ice-candidate', {
            sessionId,
            to: peerId,
            signal: event.candidate,
          })
        }
      }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          console.warn(`[WebRTC] Connection with ${peerId} ${pc.connectionState}`)
        }
      }

      peerConnections.current.set(peerId, pc)
      return pc
    },
    [socket, sessionId],
  )

  // ── Offer/Answer flow ─────────────────────────────────────────────────────

  const callPeer = useCallback(
    async (peerId: string) => {
      const pc = createPeerConnection(peerId)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket?.emit('offer', { sessionId, to: peerId, signal: offer })
    },
    [createPeerConnection, socket, sessionId],
  )

  const handleOffer = useCallback(
    async ({ from, signal }: { from: string; signal: RTCSessionDescriptionInit }) => {
      const pc = createPeerConnection(from)
      await pc.setRemoteDescription(new RTCSessionDescription(signal))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket?.emit('answer', { sessionId, to: from, signal: answer })
    },
    [createPeerConnection, socket, sessionId],
  )

  const handleAnswer = useCallback(
    async ({ from, signal }: { from: string; signal: RTCSessionDescriptionInit }) => {
      const pc = peerConnections.current.get(from)
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(signal))
    },
    [],
  )

  const handleIceCandidate = useCallback(
    async ({ from, signal }: { from: string; signal: RTCIceCandidateInit }) => {
      const pc = peerConnections.current.get(from)
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(signal))
    },
    [],
  )

  // ── Socket events ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!socket) return

    const handleRoomPeers = ({ peers: existingPeers }: { peers: RemotePeer[] }) => {
      // Register peers before calling, so ontrack finds their entry
      setPeers((prev) => {
        const next = new Map(prev)
        existingPeers.forEach((p) => next.set(p.peerId, p))
        return next
      })
      existingPeers.forEach((p) => callPeer(p.peerId))
    }

    const handlePeerJoined = (peer: RemotePeer) => {
      setPeers((prev) => new Map(prev).set(peer.peerId, peer))
    }

    const handlePeerLeft = ({ peerId }: { peerId: string }) => {
      peerConnections.current.get(peerId)?.close()
      peerConnections.current.delete(peerId)
      setPeers((prev) => {
        const next = new Map(prev)
        next.delete(peerId)
        return next
      })
    }

    const handleChatMessage = (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg])
    }

    const handleSessionLive = () => setSessionStatus('LIVE')
    const handleSessionFinished = () => setSessionStatus('ENDED')

    socket.on('room-peers', handleRoomPeers)
    socket.on('peer-joined', handlePeerJoined)
    socket.on('peer-left', handlePeerLeft)
    socket.on('offer', handleOffer)
    socket.on('answer', handleAnswer)
    socket.on('ice-candidate', handleIceCandidate)
    socket.on('chat-message', handleChatMessage)
    socket.on('session-live', handleSessionLive)
    socket.on('session-finished', handleSessionFinished)

    return () => {
      socket.off('room-peers', handleRoomPeers)
      socket.off('peer-joined', handlePeerJoined)
      socket.off('peer-left', handlePeerLeft)
      socket.off('offer', handleOffer)
      socket.off('answer', handleAnswer)
      socket.off('ice-candidate', handleIceCandidate)
      socket.off('chat-message', handleChatMessage)
      socket.off('session-live', handleSessionLive)
      socket.off('session-finished', handleSessionFinished)
    }
  }, [socket, callPeer, handleOffer, handleAnswer, handleIceCandidate])

  // ── Controls ──────────────────────────────────────────────────────────────

  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current
    if (!stream) return
    stream.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled
    })
    setIsMuted((v) => !v)
  }, [])

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current
    if (!stream) return
    stream.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled
    })
    setIsCameraOff((v) => !v)
  }, [])

  // Swap the outgoing track of one kind on every connection (no renegotiation needed)
  const replaceOutgoing = useCallback((kind: 'audio' | 'video', track: MediaStreamTrack | undefined) => {
    if (!track) return
    peerConnections.current.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === kind)
      if (sender) sender.replaceTrack(track)
    })
  }, [])

  const stopScreenShare = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop())
    screenStreamRef.current = null
    audioMixRef.current?.close()
    audioMixRef.current = null
    replaceOutgoing('video', localStreamRef.current?.getVideoTracks()[0])
    replaceOutgoing('audio', localStreamRef.current?.getAudioTracks()[0])
    setIsSharingScreen(false)
  }, [replaceOutgoing])

  const toggleScreenShare = useCallback(async () => {
    if (isSharingScreen) return stopScreenShare()
    try {
      // audio: true lets the teacher tick "share tab audio" (Chrome/Edge desktop only)
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      screenStreamRef.current = screenStream
      const screenTrack = screenStream.getVideoTracks()[0]
      replaceOutgoing('video', screenTrack)

      // Mix mic + tab audio into one track so students hear both; muting the mic still works
      const tabAudio = screenStream.getAudioTracks()[0]
      if (tabAudio) {
        const ctx = new AudioContext()
        const dest = ctx.createMediaStreamDestination()
        ctx.createMediaStreamSource(new MediaStream([tabAudio])).connect(dest)
        const mic = localStreamRef.current?.getAudioTracks()[0]
        if (mic) ctx.createMediaStreamSource(new MediaStream([mic])).connect(dest)
        audioMixRef.current = ctx
        replaceOutgoing('audio', dest.stream.getAudioTracks()[0])
      }

      // Revert when user stops via browser UI
      screenTrack.onended = stopScreenShare
      setIsSharingScreen(true)
    } catch {
      console.warn('[WebRTC] Screen share cancelled or denied')
    }
  }, [isSharingScreen, stopScreenShare, replaceOutgoing])

  const sendChatMessage = useCallback(
    (message: string) => {
      socket?.emit('chat-message', { sessionId, message })
    },
    [socket, sessionId],
  )

  const startSession = useCallback(() => {
    socket?.emit('session-started', { sessionId })
  }, [socket, sessionId])

  const endSession = useCallback(() => {
    socket?.emit('session-ended', { sessionId })
  }, [socket, sessionId])

  // ── Cleanup ───────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    peerConnections.current.forEach((pc) => pc.close())
    peerConnections.current.clear()
    stopLocalMedia()
    screenStreamRef.current?.getTracks().forEach((t) => t.stop())
    audioMixRef.current?.close()
  }, [stopLocalMedia])

  return {
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
  }
}
