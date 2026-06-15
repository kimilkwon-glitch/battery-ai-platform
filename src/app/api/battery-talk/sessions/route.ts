import { NextResponse } from "next/server";
import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import { inferBatteryTalkPageType } from "@/lib/battery-talk/battery-talk-context";
import { sanitizeBatteryTalkPhone } from "@/lib/battery-talk/battery-talk-sanitize";
import { batteryTalkErrorResponse } from "@/lib/battery-talk/battery-talk-api-errors";
import { batteryTalkOpenThread, batteryTalkVisitorHistory } from "@/lib/battery-talk/battery-talk-store";
import {
  createBatteryTalkVisitorId,
  getBatteryTalkVisitorFromRequest,
  setBatteryTalkVisitorCookie,
} from "@/lib/battery-talk/battery-talk-visitor-cookie.server";
import type { BatteryTalkContext } from "@/types/battery-talk";

export const dynamic = "force-dynamic";

type PostBody = {
  customerName?: string;
  customerPhone?: string;
  phone?: string;
  userId?: string;
  isMember?: boolean;
  visitorId?: string;
  sourcePage?: string;
  productId?: string;
  productName?: string;
  batteryCode?: string;
  carName?: string;
  context?: BatteryTalkContext;
};

export async function GET(request: Request) {
  const customerSession = await getVerifiedCustomerSessionFromRequest(request);
  const { searchParams } = new URL(request.url);
  const visitorId = getBatteryTalkVisitorFromRequest(request);
  const threadIds = searchParams.get("threadIds")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

  if (customerSession?.userId) {
    try {
      const items = await batteryTalkVisitorHistory("", [], customerSession.userId);
      return NextResponse.json({ ok: true, items });
    } catch (err) {
      return batteryTalkErrorResponse(err, "문의 내역을 불러오지 못했습니다.");
    }
  }

  if (!visitorId && threadIds.length === 0) {
    return NextResponse.json({ ok: false, message: "visitorId 또는 threadIds가 필요합니다." }, { status: 400 });
  }
  try {
    const items = await batteryTalkVisitorHistory(visitorId, threadIds);
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    return batteryTalkErrorResponse(err, "문의 내역을 불러오지 못했습니다.");
  }
}

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
    pageUrl: body.context?.pageUrl ?? body.sourcePage,
    pageType: body.context?.pageType ?? inferBatteryTalkPageType(body.context?.pageUrl ?? body.sourcePage),
    productCode: body.context?.productCode ?? body.productId,
    productName: body.context?.productName ?? body.productName,
    batteryCode: body.context?.batteryCode ?? body.batteryCode,
    vehicleName: body.context?.vehicleName ?? body.carName,
  };

  try {
    const guestVisitorId = sessionUserId
      ? undefined
      : getBatteryTalkVisitorFromRequest(request) ||
        body.visitorId?.trim() ||
        context.visitorId?.trim() ||
        createBatteryTalkVisitorId();

    const thread = await batteryTalkOpenThread({
      customerName: body.customerName?.trim(),
      phone: sanitizeBatteryTalkPhone(body.customerPhone ?? body.phone ?? ""),
      userId: sessionUserId,
      isMember: sessionUserId ? true : body.isMember,
      visitorId: sessionUserId ? undefined : guestVisitorId,
      context: sessionUserId
        ? context
        : { ...context, visitorId: guestVisitorId },
    });
    const response = NextResponse.json({
      ok: true,
      sessionId: thread.threadId,
      threadId: thread.threadId,
      messages: thread.messages,
      phone: thread.phone,
      status: thread.status,
    });
    if (guestVisitorId) {
      setBatteryTalkVisitorCookie(response, guestVisitorId);
    }
    return response;
  } catch (err) {
    return batteryTalkErrorResponse(err, "채팅을 시작하지 못했습니다.");
  }
}
