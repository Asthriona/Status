import type { Ref } from 'vue'
import type { Socket } from 'socket.io-client'

export function useSocket() {
  const socket: Ref<Socket | null> = useState('socket', () => null)

  function connect(orgId: string) {
    if (socket.value?.connected) return

    const { io } = require('socket.io-client')
    socket.value = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    })

    socket.value.on('connect', () => {
      console.log('[WebSocket] Connected')
      socket.value?.emit('join-org', orgId)
    })

    socket.value.on('disconnect', () => {
      console.log('[WebSocket] Disconnected')
    })
  }

  function disconnect() {
    socket.value?.disconnect()
    socket.value = null
  }

  function on(event: string, callback: (...args: any[]) => void) {
    socket.value?.on(event, callback)
  }

  function off(event: string, callback?: (...args: any[]) => void) {
    socket.value?.off(event, callback)
  }

  return {
    socket,
    connect,
    disconnect,
    on,
    off,
  }
}
