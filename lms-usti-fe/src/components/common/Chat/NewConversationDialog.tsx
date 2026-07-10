"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Search, Plus } from "lucide-react"
import { chatServices } from "@/services/chat.service"

interface PropTypes {
  children: React.ReactNode
  onConversationCreated: (conv: IChatConversation) => void
  token: string
}

interface SearchUser {
  id: string
  fullname: string
  email: string
  profile?: string
  role: string
}

export default function NewConversationDialog({ children, onConversationCreated }: PropTypes) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
      setError("")
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      searchUsers(query.trim())
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const searchUsers = async (q: string) => {
    setIsSearching(true)
    setError("")
    try {
      const res = await chatServices.searchUsers(q)
      const users: SearchUser[] = res.data?.data || []
      setResults(users)
    } catch {
      setError("Gagal mencari pengguna. Coba lagi.")
      setResults([])
    }
    setIsSearching(false)
  }

  const handleSelect = useCallback(
    async (user: SearchUser) => {
      if (isCreating) return
      setIsCreating(true)
      setError("")
      try {
        const res = await chatServices.createConversation({ participant_ids: [user.id] })
        const conv: IChatConversation = res.data?.data
        if (conv) {
          onConversationCreated(conv)
          setOpen(false)
        }
      } catch {
        setError("Gagal membuat percakapan. Coba lagi.")
      }
      setIsCreating(false)
    },
    [isCreating, onConversationCreated],
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Percakapan Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="max-h-60 overflow-y-auto space-y-1">
            {isSearching ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : results.length > 0 ? (
              results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  disabled={isCreating}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left disabled:opacity-50"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.profile || ""} alt={user.fullname} />
                    <AvatarFallback className="text-xs">
                      {user.fullname
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.fullname}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                  </div>
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                </button>
              ))
            ) : query && !isSearching ? (
              <p className="text-sm text-muted-foreground text-center py-4">Tidak ditemukan</p>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
