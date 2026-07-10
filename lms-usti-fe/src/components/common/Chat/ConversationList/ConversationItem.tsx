"use client"

import { memo, useMemo } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface PropTypes {
  conversation: IChatConversation
  isActive: boolean
  currentUserId: string
  onClick: () => void
}

function ConversationItem({ conversation, isActive, currentUserId, onClick }: PropTypes) {
  const otherParticipant = useMemo(() => {
    if (conversation.type !== "direct") return null
    return conversation.participants.find((p) => p.user_id !== currentUserId) || null
  }, [conversation, currentUserId])

  const displayName = conversation.type === "direct"
    ? (otherParticipant?.user.fullname || "Unknown")
    : (conversation.name || "Group")

  const avatarUrl = conversation.type === "direct"
    ? otherParticipant?.user.profile
    : undefined

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const role = otherParticipant?.user.role || ""

  const lastTime = useMemo(() => {
    if (!conversation.last_message_at) return ""
    const d = new Date(conversation.last_message_at)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "baru"
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}j`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
  }, [conversation.last_message_at])

  const lastMessageText = conversation.last_message?.content
    ? conversation.last_message.content.length > 40
      ? conversation.last_message.content.slice(0, 40) + "..."
      : conversation.last_message.content
    : ""

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors border-b border-border/50 hover:bg-accent/50 cursor-pointer ${
        isActive ? "bg-accent" : ""
      }`}
    >
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarImage src={avatarUrl || ""} alt={displayName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium truncate">{displayName}</span>
          <span className="text-xs text-muted-foreground shrink-0">{lastTime}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate max-w-[100px]">
            {lastMessageText || (conversation.type === "direct" ? role : "")}
          </span>
          {conversation.unread_count > 0 && (
            <span className="shrink-0 bg-primary text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
              {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

export default memo(ConversationItem)
