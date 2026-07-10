"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PropTypes {
  message: IChatMessage;
  isOwn: boolean;
  showSender: boolean;
}

function ChatBubble({ message, isOwn, showSender }: PropTypes) {
  const time = useMemo(() => {
    const d = new Date(message.created_at);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [message.created_at]);

  const initials = message.sender.fullname
    ? message.sender.fullname
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const isPending = message.id.startsWith("temp_");

  return (
    <div
      className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""} ${showSender ? "mt-3" : "mt-0.5"}`}
    >
      <Avatar
        className={cn("w-7 h-7 mt-0.5 shrink-0", !showSender && "invisible")}
      >
        <AvatarImage
          src={message.sender.profile || ""}
          alt={message.sender.fullname}
        />
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>
      <div
        className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}
      >
        {showSender && (
          <span
            className={`text-[11px] text-black mb-0.5 ${isOwn ? "text-right" : "text-left"}`}
          >
            {isOwn ? "Anda" : message.sender.fullname}
          </span>
        )}
        <div
          className={`
  px-3 py-2
  text-sm
  leading-relaxed
  max-w-lg
  whitespace-pre-wrap
  break-words
  overflow-wrap-anywhere
  ${
    isOwn
      ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-md"
      : "bg-white text-foreground rounded-2xl rounded-tl-md"
  }
  ${isPending && isOwn ? "opacity-70" : ""}
`}
        >
          {message.content}
          <span
            className={`block text-[10px] mt-0.5 ${
              isOwn
                ? "text-primary-foreground/70 text-right"
                : "text-muted-foreground/70 text-left"
            }`}
          >
            {isPending ? "Mengirim..." : time}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(ChatBubble);
