import { NextResponse } from "next/server";
import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import { inferBatteryTalkPageType } from "@/lib/battery-talk/battery-talk-context";
import { batteryTalkOpenThread } from "@/lib/battery-talk/battery-talk-store";
import type { BatteryTalkContext } from "@/types/battery-talk";

export const dynamic = "force-dynamic";

type PostBody = {
  customerName?: string;
  phone?: string;
  userId?: string;
  isMember?: boolean;
  visitorId?: string;
  context?: BatteryTalkContext;
};

export async function POST(request: Request) {
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const customerSession = await getVerifiedCustomerSessionFromRequest(request);
  const sessionUserId = customerSession?.userId;

  const context: BatteryTalkContext = {
    ...body.context,
    pageType: body.context?.pageType ?? inferBatteryTalkPageType(body.context?.pageUrl),
    visitorId: sessionUserId ? body.context?.visitorId : body.visitorId?.trim() || body.context?.visitorId,
  };

  try {
    const thread = await batteryTalkOpenThread({
      customerName: body.customerName?.trim(),
      phone: body.phone?.trim(),
      userId: sessionUserId,
      isMember: sessionUserId ? true : body.isMember,
      visitorId: sessionUserId ? undefined : body.visitorId?.trim(),
      context,
    });
    return NextResponse.json({
      ok: true,
      threadId: thread.threadId,
      messages: thread.messages,
      phone: thread.phone,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "채팅을 시작하지 못했습니다." }, { status: 500 });
  }
}
