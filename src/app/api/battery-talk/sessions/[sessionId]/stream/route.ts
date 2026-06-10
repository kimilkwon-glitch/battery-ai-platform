import { sessionChannel } from "@/lib/battery-talk/battery-talk-realtime-hub";
import { subscribeBatteryTalkRealtime } from "@/lib/battery-talk/battery-talk-realtime-subscribe";
import { createBatteryTalkSseResponse } from "@/lib/battery-talk/battery-talk-sse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ sessionId: string }> };

export async function GET(request: Request, ctx: RouteCtx) {
  const { sessionId } = await ctx.params;
  if (!sessionId?.trim()) {
    return new Response("sessionId required", { status: 400 });
  }

  return createBatteryTalkSseResponse(
    (send) =>
      subscribeBatteryTalkRealtime(sessionChannel(sessionId.trim()), (event) => {
        if (event.type === "message" && event.sessionId === sessionId.trim()) {
          send(event);
        }
      }),
    request.signal,
  );
}
