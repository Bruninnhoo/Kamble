import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets'
import { Namespace, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { SessionsService } from './sessions.service'
import { Logger } from '@nestjs/common'

interface AuthenticatedSocket extends Socket {
  userId: string
  userName?: string
  role: string
}

interface Stroke {
  points: [number, number][] // normalized 0..1 relative to the page
  color: string
  width: number
}

interface RoomState {
  classId?: string
  bookId?: string
  page: number
  strokes: Record<number, Stroke[]>
  penUserId?: string | null
}

interface SignalPayload {
  sessionId: string
  to: string        // target socket id
  signal: unknown   // RTCSessionDescriptionInit | RTCIceCandidateInit
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/calls',
})
export class SessionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Namespace // namespaced gateway: this is /calls, not the root Server

  private readonly logger = new Logger(SessionsGateway.name)

  // Map: sessionId → Set of socket ids
  private rooms = new Map<string, Set<string>>()

  // ponytail: in-memory book/whiteboard state, lost on restart and single-instance only (same as `rooms`); move to Redis when scaling out
  private roomState = new Map<string, RoomState>()

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private sessionsService: SessionsService,
  ) {}

  // ── Connection ────────────────────────────────────────────────────────────

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers?.authorization?.replace('Bearer ', '') ?? '')

      if (!token) throw new Error('Token ausente')

      const payload = this.jwtService.verify<{ sub: string; role: string }>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      })

      client.userId = payload.sub
      client.role = payload.role
      this.logger.log(`Client connected: ${client.id} (user=${client.userId})`)
    } catch {
      this.logger.warn(`Unauthorized connection attempt: ${client.id}`)
      client.emit('error', { message: 'Não autorizado' })
      client.disconnect()
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`)
    this._leaveAllRooms(client)
  }

  // ── Room Events ───────────────────────────────────────────────────────────

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    const { sessionId } = data

    // Verify user can join
    const allowed = await this.sessionsService.canJoin(sessionId, client.userId)
    if (!allowed) {
      throw new WsException('Você não tem permissão para entrar nesta sessão')
    }

    await client.join(sessionId)

    if (!this.rooms.has(sessionId)) {
      this.rooms.set(sessionId, new Set())
    }
    this.rooms.get(sessionId)!.add(client.id)

    // Notify the joining peer who is already in the room
    const peersInRoom = [...(this.rooms.get(sessionId) ?? [])]
      .filter((id) => id !== client.id)

    // Tell the new peer who else is in the room (with who they are, so tiles/pen work)
    const peers = peersInRoom.map((peerId) => {
      const peer = this.server.sockets.get(peerId) as AuthenticatedSocket | undefined
      return { peerId, userId: peer?.userId, role: peer?.role }
    })
    client.emit('room-peers', { peers })
    client.emit('room-state', this._state(sessionId))

    // Tell existing peers that a new user joined
    client.to(sessionId).emit('peer-joined', {
      peerId: client.id,
      userId: client.userId,
      role: client.role,
    })

    this.logger.log(`User ${client.userId} joined session ${sessionId}`)
    return { event: 'joined', sessionId, peersInRoom }
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    this._leaveRoom(client, data.sessionId)
    return { event: 'left', sessionId: data.sessionId }
  }

  // ── WebRTC Signaling ──────────────────────────────────────────────────────

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SignalPayload,
  ) {
    this.server.to(data.to).emit('offer', {
      from: client.id,
      signal: data.signal,
    })
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SignalPayload,
  ) {
    this.server.to(data.to).emit('answer', {
      from: client.id,
      signal: data.signal,
    })
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SignalPayload,
  ) {
    this.server.to(data.to).emit('ice-candidate', {
      from: client.id,
      signal: data.signal,
    })
  }

  // ── Session Control ───────────────────────────────────────────────────────

  @SubscribeMessage('session-started')
  async handleSessionStarted(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    if (client.role !== 'TEACHER') throw new WsException('Apenas professores podem iniciar sessões')
    await this.sessionsService.start(data.sessionId, client.userId)
    this.server.to(data.sessionId).emit('session-live', { sessionId: data.sessionId })
    this.logger.log(`Session ${data.sessionId} started by teacher ${client.userId}`)
  }

  @SubscribeMessage('session-ended')
  async handleSessionEnded(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    if (client.role !== 'TEACHER') throw new WsException('Apenas professores podem encerrar sessões')
    await this.sessionsService.end(data.sessionId, client.userId)
    this.roomState.delete(data.sessionId)
    this.server.to(data.sessionId).emit('session-finished', { sessionId: data.sessionId })
    this.logger.log(`Session ${data.sessionId} ended by teacher ${client.userId}`)
  }

  // ── Book & Whiteboard ─────────────────────────────────────────────────────

  @SubscribeMessage('book-open')
  async handleBookOpen(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; bookId: string },
  ) {
    this._assertTeacherInRoom(client, data.sessionId)
    const classId = await this.sessionsService.bookClassId(data.sessionId, data.bookId)
    if (!classId) throw new WsException('Livro não pertence a esta turma')
    const state = this._state(data.sessionId)
    Object.assign(state, { classId, bookId: data.bookId, page: 1, strokes: {} })
    this.server.to(data.sessionId).emit('room-state', state)
  }

  @SubscribeMessage('book-page')
  handleBookPage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; page: number },
  ) {
    this._assertTeacherInRoom(client, data.sessionId)
    const page = Math.max(1, Math.floor(Number(data.page)) || 1)
    this._state(data.sessionId).page = page
    this.server.to(data.sessionId).emit('book-page', { page })
  }

  @SubscribeMessage('draw-stroke')
  handleDrawStroke(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; page: number; stroke: Stroke },
  ) {
    this._assertInRoom(client, data.sessionId)
    const state = this._state(data.sessionId)
    if (client.role !== 'TEACHER' && state.penUserId !== client.userId) {
      throw new WsException('Caneta não liberada')
    }
    const { points, color, width } = data.stroke ?? {}
    if (!Array.isArray(points) || points.length > 5000) throw new WsException('Traço inválido')
    const stroke: Stroke = { points, color: String(color).slice(0, 20), width: Number(width) || 3 }
    ;(state.strokes[data.page] ??= []).push(stroke)
    client.to(data.sessionId).emit('draw-stroke', { page: data.page, stroke })
  }

  @SubscribeMessage('draw-clear')
  handleDrawClear(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; page: number },
  ) {
    this._assertTeacherInRoom(client, data.sessionId)
    delete this._state(data.sessionId).strokes[data.page]
    this.server.to(data.sessionId).emit('draw-clear', { page: data.page })
  }

  @SubscribeMessage('pen-grant')
  handlePenGrant(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; userId: string | null },
  ) {
    this._assertTeacherInRoom(client, data.sessionId)
    this._state(data.sessionId).penUserId = data.userId
    this.server.to(data.sessionId).emit('pen-grant', { userId: data.userId })
  }

  // ── Chat ──────────────────────────────────────────────────────────────────

  @SubscribeMessage('chat-message')
  handleChatMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; message: string },
  ) {
    this.server.to(data.sessionId).emit('chat-message', {
      from: client.id,
      userId: client.userId,
      message: data.message,
      timestamp: new Date().toISOString(),
    })
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _leaveRoom(client: AuthenticatedSocket, sessionId: string) {
    client.leave(sessionId)
    const room = this.rooms.get(sessionId)
    if (room) {
      room.delete(client.id)
      if (room.size === 0) this.rooms.delete(sessionId)
    }
    client.to(sessionId).emit('peer-left', { peerId: client.id, userId: client.userId })
  }

  private _state(sessionId: string): RoomState {
    let state = this.roomState.get(sessionId)
    if (!state) {
      state = { page: 1, strokes: {}, penUserId: null }
      this.roomState.set(sessionId, state)
    }
    return state
  }

  private _assertInRoom(client: AuthenticatedSocket, sessionId: string) {
    if (!client.rooms.has(sessionId)) throw new WsException('Você não está nesta sessão')
  }

  // canJoin only admits the session's own teacher, so TEACHER inside the room is that teacher
  private _assertTeacherInRoom(client: AuthenticatedSocket, sessionId: string) {
    this._assertInRoom(client, sessionId)
    if (client.role !== 'TEACHER') throw new WsException('Apenas o professor pode fazer isso')
  }

  private _leaveAllRooms(client: AuthenticatedSocket) {
    for (const [sessionId] of this.rooms) {
      const room = this.rooms.get(sessionId)
      if (room?.has(client.id)) {
        this._leaveRoom(client, sessionId)
      }
    }
  }
}
