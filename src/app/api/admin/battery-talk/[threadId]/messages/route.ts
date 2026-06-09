import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { enrichBatteryTalkThread } from "@/lib/battery-talk/battery-talk-enrichment";
import { batteryTalkAddAdminMessage } from "@/lib/battery-talk/battery-talk-store";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ threadId: string }> };

export async function POST(request: Request, ctx: RouteCtx) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { threadId } = await ctx.params;
  let body: { body?: string };
  try {
    body = (await request.json()) as { body?: string };
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!body.body?.trim()) {
    return NextResponse.json({ ok: false, message: "답변 내용을 입력해 주세요." }, { status: 400 });
  }

  try {
    const thread = await batteryTalkAddAdminMessage(threadId, body.body);
    if (!thread) {
      return NextResponse.json({ ok: false, message: "상담을 찾을 수 없습니다." }, { status: 404 });
    }
    const detail = await enrichBatteryTalkThread(thread);
    return NextResponse.json({ ok: true, ...detail });
  } catch {
    return NextResponse.json({ ok: false, message: "답변 저장에 실패했습니다." }, { status: 500 });
  }
}
