import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payment/payment-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST — 결제 승인 확인 (PG 연동 후 서버에서만 처리)
 * 현재: PG 미연동 — 안전한 501 응답
 */
export async function POST() {
  const provider = getPaymentProvider();
  return NextResponse.json(
    {
      ok: false,
      code: "PAYMENT_NOT_AVAILABLE",
      message:
        provider === "none"
          ? "결제 기능이 아직 제공되지 않습니다. 잠시 후 다시 시도해 주세요."
          : "결제 승인 처리를 준비 중입니다. 고객센터로 문의해 주세요.",
    },
    { status: 501 },
  );
}
