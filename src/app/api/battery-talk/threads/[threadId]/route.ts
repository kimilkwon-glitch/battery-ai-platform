import { NextResponse } from "next/server";
import { batteryTalkGetByIdPeek } from "@/lib/battery-talk/battery-talk-store";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ threadId: string }> };

export async function GET(_request: Request, ctx: RouteCtx) {
  const { threadId } = await ctx.params;
  try {
    const thread = await batteryTalkGetByIdPeek(threadId);
    if (!thread) {
      return NextResponse.json({ ok: false, message: "상담을 찾을 수 없습니다." }, { status: 404 });
    }
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
