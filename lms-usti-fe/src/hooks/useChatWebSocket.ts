import { useCallback, useEffect, useRef, useState } from "react"
import { environtment } from "@/config/environtment"

interface UseChatWebSocketOptions {
  token: string
  onMessage: (message: IChatMessage) => void
  onHistory: (conversationId: string, messages: IChatMessage[]) => void
  onTyping: (conversationId: string, userId: string, fullname: string) => void
  onStopTyping: (conversationId: string, userId: string) => void
  onReadReceipt: (conversationId: string, messageId: string, userId: string) => void
  onError: (error: string) => void
}

export function useChatWebSocket({
  token,
  onMessage,
  onHistory,
  onTyping,
  onStopTyping,
  onReadReceipt,
  onError,
}: UseChatWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptRef = useRef(0)
  const maxReconnectAttempts = 5
  const isAuthRef = useRef(false)
  const joinedRoomsRef = useRef<Set<string>>(new Set())

  const connect = useCallback(() => {
    if (!token) return

    const httpUrl = environtment.API_URL || "http://localhost:3001/lms-usti-api"
    const wsUrl = httpUrl.replace(/^http/, "ws") + "/ws/chat"
    const socket = new WebSocket(wsUrl)
    wsRef.current = socket

    socket.onopen = () => {
      isAuthRef.current = false
      socket.send(JSON.stringify({ type: "auth", token }))
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        switch (data.type) {
          case "auth_ok":
            isAuthRef.current = true
            setIsConnected(true)
            reconnectAttemptRef.current = 0
            break

          case "history":
            onHistory(data.conversation_id, data.messages || [])
            break

          case "message":
            onMessage(data.message)
            break

          case "typing":
            onTyping(data.conversation_id, data.user_id, data.fullname)
            break

          case "stop_typing":
            onStopTyping(data.conversation_id, data.user_id)
            break

          case "read_receipt":
            onReadReceipt(data.conversation_id, data.message_id, data.user_id)
            break

          case "error":
            onError(data.message || "WebSocket error")
            break
        }
      } catch {
        // ignore parse errors
      }
    }

    socket.onclose = () => {
      setIsConnected(false)
      isAuthRef.current = false

      if (reconnectAttemptRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 30000)
        reconnectAttemptRef.current++
        setTimeout(() => connect(), delay)
      }
    }

    socket.onerror = () => {
      socket.close()
    }
  }, [token, onMessage, onHistory, onTyping, onStopTyping, onReadReceipt, onError])

  useEffect(() => {
    connect()
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  const send = useCallback((type: string, payload: Record<string, unknown> = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...payload }))
    }
  }, [])

  const joinRoom = useCallback((conversationId: string) => {
    if (joinedRoomsRef.current.has(conversationId)) return
    joinedRoomsRef.current.add(conversationId)
    send("join", { conversation_id: conversationId })
  }, [send])

  const sendMessage = useCallback((conversationId: string, content: string) => {
    send("message", { conversation_id: conversationId, content })
  }, [send])

  const sendTyping = useCallback((conversationId: string) => {
    send("typing", { conversation_id: conversationId })
  }, [send])

  const sendStopTyping = useCallback((conversationId: string) => {
    send("stop_typing", { conversation_id: conversationId })
  }, [send])

  const sendRead = useCallback((conversationId: string, messageId: string) => {
    send("read", { conversation_id: conversationId, message_id: messageId })
  }, [send])

  return {
    isConnected,
    joinRoom,
    sendMessage,
    sendTyping,
    sendStopTyping,
    sendRead,
  }
}
