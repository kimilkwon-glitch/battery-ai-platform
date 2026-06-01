"use client";

import Link from "next/link";
import { openChatInquiry } from "@/lib/chat-inquiry-events";
import { CUSTOMER_CENTER_HUB } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

export function CustomerConsultCta({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`${bm.btnNavy} text-xs`} onClick={() => openChatInquiry()}>
          채팅 상담
        </button>
        <Link className={`${bm.btnSecondary} text-xs`} href={`${CUSTOMER_CENTER_HUB}?tab=inquiry`}>
          문의 접수
        </Link>
      </div>
    );
  }

  return (
    <section className={`${bm.card} ${bm.cardPad} bg-gradient-to-br from-slate-50 to-blue-50/40`}>
      <h2 className="text-base font-black text-slate-900">상담 연결</h2>
      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
        주문·배송·반품·폐전지 반납 문의는 채팅 상담 또는 고객센터 문의 접수로 연결해 드립니다.
        확인 후 안내드리는 항목은 상담 시 차량·주문 정보를 함께 알려 주시면 빠릅니다.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={bm.btnNavy} onClick={() => openChatInquiry()}>
          상담 문의하기
        </button>
        <Link className={bm.btnSecondary} href={`${CUSTOMER_CENTER_HUB}?tab=inquiry`}>
          문의 폼 작성
        </Link>
      </div>
    </section>
  );
}
