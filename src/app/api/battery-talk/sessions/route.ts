import { NextResponse } from "next/server";
import { inferBatteryTalkPageType } from "@/lib/battery-talk/battery-talk-context";
import { sanitizeBatteryTalkPhone } from "@/lib/battery-talk/battery-talk-sanitize";
import { batteryTalkErrorResponse } from "@/lib/battery-talk/battery-talk-api-errors";
import { batteryTalkOpenThread, batteryTalkVisitorHistory } from "@/lib/battery-talk/battery-talk-store";
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
  const { searchParams } = new URL(request.url);
  const visitorId = searchParams.get("visitorId")?.trim() ?? "";
  const threadIds = searchParams.get("threadIds")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
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
    const thread = await batteryTalkOpenThread({
      customerName: body.customerName?.trim(),
      phone: sanitizeBatteryTalkPhone(body.customerPhone ?? body.phone ?? ""),
      userId: body.userId,
      isMember: body.isMember,
      visitorId: body.visitorId?.trim(),
      context,
    });
    return NextResponse.json({
      ok: true,
      sessionId: thread.threadId,
      threadId: thread.threadId,
      messages: thread.messages,
      phone: thread.phone,
      status: thread.status,
    });
  } catch (err) {
    return batteryTalkErrorResponse(err, "채팅을 시작하지 못했습니다.");
  }
}
