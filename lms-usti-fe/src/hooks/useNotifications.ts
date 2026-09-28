"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/actions/get-token";
import { environtment } from "@/config/environtment";
import { notificationServices } from "@/services/notification.service";

const INITIAL_LIMIT = 10;
const MAX_RECONNECT_DELAY = 30 * 1000;

type ConnectionState = "connecting" | "connected" | "disconnected";

export function useNotifications() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");

  const abortRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const stoppedRef = useRef(false);
  const connectRef = useRef<(() => Promise<void>) | null>(null);

  const loadInitial = useCallback(async () => {
    try {
      const [listResponse, countResponse] = await Promise.all([
        notificationServices.findAll({ page: 1, limit: INITIAL_LIMIT }),
        notificationServices.unreadCount(),
      ]);
      const items = listResponse.data?.data;
      if (Array.isArray(items)) {
        setNotifications(items as INotification[]);
        setPage(1);
        setHasMore(items.length === INITIAL_LIMIT);
      }
      const count = countResponse.data?.data?.unread_count;
      if (typeof count === "number") {
        setUnreadCount(count);
      }
      setIsError(false);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await notificationServices.findAll({ page: nextPage, limit: INITIAL_LIMIT });
      const items = response.data?.data;
      if (Array.isArray(items)) {
        setNotifications((current) => {
          const known = new Set(current.map((item) => item.id));
          return [...current, ...(items as INotification[]).filter((item) => !known.has(item.id))];
        });
        setPage(nextPage);
        setHasMore(items.length === INITIAL_LIMIT);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page]);

  const applyIncoming = useCallback((notification: INotification) => {
    setNotifications((current) => {
      if (current.some((item) => item.id === notification.id)) {
        return current;
      }
      return [notification, ...current];
    });
    if (!notification.is_read) {
      setUnreadCount((current) => current + 1);
    }
  }, []);

  const parseFrame = useCallback(
    (frame: string) => {
      let eventName = "";
      let data = "";
      for (const line of frame.split("\n")) {
        if (line.startsWith("event:")) {
          eventName = line.slice("event:".length).trim();
        } else if (line.startsWith("data:")) {
          data += line.slice("data:".length).trim();
        }
      }
      if (eventName !== "notification" || !data) return;
      try {
        const notification = JSON.parse(data) as INotification;
        if (notification?.id) {
          applyIncoming(notification);
        }
      } catch {
        // ignore malformed frames
      }
    },
    [applyIncoming],
  );

  const scheduleReconnect = useCallback(() => {
    if (stoppedRef.current) return;
    const delay = Math.min(1000 * 2 ** attemptRef.current, MAX_RECONNECT_DELAY);
    attemptRef.current += 1;
    retryTimeoutRef.current = setTimeout(() => {
      void connectRef.current?.();
    }, delay);
  }, []);

  const connect = useCallback(async () => {
    if (stoppedRef.current) return;

    const token = await getAccessToken();
    if (!token) {
      setConnectionState("disconnected");
      return;
    }

    const baseUrl = (environtment.API_URL || "").replace(/\/+$/, "");
    if (!baseUrl) {
      setConnectionState("disconnected");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setConnectionState("connecting");

    try {
      const response = await fetch(`${baseUrl}/notifications/stream`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        stoppedRef.current = true;
        setConnectionState("disconnected");
        return;
      }
      if (!response.ok || !response.body) {
        throw new Error(`stream gagal: ${response.status}`);
      }

      attemptRef.current = 0;
      setConnectionState("connected");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          parseFrame(frame);
        }
      }
    } catch {
      // aborted or connection dropped, reconnect below
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setConnectionState("disconnected");
      if (!stoppedRef.current) {
        scheduleReconnect();
      }
    }
  }, [parseFrame, scheduleReconnect]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const target = notifications.find((item) => item.id === notificationId);
    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item)),
    );
    if (target && !target.is_read) {
      setUnreadCount((current) => Math.max(current - 1, 0));
    }
    try {
      await notificationServices.markAsRead(notificationId);
    } catch {
      void loadInitial();
    }
  }, [notifications, loadInitial]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
    setUnreadCount(0);
    try {
      await notificationServices.markAllAsRead();
    } catch {
      void loadInitial();
    }
  }, [loadInitial]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    stoppedRef.current = false;
    void loadInitial();
    void connect();

    return () => {
      stoppedRef.current = true;
      abortRef.current?.abort();
      abortRef.current = null;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [connect, loadInitial]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    isLoadingMore,
    hasMore,
    isConnected: connectionState === "connected",
    markAsRead,
    markAllAsRead,
    loadMore,
    refresh: loadInitial,
  };
}
