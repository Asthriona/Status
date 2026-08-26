import type { H3Event } from 'h3'
import type { Server as SocketIOServer } from 'socket.io'

let io: SocketIOServer | null = null

export function getSocketIO(): SocketIOServer | null {
  return io
}

export function initSocketIO(server: any): SocketIOServer {
  const { Server } = require('socket.io') as typeof import('socket.io')
  
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('[WebSocket] Client connected:', socket.id)
    
    socket.on('join-org', (orgId: string) => {
      socket.join(`org:${orgId}`)
      console.log(`[WebSocket] ${socket.id} joined org:${orgId}`)
    })

    socket.on('disconnect', () => {
      console.log('[WebSocket] Client disconnected:', socket.id)
    })
  })

  return io
}

export function broadcastComponentUpdate(orgId: string, data: any): void {
  if (io) {
    io.to(`org:${orgId}`).emit('component:update', data)
  }
}

export function broadcastIncident(orgId: string, event: string, data: any): void {
  if (io) {
    io.to(`org:${orgId}`).emit(`incident:${event}`, data)
  }
}

export function broadcastMonitorCheck(orgId: string, data: any): void {
  if (io) {
    io.to(`org:${orgId}`).emit('monitor:checked', data)
  }
}

export function broadcastMetric(orgId: string, data: any): void {
  if (io) {
    io.to(`org:${orgId}`).emit('metric:new', data)
  }
}
