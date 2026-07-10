"use client"

import { useMemo } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft } from "lucide-react"

interface PropTypes {
  conversation: IChatConversation
  currentUserId: string
  onBack?: () => void
}

export default function ChatHeader({ conversation, currentUserId, onBack }: PropTypes) {
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

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
      {onBack && (
        <button onClick={onBack} className="p-1 -ml-1 rounded-md hover:bg-accent md:hidden">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <Avatar className="w-9 h-9">
        <AvatarImage src={avatarUrl || ""} alt={displayName} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{displayName}</p>
        {conversation.type === "direct" && otherParticipant && (
          <p className="text-xs text-muted-foreground capitalize">{otherParticipant.user.role.toLowerCase()}</p>
        )}
      </div>
    </div>
  )
}
