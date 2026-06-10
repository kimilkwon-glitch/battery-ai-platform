import type { BatteryTalkRealtimeEvent } from "@/lib/battery-talk/battery-talk-realtime-hub";

export function createBatteryTalkSseResponse(
  subscribe: (send: (event: BatteryTalkRealtimeEvent) => void) => () => void,
  signal: AbortSignal,
): Response {
  const encoder = new TextEncoder();
  let cleanup: (() => void) | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: BatteryTalkRealtimeEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          /* stream closed */
        }
      };

      send({ type: "connected" });
      cleanup = subscribe(send);

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25000);

      signal.addEventListener(
        "abort",
        () => {
          clearInterval(heartbeat);
          cleanup?.();
          try {
            controller.close();
          } catch {
            /* already closed */
          }
        },
        { once: true },
      );
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
