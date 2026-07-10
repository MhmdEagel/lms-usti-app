import { useCallback, useMemo, useRef, useState } from "react"

interface TypingUser {
  userId: string
  fullname: string
}

export function useChatState() {
  const [conversations, setConversations] = useState<IChatConversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<IChatMessage[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingUser[]>>({})
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const cursorRef = useRef<string | null>(null)
  const initialFetchDone = useRef(false)

  const selectConversation = useCallback((id: string) => {
    setSelectedConversationId(id)
    cursorRef.current = null
    setHasMoreMessages(true)
  }, [])

  const setMessagesData = useCallback((msgs: IChatMessage[]) => {
    setMessages(msgs)
    if (msgs.length > 0) {
      cursorRef.current = msgs[msgs.length - 1].created_at
    }
    setHasMoreMessages(msgs.length >= 20)
  }, [])

  const appendMessages = useCallback((newMessages: IChatMessage[]) => {
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id))
      const unique = newMessages.filter((m) => !existingIds.has(m.id))
      if (unique.length > 0) {
        cursorRef.current = unique[unique.length - 1].created_at
      }
      return [...prev, ...unique]
    })
    if (newMessages.length < 20) {
      setHasMoreMessages(false)
    }
  }, [])

  const addMessage = useCallback((message: IChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev
      const filtered = prev.filter(
        (m) => !(m.id.startsWith("temp_") && m.conversation_id === message.conversation_id && m.content === message.content),
      )
      return [...filtered, message]
    })

    setConversations((prev) =>
      prev.map((c) =>
        c.id === message.conversation_id
          ? { ...c, last_message: message, last_message_at: message.created_at, unread_count: c.unread_count + (selectedConversationId === c.id ? 0 : 1) }
          : c,
      ),
    )
  }, [selectedConversationId])

  const addPendingMessage = useCallback((conversationId: string, senderId: string, sender: IChatUser, content: string) => {
    const tempMsg: IChatMessage & { isPending?: boolean } = {
      id: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      conversation_id: conversationId,
      sender_id: senderId,
      sender,
      type: "text",
      content,
      created_at: new Date().toISOString(),
      read_by: [],
    }

    setMessages((prev) => [...prev, tempMsg])
  }, [])

  const updateConversations = useCallback((convs: IChatConversation[]) => {
    setConversations(convs)
    setIsLoadingConversations(false)
  }, [])

  const updateTypingUsers = useCallback((conversationId: string, userId: string, fullname: string, isTyping: boolean) => {
    setTypingUsers((prev) => {
      const current = [...(prev[conversationId] || [])]
      if (isTyping) {
        if (!current.some((u) => u.userId === userId)) {
          return { ...prev, [conversationId]: [...current, { userId, fullname }] }
        }
      } else {
        return { ...prev, [conversationId]: current.filter((u) => u.userId !== userId) }
      }
      return prev
    })
  }, [])

  const updateUnreadCount = useCallback((conversationId: string, count: number) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread_count: count } : c)),
    )
  }, [])

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c)),
    )
  }, [])

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter((c) => {
      return c.participants.some((p) => p.user.fullname.toLowerCase().includes(q))
    })
  }, [conversations, searchQuery])

  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return null
    return conversations.find((c) => c.id === selectedConversationId) || null
  }, [conversations, selectedConversationId])

  const addConversation = useCallback((conv: IChatConversation) => {
    setConversations((prev) => {
      if (prev.some((c) => c.id === conv.id)) return prev
      return [conv, ...prev]
    })
  }, [])

  return {
    conversations,
    filteredConversations,
    selectedConversationId,
    selectedConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isLoadingMore,
    hasMoreMessages,
    searchQuery,
    typingUsers,
    cursorRef,
    initialFetchDone,
    setConversations: updateConversations,
    selectConversation,
    setMessagesData,
    appendMessages,
    addMessage,
    setSearchQuery,
    updateTypingUsers,
    updateUnreadCount,
    markConversationRead,
    setIsLoadingMessages,
    setIsLoadingMore,
    addConversation,
    addPendingMessage,
  }
}
