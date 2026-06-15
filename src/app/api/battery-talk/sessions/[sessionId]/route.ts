import { NextResponse } from "next/server";
import { assertBatteryTalkThreadAccess } from "@/lib/battery-talk/battery-talk-access.server";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

export async function GET(request: Request, ctx: RouteCtx) {
  const { sessionId } = await ctx.params;
  try {
    const access = await assertBatteryTalkThreadAccess(request, sessionId);
    if (!access.ok) {
      return NextResponse.json({ ok: false, message: access.message }, { status: access.status });
    }
    const thread = access.thread;
    return NextResponse.json({
      ok: true,
      sessionId: thread.threadId,
      threadId: thread.threadId,
      status: thread.status,
      phone: thread.phone,
      messages: thread.messages,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "조회에 실패했습니다." }, { status: 500 });
  }
}
