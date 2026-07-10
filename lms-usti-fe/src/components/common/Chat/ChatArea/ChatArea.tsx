"use client"

import ChatHeader from "./ChatHeader"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import { Loader2 } from "lucide-react"

interface PropTypes {
  conversation: IChatConversation
  messages: IChatMessage[]
  currentUserId: string
  isLoadingMessages: boolean
  hasMoreMessages: boolean
  isLoadingMore: boolean
  typingUsers: { userId: string; fullname: string }[]
  onLoadMore: () => void
  onSendMessage: (content: string) => void
  onSendTyping: (conversationId: string) => void
  onSendStopTyping: (conversationId: string) => void
  onSendRead: (conversationId: string, messageId: string) => void
  onBack?: () => void
}

export default function ChatArea({
  conversation,
  messages,
  currentUserId,
  isLoadingMessages,
  hasMoreMessages,
  isLoadingMore,
  typingUsers,
  onLoadMore,
  onSendMessage,
  onSendTyping,
  onSendStopTyping,
  onSendRead,
  onBack,
}: PropTypes) {
  return (
    <div className="flex flex-col flex-1 min-h-0 max-h-full">
      <ChatHeader
        conversation={conversation}
        currentUserId={currentUserId}
        onBack={onBack}
      />
      {isLoadingMessages ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          hasMore={hasMoreMessages}
          isLoadingMore={isLoadingMore}
          typingUsers={typingUsers}
          onLoadMore={onLoadMore}
          onSendRead={(messageId) => onSendRead(conversation.id, messageId)}
        />
      )}
      <MessageInput
        conversationId={conversation.id}
        onSend={onSendMessage}
        onTyping={onSendTyping}
        onStopTyping={onSendStopTyping}
      />
    </div>
  )
}
