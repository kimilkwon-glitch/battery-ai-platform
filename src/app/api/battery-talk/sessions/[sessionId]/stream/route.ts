import { assertBatteryTalkThreadAccess } from "@/lib/battery-talk/battery-talk-access.server";
import { sessionChannel } from "@/lib/battery-talk/battery-talk-realtime-hub";
import { awaitBatteryTalkPgListenerReady } from "@/lib/battery-talk/battery-talk-realtime-pg";
import { subscribeBatteryTalkRealtime } from "@/lib/battery-talk/battery-talk-realtime-subscribe";
import { createBatteryTalkSseResponse } from "@/lib/battery-talk/battery-talk-sse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ sessionId: string }> };

export async function GET(request: Request, ctx: RouteCtx) {
  const { sessionId } = await ctx.params;
  const sid = sessionId?.trim();
  if (!sid) {
    return new Response("sessionId required", { status: 400 });
  }

  const access = await assertBatteryTalkThreadAccess(request, sid);
  if (!access.ok) {
    return new Response(access.message, { status: access.status });
  }

  await awaitBatteryTalkPgListenerReady();

  return createBatteryTalkSseResponse(
    (send) =>
      subscribeBatteryTalkRealtime(sessionChannel(sid), (event) => {
        if (event.type === "message" && event.sessionId === sid) {
          send(event);
          return;
        }
        if (event.type === "session" && event.session.threadId === sid) {
          send(event);
        }
      }),
    request.signal,
  );
}
