"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Ticket } from "lucide-react";
import clsx from "clsx";
import {
  getUserCouponForBenefit,
  issueCoupon,
  type CouponRecord,
} from "@/lib/coupon-storage";

export function CouponIssuerPanel({
  benefitId,
  benefitName,
  compact = false,
}: {
  benefitId: string;
  benefitName: string;
  compact?: boolean;
}) {
  const [coupon, setCoupon] = useState<CouponRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [issuing, setIssuing] = useState(false);

  const refresh = useCallback(() => {
    setCoupon(getUserCouponForBenefit(benefitId));
  }, [benefitId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleIssue = () => {
    setIssuing(true);
    const result = issueCoupon({ benefitId, benefitName });
    setCoupon(result.coupon);
    setIssuing(false);
    if (result.ok) showToast("쿠폰이 발급되었습니다.");
    else showToast("이미 발급된 쿠폰입니다.");
  };

  const handleCopy = async () => {
    if (!coupon?.code) return;
    try {
      await navigator.clipboard.writeText(coupon.code);
      showToast("쿠폰 코드가 복사되었습니다.");
    } catch {
      showToast("복사에 실패했습니다. 코드를 직접 선택해 주세요.");
    }
  };

  return (
    <div
      className={clsx(
        "bm-coupon-panel rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white p-4 shadow-sm sm:p-5",
        compact && "p-3 sm:p-4",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm ring-1 ring-amber-100">
          <Ticket className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-amber-900">첫 주문 3% 쿠폰 자동 적용</p>
          <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-amber-800/80">
            회원가입 후 첫 주문 조건을 만족하면 주문 단계에서 자동 반영됩니다. 이 브라우저에서 쿠폰을
            받아 두면 주문·결제 시 적용됩니다.
          </p>
        </div>
      </div>

      {coupon ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border-2 border-dashed border-amber-300/80 bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">발급된 쿠폰 코드</p>
            <p className="mt-1 font-mono text-lg font-black tracking-wide text-slate-900 sm:text-xl">
              {coupon.code}
            </p>
            <p className="mt-2 text-[11px] font-semibold text-slate-500">
              발급일 {new Date(coupon.issuedAt).toLocaleDateString("ko-KR")} · 상태{" "}
              {coupon.status === "unused" ? "미사용" : "사용완료"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-black text-white shadow-md transition hover:bg-amber-700 sm:w-auto"
          >
            <Copy className="size-4" aria-hidden />
            복사하기
          </button>
          <p className="text-[10px] font-medium leading-relaxed text-slate-500">
            이 브라우저에 저장됩니다. 다른 기기에서는 다시 발급될 수 있습니다.
          </p>
        </div>
      ) : (
        <button
          type="button"
          disabled={issuing}
          onClick={handleIssue}
          className="mt-4 w-full rounded-xl bg-amber-600 px-4 py-3 text-sm font-black text-white shadow-md transition hover:bg-amber-700 disabled:opacity-60 sm:w-auto"
        >
          회원가입 후 혜택 받기
        </button>
      )}

      {toast ? (
        <p
          role="status"
          className="mt-3 rounded-lg bg-slate-900 px-3 py-2 text-center text-xs font-bold text-white"
        >
          {toast}
        </p>
      ) : null}
    </div>
  );
}

/** 주문·상담 영역용 보유 쿠폰 표시 */
export function OwnedCouponHint({ benefitId = "first-order-3" }: { benefitId?: string }) {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    setCode(getUserCouponForBenefit(benefitId)?.code ?? null);
  }, [benefitId]);

  if (!code) return null;

  return (
    <p className="rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-[11px] font-semibold text-amber-900">
      보유 쿠폰: <span className="font-mono font-black">{code}</span>
      <span className="text-amber-700/80"> — 상담·문의 시 제시해 주세요.</span>
    </p>
  );
}
