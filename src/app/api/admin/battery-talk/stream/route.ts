import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { ADMIN_LIST_CHANNEL } from "@/lib/battery-talk/battery-talk-realtime-hub";
import { awaitBatteryTalkPgListenerReady } from "@/lib/battery-talk/battery-talk-realtime-pg";
import { subscribeBatteryTalkRealtime } from "@/lib/battery-talk/battery-talk-realtime-subscribe";
import { createBatteryTalkSseResponse } from "@/lib/battery-talk/battery-talk-sse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return new Response(JSON.stringify(adminUnauthorizedResponse()), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  await awaitBatteryTalkPgListenerReady();

  return createBatteryTalkSseResponse(
    (send) => subscribeBatteryTalkRealtime(ADMIN_LIST_CHANNEL, send),
    request.signal,
  );
}
