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
  socket: Socket
  sessionId: string
  userId: string
  role: string
}

export function useWebRTC({ socket, sessionId, userId, role }: UseWebRTCOptions) {
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
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())

  // ── Media ─────────────────────────────────────────────────────────────────

  const startLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true },
      })
      localStreamRef.current = stream
      setLocalStream(stream)
      return stream
    } catch (err) {
      setError('Não foi possível acessar câmera/microfone. Verifique as permissões.')
      console.error('[WebRTC] getUserMedia error:', err)
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
          socket.emit('ice-candidate', {
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
      socket.emit('offer', { sessionId, to: peerId, signal: offer })
    },
    [createPeerConnection, socket, sessionId],
  )

  const handleOffer = useCallback(
    async ({ from, signal }: { from: string; signal: RTCSessionDescriptionInit }) => {
      const pc = createPeerConnection(from)
      await pc.setRemoteDescription(new RTCSessionDescription(signal))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('answer', { sessionId, to: from, signal: answer })
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
    const handleRoomPeers = ({ peers: existingPeers }: { peers: string[] }) => {
      existingPeers.forEach((peerId) => callPeer(peerId))
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

  const toggleScreenShare = useCallback(async () => {
    if (isSharingScreen) {
      // Stop screen share, replace with camera
      screenStreamRef.current?.getTracks().forEach((t) => t.stop())
      screenStreamRef.current = null

      const cameraTrack = localStreamRef.current?.getVideoTracks()[0]
      if (cameraTrack) {
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
          if (sender && cameraTrack) sender.replaceTrack(cameraTrack)
        })
      }
      setIsSharingScreen(false)
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        screenStreamRef.current = screenStream
        const screenTrack = screenStream.getVideoTracks()[0]

        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
          if (sender) sender.replaceTrack(screenTrack)
        })

        // Revert when user stops via browser UI
        screenTrack.onended = () => {
          setIsSharingScreen(false)
          screenStreamRef.current = null
          const cameraTrack = localStreamRef.current?.getVideoTracks()[0]
          if (cameraTrack) {
            peerConnections.current.forEach((pc) => {
              const s = pc.getSenders().find((s) => s.track?.kind === 'video')
              if (s) s.replaceTrack(cameraTrack)
            })
          }
        }
        setIsSharingScreen(true)
      } catch {
        console.warn('[WebRTC] Screen share cancelled or denied')
      }
    }
  }, [isSharingScreen])

  const sendChatMessage = useCallback(
    (message: string) => {
      socket.emit('chat-message', { sessionId, message })
    },
    [socket, sessionId],
  )

  const startSession = useCallback(() => {
    socket.emit('session-started', { sessionId })
  }, [socket, sessionId])

  const endSession = useCallback(() => {
    socket.emit('session-ended', { sessionId })
  }, [socket, sessionId])

  // ── Cleanup ───────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    peerConnections.current.forEach((pc) => pc.close())
    peerConnections.current.clear()
    stopLocalMedia()
    screenStreamRef.current?.getTracks().forEach((t) => t.stop())
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
