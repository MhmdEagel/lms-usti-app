"use client"

import { useEffect, useRef, useMemo, useCallback } from "react"
import ChatBubble from "./ChatBubble"

interface PropTypes {
  messages: IChatMessage[]
  currentUserId: string
  hasMore: boolean
  isLoadingMore: boolean
  typingUsers: { userId: string; fullname: string }[]
  onLoadMore: () => void
  onSendRead: (messageId: string) => void
}

export default function MessageList({
  messages,
  currentUserId,
  hasMore,
  isLoadingMore,
  typingUsers,
  onLoadMore,
  onSendRead,
}: PropTypes) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevLengthRef = useRef(messages.length)
  const isAtBottomRef = useRef(true)

  const isAtBottom = useCallback(() => {
    const el = scrollRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      isAtBottomRef.current = isAtBottom()
      if (el.scrollTop < 50 && hasMore && !isLoadingMore) {
        onLoadMore()
      }
    }
    el.addEventListener("scroll", handleScroll)
    return () => el.removeEventListener("scroll", handleScroll)
  }, [hasMore, isLoadingMore, onLoadMore, isAtBottom])

  useEffect(() => {
    if (prevLengthRef.current !== messages.length) {
      if (messages.length > prevLengthRef.current) {
        if (isAtBottomRef.current) {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" })
        }
      } else {
        bottomRef.current?.scrollIntoView({ behavior: "instant" })
      }
      prevLengthRef.current = messages.length
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "instant" })
    }
  }, [messages])

  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: IChatMessage[] }[] = []
    for (const msg of messages) {
      const date = new Date(msg.created_at).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      const lastGroup = groups[groups.length - 1]
      if (lastGroup && lastGroup.date === date) {
        lastGroup.messages.push(msg)
      } else {
        groups.push({ date, messages: [msg] })
      }
    }
    return groups
  }, [messages])

  const showSender = (msg: IChatMessage, idx: number, groupMsgs: IChatMessage[]) => {
    if (idx === 0) return true
    return msg.sender_id !== groupMsgs[idx - 1].sender_id
  }

  const typingText = useMemo(() => {
    if (typingUsers.length === 0) return ""
    const names = typingUsers.map((u) => u.fullname)
    if (names.length === 1) return `${names[0]} sedang mengetik...`
    if (names.length === 2) return `${names[0]} dan ${names[1]} sedang mengetik...`
    return `${names[0]} dan ${names.length - 1} lainnya sedang mengetik...`
  }, [typingUsers])

  if (messages.length === 0 && !hasMore) {
    return (
      <div className="flex-1 p-4 bg-[#f6f8fc]" ref={scrollRef}>
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          Belum ada pesan. Kirim pesan pertama!
        </div>
        <div ref={bottomRef} />
        {typingText && (
          <div className="text-xs text-muted-foreground italic px-4 pb-2">{typingText}</div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-1 bg-[#f6f8fc]" ref={scrollRef}>
      {isLoadingMore && (
        <div className="text-center text-xs text-muted-foreground py-2">Memuat pesan...</div>
      )}
      {hasMore && !isLoadingMore && messages.length > 0 && (
        <div className="text-center text-xs text-muted-foreground py-2">Scroll ke atas untuk memuat lebih banyak</div>
      )}
      {groupedMessages.map((group) => (
        <div key={group.date}>
          <div className="flex justify-center my-3">
            <span className="text-[11px] text-black bg-white px-2.5 py-1 rounded-full">
              {group.date}
            </span>
          </div>
          {group.messages.map((msg, idx) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === currentUserId}
              showSender={showSender(msg, idx, group.messages)}
            />
          ))}
        </div>
      ))}
      <div ref={bottomRef} />
      {typingText && (
        <div className="text-xs text-muted-foreground italic px-1">{typingText}</div>
      )}
    </div>
  )
}
