import { NextResponse } from "next/server";
import { batteryTalkGetByIdPeek } from "@/lib/battery-talk/battery-talk-store";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

export async function GET(_request: Request, ctx: RouteCtx) {
  const { sessionId } = await ctx.params;
  try {
    const thread = await batteryTalkGetByIdPeek(sessionId);
    if (!thread) {
      return NextResponse.json({ ok: false, message: "상담을 찾을 수 없습니다." }, { status: 404 });
    }
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
