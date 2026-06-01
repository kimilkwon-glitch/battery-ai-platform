"use client";

import Link from "next/link";
import { useState } from "react";
import { BatteryImageStage } from "@/components/media/BatteryImageStage";
import { BatterySpecBadge } from "@/components/common/BatterySpecBadge";
import { openChatInquiry } from "@/lib/chat-inquiry-events";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import {
  BATTERY_RETURN_OPTIONS,
  type BatteryReturnOption,
} from "@/lib/shop-order-types";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { OwnedCouponHint } from "@/components/benefits/CouponIssuerPanel";
import { bm } from "@/lib/design-tokens";

export function BatteryDetailOrderPanel({
  code,
  typeLabel,
  positioning,
  vehicleSummary,
}: {
  code: string;
  typeLabel: string;
  positioning: string;
  vehicleSummary?: string;
}) {
  const [returnOption, setReturnOption] = useState<BatteryReturnOption>("return");
  const spec = parseBatterySpecDisplay(code);
  const orderAnchor = "#battery-order";

  return (
    <section
      id="battery-order"
      className="battery-product-detail scroll-mt-24 space-y-4"
      data-battery-product={code}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="space-y-3">
          <BatteryImageStage code={code} variant="hero" className="mx-auto w-full max-w-md lg:mx-0" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-wide text-blue-600">배터리 규격</p>
          <h1 className={`${bm.specTitle} mt-0.5`} data-spec-code>
            {code}
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">{positioning}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <BatterySpecBadge tone="blue">{typeLabel}</BatterySpecBadge>
            <BatterySpecBadge tone="green">{spec.capacity ?? "용량 확인"}</BatterySpecBadge>
            <BatterySpecBadge tone="green">CCA {spec.cca ?? "확인"}</BatterySpecBadge>
            <BatterySpecBadge tone="gray">{spec.terminalLabel ?? "단자 확인"}</BatterySpecBadge>
          </div>
          {vehicleSummary ? (
            <p className="mt-3 text-xs font-medium text-slate-500">
              <span className="font-black text-slate-600">대표 적용: </span>
              {vehicleSummary}
            </p>
          ) : null}
          <p className="mt-2 text-[10px] font-medium text-amber-800/90">
            차종·연식·연료에 따라 달라질 수 있습니다. 주문 전 규격을 다시 확인하세요.
          </p>

          <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/40 p-3">
            <p className="text-xs font-black text-slate-900">폐배터리 반납 여부</p>
            <p className="mt-1 text-[10px] text-slate-500">가격·조건은 주문 상담 시 안내드립니다.</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {BATTERY_RETURN_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setReturnOption(opt.id)}
                  className={`rounded-lg border p-2.5 text-left text-[11px] ${
                    returnOption === opt.id
                      ? "border-blue-400 bg-white ring-2 ring-blue-100"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="font-black text-slate-900">{opt.label}</span>
                  <span className="mt-0.5 block font-semibold text-slate-500">{opt.description}</span>
                </button>
              ))}
            </div>
          </div>

          <OwnedCouponHint />

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              href={`/ai?topic=order&code=${encodeURIComponent(code)}&return=${returnOption}`}
              className={`${bm.btnPrimary} text-center text-sm`}
            >
              택배주문
            </Link>
            <Link href={HUB_STORE_DETAIL} className={`${bm.btnSecondary} text-center text-sm`}>
              매장·출장 안내
            </Link>
          </div>

          <AddToCartButton
            mode="battery"
            variant="tertiary"
            className="mt-2"
            input={{
              batteryCode: code,
              fitmentStatus: vehicleSummary ? "needs_customer_confirm" : "unknown",
              usedBatteryReturnOption: returnOption,
              source: "battery_detail",
            }}
          />

          <button
            type="button"
            className={`${bm.btnTertiary} mt-2 w-full text-xs`}
            onClick={() => openChatInquiry({ batteryCode: code, returnOption })}
          >
            채팅 상담
          </button>

          <p className="mt-3 text-center">
            <Link
              href={`/reviews?battery=${encodeURIComponent(code)}`}
              className="text-[11px] font-bold text-blue-700 hover:underline"
            >
              이 규격 관련 후기 보기 →
            </Link>
          </p>
        </div>
      </div>

      <div className={`${bm.card} ${bm.cardPad} text-sm font-medium text-slate-600`}>
        <p>{positioning}</p>
        <p className="mt-2 text-xs text-slate-500">
          택배 발송 전 규격·L/R·연식을 확인하세요. 반납 선택 시 폐배터리 회수 일정을 안내합니다.
        </p>
      </div>
    </section>
  );
}
