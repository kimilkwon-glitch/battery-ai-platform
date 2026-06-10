import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { enrichBatteryTalkThread } from "@/lib/battery-talk/battery-talk-enrichment";
import { batteryTalkRecallAdminMessage } from "@/lib/battery-talk/battery-talk-store";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ threadId: string; messageId: string }> };

export async function PATCH(request: Request, ctx: RouteCtx) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { threadId, messageId } = await ctx.params;
  let body: { action?: string };
  try {
    body = (await request.json()) as { action?: string };
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (body.action !== "recall") {
    return NextResponse.json({ ok: false, message: "지원하지 않는 처리입니다." }, { status: 400 });
  }

  try {
    const thread = await batteryTalkRecallAdminMessage(threadId, messageId);
    if (!thread) {
      return NextResponse.json(
        { ok: false, message: "회수할 수 없는 메시지입니다." },
        { status: 400 },
      );
    }
    const detail = await enrichBatteryTalkThread(thread);
    return NextResponse.json({ ok: true, ...detail });
  } catch {
    return NextResponse.json({ ok: false, message: "메시지 회수에 실패했습니다." }, { status: 500 });
  }
}
