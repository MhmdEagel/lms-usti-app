"use client"

import { Search, Plus, Loader2 } from "lucide-react"
import ConversationItem from "./ConversationItem"
import NewConversationDialog from "../NewConversationDialog"

interface PropTypes {
  conversations: IChatConversation[]
  selectedConversationId: string | null
  currentUserId: string
  searchQuery: string
  onSearchChange: (q: string) => void
  onSelectConversation: (id: string) => void
  isLoading: boolean
  onNewConversation: (conv: IChatConversation) => void
  token: string
}

function ConversationListSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-muted rounded w-2/3" />
            <div className="h-2.5 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  currentUserId,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  isLoading,
  onNewConversation,
  token,
}: PropTypes) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-border sticky top-0 z-10 bg-background">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari akun..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <NewConversationDialog
          onConversationCreated={onNewConversation}
          token={token}
        >
          <button className="p-2 rounded-md hover:bg-accent transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </NewConversationDialog>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ConversationListSkeleton />
        ) : conversations.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            {searchQuery
              ? "Tidak ditemukan"
              : "Belum ada percakapan. Mulai chat dengan menekan +"}
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === selectedConversationId}
              currentUserId={currentUserId}
              onClick={() => onSelectConversation(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
