"use client"

import { useCallback, useEffect, useReducer, useRef } from "react"
import { toast } from "sonner"
import { useChatWebSocket } from "@/hooks/useChatWebSocket"
import { useChatState } from "@/hooks/useChatState"
import { chatServices } from "@/services/chat.service"
import { useIsMobile } from "@/hooks/use-mobile"
import ConversationList from "@/components/common/Chat/ConversationList/ConversationList"
import ChatArea from "@/components/common/Chat/ChatArea/ChatArea"
import { Loader2 } from "lucide-react"

interface PropTypes {
  user: { id: string; fullname: string; email: string; role: string; profile?: string }
  token: string
  initialConversationId?: string
}

export default function ChatPage({ user, token, initialConversationId }: PropTypes) {
  const isMobile = useIsMobile()
  const [showMobileChat, setShowMobileChat] = useReducer((_: boolean, action: boolean) => action, false)
  const chatState = useChatState()
  const chatRef = useRef(chatState)
  chatRef.current = chatState
  const hasAutoSelected = useRef(false)

  const handleIncomingMessage = useCallback(
    (message: IChatMessage) => {
      chatRef.current.addMessage(message)
    },
    [],
  )

  const handleHistory = useCallback(
    (_conversationId: string, messages: IChatMessage[]) => {
      chatRef.current.setMessagesData(messages)
      chatRef.current.setIsLoadingMessages(false)
    },
    [],
  )

  const handleTyping = useCallback(
    (conversationId: string, userId: string, fullname: string) => {
      chatRef.current.updateTypingUsers(conversationId, userId, fullname, true)
    },
    [],
  )

  const handleStopTyping = useCallback(
    (conversationId: string, userId: string) => {
      chatRef.current.updateTypingUsers(conversationId, userId, "", false)
    },
    [],
  )

  const handleReadReceipt = useCallback(
    (_conversationId: string, _messageId: string, _userId: string) => {
      // could update message read_by state
    },
    [],
  )

  const handleError = useCallback((error: string) => {
    if (error.includes("unauthorized") || error.includes("invalid token") || error.includes("auth timeout")) {
      toast.error("Sesi berakhir. Silakan login kembali.")
      return
    }
    if (error.includes("not a participant")) {
      toast.error("Anda bukan peserta percakapan ini")
      return
    }
    if (error.includes("terlalu banyak pesan")) {
      toast.error("Terlalu banyak pesan. Harap tunggu sebentar.")
      return
    }
    if (error.includes("terlalu banyak koneksi")) {
      toast.error("Terlalu banyak koneksi aktif")
      return
    }
    toast.error(error)
  }, [])

  const ws = useChatWebSocket({
    token,
    onMessage: handleIncomingMessage,
    onHistory: handleHistory,
    onTyping: handleTyping,
    onStopTyping: handleStopTyping,
    onReadReceipt: handleReadReceipt,
    onError: handleError,
  })

  const fetchConversations = useCallback(async () => {
    try {
      const res = await chatServices.getConversations()
      chatRef.current.setConversations(res.data?.data || [])
    } catch {
      chatRef.current.setConversations([])
      toast.error("Gagal memuat percakapan")
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const handleSelectConversation = useCallback(
    (id: string) => {
      const state = chatRef.current
      state.selectConversation(id)
      state.setIsLoadingMessages(true)
      ws.joinRoom(id)
      state.markConversationRead(id)

      chatServices.markConversationAsRead(id).catch(() => {})

      if (isMobile) setShowMobileChat(true)

      chatServices
        .getMessages(id, { limit: 20 })
        .then((res) => {
          state.setMessagesData(res.data?.data || [])
          state.setIsLoadingMessages(false)
        })
        .catch(() => {
          state.setMessagesData([])
          state.setIsLoadingMessages(false)
          toast.error("Gagal memuat pesan")
        })
    },
    [ws, isMobile],
  )

  const handleLoadMore = useCallback(async () => {
    const state = chatRef.current
    if (!state.selectedConversationId || !state.hasMoreMessages || state.isLoadingMore) return
    state.setIsLoadingMore(true)
    try {
      const res = await chatServices.getMessages(state.selectedConversationId, {
        cursor: state.cursorRef.current || undefined,
        limit: 20,
      })
      const msgs: IChatMessage[] = res.data?.data || []
      state.appendMessages(msgs)
    } catch {
      toast.error("Gagal memuat pesan lama")
    }
    state.setIsLoadingMore(false)
  }, [])

  const handleSendMessage = useCallback(
    async (content: string) => {
      const state = chatRef.current
      const convId = state.selectedConversationId
      if (!convId || !content.trim()) return
      state.addPendingMessage(convId, user.id, {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        profile: user.profile || "",
        role: user.role,
      }, content)
      if (ws.isConnected) {
        ws.sendMessage(convId, content)
      } else {
        try {
          await chatServices.sendMessage(convId, content)
        } catch {
          state.removePendingMessages()
          toast.error("Gagal mengirim pesan. Periksa koneksi Anda.")
        }
      }
    },
    [user, ws],
  )

  const handleNewConversation = useCallback(
    (conv: IChatConversation) => {
      chatRef.current.addConversation(conv)
      handleSelectConversation(conv.id)
    },
    [handleSelectConversation],
  )

  const handleBack = useCallback(() => {
    setShowMobileChat(false)
  }, [])

  useEffect(() => {
    if (!initialConversationId || !chatState.conversations.length || hasAutoSelected.current) return
    const conv = chatState.conversations.find((c) => c.id === initialConversationId)
    if (conv) {
      hasAutoSelected.current = true
      handleSelectConversation(conv.id)
    }
  }, [initialConversationId, chatState.conversations, handleSelectConversation])

  return (
    <div className="flex flex-1 min-h-0 max-h-full border-border border rounded-lg">
      <div className={`${isMobile && showMobileChat ? "hidden" : "flex"} w-full md:w-[30%] md:flex flex-col min-h-0 border-r border-border max-h-full self-start sticky top-0`}>
        <ConversationList
          conversations={chatState.filteredConversations}
          selectedConversationId={chatState.selectedConversationId}
          currentUserId={user.id}
          searchQuery={chatState.searchQuery}
          onSearchChange={chatState.setSearchQuery}
          onSelectConversation={handleSelectConversation}
          isLoading={chatState.isLoadingConversations}
          onNewConversation={handleNewConversation}
          token={token}
        />
      </div>
      <div className={`${isMobile && !showMobileChat ? "hidden" : "flex"} w-full md:w-[70%] md:flex flex-col min-h-0 max-h-full overflow-hidden`}>
        {chatState.selectedConversationId ? (
          <ChatArea
            conversation={chatState.selectedConversation!}
            messages={chatState.messages}
            currentUserId={user.id}
            isLoadingMessages={chatState.isLoadingMessages}
            hasMoreMessages={chatState.hasMoreMessages}
            isLoadingMore={chatState.isLoadingMore}
            typingUsers={chatState.typingUsers[chatState.selectedConversationId] || []}
            onLoadMore={handleLoadMore}
            onSendMessage={handleSendMessage}
            onSendTyping={ws.sendTyping}
            onSendStopTyping={ws.sendStopTyping}
            onSendRead={ws.sendRead}
            onBack={isMobile ? handleBack : undefined}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <p>Pilih percakapan di sebelah kiri untuk mulai mengirim pesan</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
