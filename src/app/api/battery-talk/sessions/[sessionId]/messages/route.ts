import { NextResponse } from "next/server";
import { isValidBatteryTalkMessage } from "@/lib/battery-talk/battery-talk-sanitize";
import { batteryTalkErrorResponse } from "@/lib/battery-talk/battery-talk-api-errors";
import {
  batteryTalkAddCustomerMessage,
  batteryTalkGetMessages,
} from "@/lib/battery-talk/battery-talk-store";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

type PostBody = {
  message?: string;
  body?: string;
  phone?: string;
  customerPhone?: string;
  customerName?: string;
};

export async function GET(_request: Request, ctx: RouteCtx) {
  const { sessionId } = await ctx.params;
  try {
    const messages = await batteryTalkGetMessages(sessionId);
    if (!messages) {
      return NextResponse.json({ ok: false, message: "상담을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, sessionId, messages });
  } catch (err) {
    return batteryTalkErrorResponse(err, "조회에 실패했습니다.");
  }
}

export async function POST(request: Request, ctx: RouteCtx) {
  const { sessionId } = await ctx.params;
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const text = body.message ?? body.body ?? "";
  if (!isValidBatteryTalkMessage(text)) {
    return NextResponse.json({ ok: false, message: "메시지를 입력해 주세요." }, { status: 400 });
  }

  try {
    const thread = await batteryTalkAddCustomerMessage(sessionId, text, {
      phone: body.customerPhone ?? body.phone,
      customerName: body.customerName,
    });
    if (!thread) {
      return NextResponse.json({ ok: false, message: "상담을 찾을 수 없습니다." }, { status: 404 });
    }
    const last = thread.messages[thread.messages.length - 1];
    return NextResponse.json({
      ok: true,
      sessionId: thread.threadId,
      threadId: thread.threadId,
      messages: thread.messages,
      message: last,
      phone: thread.phone,
    });
  } catch (err) {
    return batteryTalkErrorResponse(err, "메시지 전송에 실패했습니다.");
  }
}
