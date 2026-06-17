import { NextResponse } from "next/server";
import {
  handleTossPaymentWebhookEvent,
  isTossPaymentWebhookActive,
  type TossWebhookEvent,
} from "@/lib/payment/commerce-payment-confirm.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST — Toss PAYMENT_STATUS_CHANGED 웹훅
 *
 * 일반 결제 웹훅은 서명 헤더가 없으므로 payload만 신뢰하지 않고
 * paymentKey로 Toss 결제 조회 API 재검증 후 공통 finalize 함수를 호출한다.
 *
 * 활성화: TOSS_PAYMENT_WEBHOOK_ENABLED=true + TOSS_SECRET_KEY (계약 후 대시보드 URL 등록)
 */
export async function POST(request: Request) {
  if (!isTossPaymentWebhookActive()) {
    return NextResponse.json(
      { ok: false, message: "웹훅이 아직 활성화되지 않았습니다.", code: "WEBHOOK_DISABLED" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "invalid_json" }, { status: 400 });
  }

  const result = await handleTossPaymentWebhookEvent(body as TossWebhookEvent);
  return NextResponse.json(
    { ok: result.ok, message: result.message, code: result.code },
    { status: result.status },
  );
}
