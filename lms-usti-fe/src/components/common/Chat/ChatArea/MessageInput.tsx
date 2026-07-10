"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Send } from "lucide-react"

interface PropTypes {
  conversationId: string
  onSend: (content: string) => void
  onTyping: (conversationId: string) => void
  onStopTyping: (conversationId: string) => void
}

export default function MessageInput({ conversationId, onSend, onTyping, onStopTyping }: PropTypes) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTypingRef = useRef(0)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  const handleTyping = useCallback(() => {
    const now = Date.now()
    if (now - lastTypingRef.current > 3000) {
      onTyping(conversationId)
      lastTypingRef.current = now
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping(conversationId)
    }, 2000)
  }, [conversationId, onTyping, onStopTyping])

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue("")
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    onStopTyping(conversationId)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.focus()
    }
  }, [value, onSend, conversationId, onStopTyping])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value)
      if (e.target.value.trim()) {
        handleTyping()
      }
      const el = e.target
      el.style.height = "auto"
      el.style.height = Math.min(el.scrollHeight, 120) + "px"
    },
    [handleTyping],
  )

  return (
    <div className="border-t border-border p-3 bg-background">
      <div className="flex items-end gap-2 bg-muted/50 rounded-xl px-3 py-2 border border-border">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Kirim pesan..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground max-h-[120px]"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
