"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

import { useRouter, usePathname } from "next/navigation";
import { Bell, ClipboardCheck, FileText, Inbox, MessagesSquare, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);
dayjs.locale("id");

const TYPE_META: Record<TNotificationType, { icon: LucideIcon; label: string }> = {
  ASSIGNMENT_CREATED: { icon: FileText, label: "Tugas baru" },
  SUBMISSION_GRADED: { icon: ClipboardCheck, label: "Tugas dinilai" },
  FORUM_POST_CREATED: { icon: MessagesSquare, label: "Forum" },
};

function buildNotificationLink(notification: INotification, pathname: string): string {
  const role = pathname.split("/").filter(Boolean)[0] ?? "mahasiswa";
  const prefix = `/${role}`;
  switch (notification.type) {
    case "ASSIGNMENT_CREATED":
      return `${prefix}/kelas/${notification.classroom_id}/tugas/${notification.assignment_id}`;
    case "SUBMISSION_GRADED":
      return `${prefix}/kelas/${notification.classroom_id}/nilai`;
    case "FORUM_POST_CREATED":
      return `${prefix}/forum/${notification.forum_post_id}`;
    default:
      return prefix;
  }
}

function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    isLoadingMore,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadMore,
    refresh,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSelect = (notification: INotification) => {
    if (!notification.is_read) {
      void markAsRead(notification.id);
    }
    setOpen(false);
    router.push(buildNotificationLink(notification, pathname));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifikasi">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium leading-none text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifikasi</p>
          <button
            type="button"
            onClick={() => void markAllAsRead()}
            disabled={unreadCount === 0}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            Tandai semua dibaca
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">Gagal memuat notifikasi</p>
              <Button variant="outline" size="sm" onClick={() => void refresh()}>
                Coba lagi
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
              <Inbox className="size-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">Belum ada notifikasi</p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => {
                const meta = TYPE_META[notification.type] ?? { icon: Bell, label: "" };
                const Icon = meta.icon;
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleSelect(notification)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent",
                      !notification.is_read && "bg-accent/50",
                    )}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "truncate text-sm",
                            notification.is_read ? "font-medium" : "font-semibold",
                          )}
                        >
                          {notification.title}
                        </span>
                        {!notification.is_read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                        {notification.body}
                      </span>
                      <span className="mt-1 block text-[11px] text-muted-foreground/80">
                        {dayjs(notification.created_at).fromNow()}
                      </span>
                    </span>
                  </button>
                );
              })}
              {hasMore && (
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => void loadMore()}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? "Memuat..." : "Muat lebih banyak"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;
