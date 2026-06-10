"use client";

import { useEffect, useRef, useState } from "react";
import type { BatteryTalkRealtimeEvent } from "@/lib/battery-talk/battery-talk-realtime-hub";
import type { BatteryTalkMessage } from "@/types/battery-talk";

export const BATTERY_TALK_SSE_UNSTABLE_MESSAGE =
  "실시간 연결이 불안정합니다. 메시지 전송은 가능하며, 잠시 후 자동으로 다시 연결됩니다.";

function attachBatteryTalkSseHandlers(
  es: EventSource,
  setStreamDisconnected: (disconnected: boolean) => void,
): void {
  let wasConnected = false;

  es.onopen = () => {
    wasConnected = true;
    setStreamDisconnected(false);
  };

  es.onerror = () => {
    if (wasConnected) {
      setStreamDisconnected(true);
    }
  };
}

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

export function useBatteryTalkSessionStream(
  sessionId: string | null,
  onMessage: (message: BatteryTalkMessage) => void,
  enabled = true,
): boolean {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const [streamDisconnected, setStreamDisconnected] = useState(false);

  useEffect(() => {
    if (!enabled || !sessionId) {
      setStreamDisconnected(false);
      return;
    }

    setStreamDisconnected(false);
    const es = new EventSource(`/api/battery-talk/sessions/${encodeURIComponent(sessionId)}/stream`);
    attachBatteryTalkSseHandlers(es, setStreamDisconnected);

    es.onmessage = (event) => {
      const payload = parseSsePayload(event.data);
      if (payload?.type === "message") {
        onMessageRef.current(payload.message);
      }
    };

    return () => {
      es.close();
      setStreamDisconnected(false);
    };
  }, [sessionId, enabled]);

  return streamDisconnected;
}

export function useBatteryTalkAdminStream(
  onEvent: (event: BatteryTalkRealtimeEvent) => void,
  enabled = true,
): boolean {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const [streamDisconnected, setStreamDisconnected] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setStreamDisconnected(false);
      return;
    }

    setStreamDisconnected(false);
    const es = new EventSource("/api/admin/battery-talk/stream", { withCredentials: true });
    attachBatteryTalkSseHandlers(es, setStreamDisconnected);

    es.onmessage = (event) => {
      const payload = parseSsePayload(event.data);
      if (payload) onEventRef.current(payload);
    };

    return () => {
      es.close();
      setStreamDisconnected(false);
    };
  }, [enabled]);

  return streamDisconnected;
}
