import { NextResponse } from "next/server";
import { assertBatteryTalkThreadAccess } from "@/lib/battery-talk/battery-talk-access.server";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ threadId: string }> };

export async function GET(request: Request, ctx: RouteCtx) {
  const { threadId } = await ctx.params;
  try {
    const access = await assertBatteryTalkThreadAccess(request, threadId);
    if (!access.ok) {
      return NextResponse.json({ ok: false, message: access.message }, { status: access.status });
    }
    const thread = access.thread;
    return NextResponse.json({
      ok: true,
      threadId: thread.threadId,
      status: thread.status,
      phone: thread.phone,
      messages: thread.messages,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "상담을 불러오지 못했습니다." }, { status: 500 });
  }
}
