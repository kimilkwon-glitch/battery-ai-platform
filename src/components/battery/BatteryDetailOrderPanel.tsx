"use client";

import Link from "next/link";
import { useState } from "react";
import { BatteryImageStage } from "@/components/media/BatteryImageStage";
import { BatterySpecBadge } from "@/components/common/BatterySpecBadge";
import { openChatInquiry } from "@/lib/chat-inquiry-events";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { getOfficialChannel } from "@/lib/official-channels";
import { HUB_PHOTO, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { reviewsForBatteryCode } from "@/lib/reviews-mock-data";
import {
  BATTERY_RETURN_OPTIONS,
  type BatteryReturnOption,
} from "@/lib/shop-order-types";
import { bm } from "@/lib/design-tokens";

const TABS = ["상세정보", "배송/회수", "반납/미반납", "Q&A"] as const;

type TabId = (typeof TABS)[number];

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
  const [tab, setTab] = useState<TabId>("상세정보");
  const spec = parseBatterySpecDisplay(code);
  const smartstore = getOfficialChannel("naver_smartstore");
  const relatedReviews = reviewsForBatteryCode(code, 3);

  const inquiryHref = `/ai?topic=order&code=${encodeURIComponent(code)}&return=${returnOption}`;

  return (
    <section className="battery-product-detail space-y-4" data-battery-product={code}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="space-y-3">
          <BatteryImageStage code={code} variant="hero" className="w-full max-w-md mx-auto lg:mx-0" />
          <div className="grid grid-cols-3 gap-2">
            {(["main", "detail", "photo"] as const).map((role) => (
              <div
                key={role}
                className="rounded-xl border border-slate-100 bg-slate-50/80 p-1.5 text-center text-[9px] font-bold text-slate-400"
              >
                {role === "main" ? "대표" : role === "detail" ? "장착" : "라벨"}
              </div>
            ))}
          </div>
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
            <p className="mt-1 text-[10px] text-slate-500">
              {/* TODO: 가격 정책 연결 필요 */}
              가격은 주문 상담·스마트스토어 안내 시 확인됩니다.
            </p>
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

          <div className="mt-4 flex flex-col gap-2">
            <Link href={inquiryHref} className={`${bm.btnPrimary} text-center text-sm`}>
              주문 상담하기
            </Link>
            {smartstore.href && smartstore.status === "active" ? (
              <a
                href={smartstore.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${bm.btnSecondary} text-center text-sm`}
              >
                스마트스토어에서 보기
              </a>
            ) : (
              <span
                className={`${bm.btnSecondary} cursor-default text-center text-sm opacity-50`}
                aria-disabled
                title="스마트스토어 URL 준비중"
              >
                스마트스토어 준비중
              </span>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Link href={HUB_STORE_DETAIL} className={`${bm.btnTertiary} text-center text-xs`}>
                전화·매장 안내
              </Link>
              <button
                type="button"
                className={`${bm.btnTertiary} text-xs`}
                onClick={() => openChatInquiry({ batteryCode: code, returnOption })}
              >
                채팅 상담
              </button>
            </div>
            <Link href={HUB_PHOTO} className="text-center text-[11px] font-bold text-slate-500 hover:text-blue-700 hover:underline">
              사진으로 규격 확인 (보조)
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-3 py-2 text-xs font-black transition ${
              tab === t
                ? "border border-b-0 border-slate-200 bg-white text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={`${bm.card} ${bm.cardPad} -mt-px rounded-b-2xl rounded-tr-2xl border border-slate-200`}>
        {tab === "상세정보" ? (
          <ul className="space-y-2 text-sm font-medium text-slate-700">
            <li>· 제품 특징: {positioning}</li>
            <li>· 타입: {typeLabel}</li>
            <li>· 오주문 방지: 라벨·단자·연식을 함께 확인하세요.</li>
          </ul>
        ) : null}
        {tab === "배송/회수" ? (
          <ul className="space-y-2 text-sm font-medium text-slate-700">
            <li>· 택배 발송 전 규격·단자·차종을 다시 확인합니다.</li>
            <li>· 반납 선택 시 폐배터리 회수 일정을 안내합니다.</li>
            <li>· L/R·ISG·연식은 주문 전 체크리스트로 확인하세요.</li>
          </ul>
        ) : null}
        {tab === "반납/미반납" ? (
          <div className="space-y-2 text-sm font-medium text-slate-700">
            <p>반납: 기존 배터리 회수·반납 조건으로 안내합니다.</p>
            <p>미반납: 기존 배터리 반납 없이 구매하는 조건입니다.</p>
            <p className="text-xs text-slate-500">현재 선택: {returnOption === "return" ? "폐배터리 반납" : "폐배터리 미반납"}</p>
          </div>
        ) : null}
        {tab === "Q&A" ? (
          <p className="text-sm font-medium text-slate-600">
            아래 관련 Q&A와{" "}
            <Link href="/guides" className="font-bold text-blue-700 hover:underline">
              배터리 가이드
            </Link>
            에서 자주 묻는 질문을 확인하세요.
          </p>
        ) : null}
      </div>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h3 className="text-sm font-black text-slate-900">이 규격 관련 후기</h3>
        {relatedReviews.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {relatedReviews.map((r) => (
              <li key={r.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <p className="text-xs font-bold text-slate-500">
                  ★ {r.rating} · {r.authorMasked} · {r.date}
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-700">{r.body}</p>
                <Link href={r.productHref} className="mt-2 inline-block text-[11px] font-black text-blue-700 hover:underline">
                  해당 규격 보기
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm font-medium text-slate-500">관련 후기 준비중입니다.</p>
        )}
        <Link href={`/reviews?battery=${encodeURIComponent(code)}`} className="mt-3 inline-block text-xs font-black text-blue-700 hover:underline">
          배터리 교체 후기 더보기 →
        </Link>
      </section>

    </section>
  );
}
