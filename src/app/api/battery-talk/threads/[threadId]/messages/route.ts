import { NextResponse } from "next/server";
import { assertBatteryTalkThreadAccess } from "@/lib/battery-talk/battery-talk-access.server";
import { isValidBatteryTalkMessage } from "@/lib/battery-talk/battery-talk-sanitize";
import { batteryTalkAddCustomerMessage } from "@/lib/battery-talk/battery-talk-store";
import { enforceIpRateLimitOrNull } from "@/lib/security/rate-limit-guard.server";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ threadId: string }> };

type PostBody = {
  body?: string;
  phone?: string;
  customerName?: string;
  visitorId?: string;
};

export async function POST(request: Request, ctx: RouteCtx) {
  const ipBlocked = await enforceIpRateLimitOrNull(
    request,
    "battery-talk.message",
    30,
    15 * 60 * 1000,
  );
  if (ipBlocked) return ipBlocked;

  const { threadId } = await ctx.params;
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!body.body?.trim()) {
    return NextResponse.json({ ok: false, message: "메시지를 입력해 주세요." }, { status: 400 });
  }

  const access = await assertBatteryTalkThreadAccess(
    request,
    threadId,
    { visitorId: body.visitorId },
    { allowLegacyVisitorClaim: true },
  );
  if (!access.ok) {
    return NextResponse.json({ ok: false, message: access.message }, { status: access.status });
  }

  try {
    const thread = await batteryTalkAddCustomerMessage(threadId, body.body, {
      phone: body.phone?.trim(),
      customerName: body.customerName?.trim(),
      visitorId: body.visitorId?.trim(),
    });
    if (!thread) {
      return NextResponse.json({ ok: false, message: "상담을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      threadId: thread.threadId,
      messages: thread.messages,
      phone: thread.phone,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "메시지 전송에 실패했습니다." }, { status: 500 });
  }
}
