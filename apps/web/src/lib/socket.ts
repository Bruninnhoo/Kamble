'use client'

import { io, Socket } from 'socket.io-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

let socket: Socket | null = null

export function getCallSocket(token: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(`${API_URL}/calls`, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,
    })
  }
  return socket
}

export function disconnectCallSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
