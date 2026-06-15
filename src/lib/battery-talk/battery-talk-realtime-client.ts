"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BatteryTalkRealtimeEvent } from "@/lib/battery-talk/battery-talk-realtime-hub";
import type { BatteryTalkMessage, BatteryTalkThreadSummary } from "@/types/battery-talk";

export const BATTERY_TALK_SSE_UNSTABLE_MESSAGE =
  "실시간 연결이 불안정합니다. 메시지 전송은 가능하며, 잠시 후 자동으로 다시 연결됩니다.";

function parseSsePayload(raw: string): BatteryTalkRealtimeEvent | null {
  try {
    return JSON.parse(raw) as BatteryTalkRealtimeEvent;
  } catch {
    return null;
  }
}

export function appendUniqueMessage(
  prev: BatteryTalkMessage[],
  message: BatteryTalkMessage,
): BatteryTalkMessage[] {
  if (prev.some((m) => m.id === message.id)) return prev;
  return [...prev, message].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

type SessionStreamOptions = {
  onSession?: (session: BatteryTalkThreadSummary) => void;
  /** SSE reconnect 직후 1회만 호출 (폴링 아님) */
  syncOnReconnect?: () => void | Promise<void>;
};

function useBatteryTalkEventSource(
  url: string | null,
  onEvent: (event: BatteryTalkRealtimeEvent) => void,
  enabled: boolean,
  options?: { withCredentials?: boolean; syncOnReconnect?: () => void | Promise<void> },
): boolean {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const syncRef = useRef(options?.syncOnReconnect);
  syncRef.current = options?.syncOnReconnect;
  const [streamDisconnected, setStreamDisconnected] = useState(false);
  const hadDisconnectRef = useRef(false);

  useEffect(() => {
    if (!enabled || !url) {
      setStreamDisconnected(false);
      hadDisconnectRef.current = false;
      return;
    }

    let es: EventSource | null = null;
    let disposed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectAttempt = 0;

    const clearReconnectTimer = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const connect = () => {
      if (disposed) return;
      es?.close();
      es = new EventSource(url, options?.withCredentials ? { withCredentials: true } : undefined);

      es.onopen = () => {
        reconnectAttempt = 0;
        if (hadDisconnectRef.current) {
          hadDisconnectRef.current = false;
          void syncRef.current?.();
        }
        setStreamDisconnected(false);
      };

      es.onmessage = (event) => {
        const payload = parseSsePayload(event.data);
        if (!payload || payload.type === "connected") return;
        onEventRef.current(payload);
      };

      es.onerror = () => {
        if (disposed) return;
        hadDisconnectRef.current = true;
        setStreamDisconnected(true);
        es?.close();
        es = null;
        reconnectAttempt += 1;
        const delayMs = Math.min(15_000, 500 * 2 ** Math.min(reconnectAttempt, 5));
        clearReconnectTimer();
        reconnectTimer = setTimeout(connect, delayMs);
      };
    };

    connect();

    return () => {
      disposed = true;
      clearReconnectTimer();
      es?.close();
      es = null;
      setStreamDisconnected(false);
      hadDisconnectRef.current = false;
    };
  }, [enabled, url, options?.withCredentials]);

  return streamDisconnected;
}

export function useBatteryTalkSessionStream(
  sessionId: string | null,
  onMessage: (message: BatteryTalkMessage) => void,
  enabled = true,
  options?: SessionStreamOptions,
): boolean {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const onSessionRef = useRef(options?.onSession);
  onSessionRef.current = options?.onSession;

  const url = useMemo(() => {
    if (!sessionId) return null;
    return `/api/battery-talk/sessions/${encodeURIComponent(sessionId)}/stream`;
  }, [sessionId]);

  return useBatteryTalkEventSource(
    url,
    (event) => {
      if (event.type === "message") {
        onMessageRef.current(event.message);
        return;
      }
      if (event.type === "session") {
        onSessionRef.current?.(event.session);
      }
    },
    enabled,
    { withCredentials: true, syncOnReconnect: options?.syncOnReconnect },
  );
}

export function useBatteryTalkAdminStream(
  onEvent: (event: BatteryTalkRealtimeEvent) => void,
  enabled = true,
  options?: { syncOnReconnect?: () => void | Promise<void> },
): boolean {
  return useBatteryTalkEventSource(
    "/api/admin/battery-talk/stream",
    (event) => onEvent(event),
    enabled,
    { withCredentials: true, syncOnReconnect: options?.syncOnReconnect },
  );
}
