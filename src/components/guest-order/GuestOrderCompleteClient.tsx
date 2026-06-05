"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GUEST_ORDER_CHECK_PAGE, GUEST_ORDER_PAGE } from "@/lib/guest-order/guest-order-routes";
import { bm } from "@/lib/design-tokens";

export function GuestOrderCompleteClient() {
  const searchParams = useSearchParams();
  const requestNumber = searchParams.get("requestNumber") ?? "";

  return (
    <Card data-page="guest-order-complete">
      <CardHeader>
        <CardTitle>주문 요청이 접수되었습니다</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-700">
        <p>담당자가 차량 정보와 배터리 규격을 확인한 뒤 연락드립니다.</p>
        <p className="text-xs text-slate-500">
          비회원 주문은 연락처 기준으로 확인됩니다. 결제가 완료된 것이 아니며, 상담 후 결제·장착 일정을 안내해 드립니다.
        </p>
        {requestNumber ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-[10px] font-bold text-blue-800">주문번호</p>
            <p className="font-mono text-lg font-black text-blue-950">{requestNumber}</p>
          </div>
        ) : null}
        <p className="text-xs">
          주문번호와 연락처로{" "}
          <Link href={GUEST_ORDER_CHECK_PAGE} className="font-bold text-blue-700 hover:underline">
            주문 상태 조회
          </Link>
          가 가능합니다.
        </p>
        <Link href={GUEST_ORDER_PAGE} className={`${bm.btnTertiary} inline-flex text-xs`}>
          추가 주문 요청
        </Link>
      </CardContent>
    </Card>
  );
}
