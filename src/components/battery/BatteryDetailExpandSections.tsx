"use client";

import Link from "next/link";
import { useState } from "react";
import { SpecComparisonTable } from "@/components/battery/SpecComparisonTable";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { BATTERY_DETAIL_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import { getCustomerBrandSpecs } from "@/lib/battery-knowledge";
import { bm } from "@/lib/design-tokens";
import type { BatteryDetailHubContent } from "@/lib/battery-detail/battery-detail-hub-content";
import { HUB_PHOTO_CHECK } from "@/lib/platform-hub-routes";
import { getSearchHref } from "@/lib/battery-search";

function Collapsible({
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  title: string;
  summary?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`${bm.card} overflow-hidden`}>
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="min-w-0">
          <h2 className="text-sm font-black text-slate-900">{title}</h2>
          {summary ? (
            <p className="mt-1 text-xs font-medium text-slate-500 line-clamp-2">{summary}</p>
          ) : null}
        </div>
        <span className="shrink-0 text-xs font-black text-slate-400">{open ? "접기" : "펼치기"}</span>
      </button>
      {open ? <div className="border-t border-slate-100 px-4 pb-4 pt-3">{children}</div> : null}
    </section>
  );
}

export function BatteryDetailExpandSections({
  hub,
  vehicles,
}: {
  hub: BatteryDetailHubContent;
  vehicles: { slug: string; title: string }[];
}) {
  const brandSpecs = getCustomerBrandSpecs(hub.code);
  const is100R = hub.code === "100R";
  const compareCards = hub.compareCards.filter(
    (c) => !(is100R && /AGM95L/i.test(c.target)),
  );

  return (
    <div className="space-y-3">
      <Collapsible
        title="제품 확인 포인트"
        summary="라벨·단자·크기 — 사진으로 최종 확인"
        defaultOpen
      >
        <MediaImageSlot
          slot={BATTERY_DETAIL_IMAGE_SLOTS.labelTerminal(hub.code)}
          className="max-h-[140px]"
        />
        <ul className="mt-3 list-disc space-y-1 pl-4 text-xs font-medium text-slate-600">
          <li>라벨의 규격 코드·제조일·브랜드 표기</li>
          <li>L/R 단자 방향과 케이블 길이</li>
          <li>트레이·홀드다운 고정 방식</li>
        </ul>
        <Link className={`${bm.btnSecondary} mt-3 inline-flex text-xs`} href={HUB_PHOTO_CHECK}>
          사진으로 단자 확인하기
        </Link>
      </Collapsible>

      {brandSpecs.length > 0 ? (
        <Collapsible title="브랜드별 제원 비교" summary="로케트·쏠라이트·델코 등 — 데이터 있는 브랜드만">
          <SpecComparisonTable specs={brandSpecs} compact />
        </Collapsible>
      ) : null}

      {hub.confusionSpecs.length > 0 ? (
        <Collapsible title="혼동하기 쉬운 규격" summary={hub.confusionSpecs.slice(0, 3).join(" · ")}>
          <div className="flex flex-wrap gap-2">
            {hub.confusionSpecs.map((spec) => (
              <Link
                key={spec}
                href={`/batteries/${encodeURIComponent(spec)}`}
                className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-100 hover:bg-white"
              >
                {spec}
              </Link>
            ))}
          </div>
          {is100R ? (
            <p className="mt-3 text-xs font-semibold text-amber-950">
              100R과 AGM95L은 단자 방향과 배터리 타입이 달라 단순 대체 대상이 아닙니다.
            </p>
          ) : null}
          {compareCards.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {compareCards.map((c) => (
                <li key={c.target}>
                  <Link className={`${bm.btnTertiary} inline-flex text-[11px]`} href={c.href}>
                    {c.target} 비교 보기
                  </Link>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">{c.diff}</p>
                </li>
              ))}
            </ul>
          ) : null}
          {is100R ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Link className={`${bm.btnNavy} text-xs`} href={HUB_PHOTO_CHECK}>
                L/R 단자 방향 확인하기
              </Link>
              <Link className={`${bm.btnSecondary} text-xs`} href={getSearchHref("포터2 배터리")}>
                상용차 배터리 확인하기
              </Link>
            </div>
          ) : null}
        </Collapsible>
      ) : null}

      {vehicles.length > 0 ? (
        <Collapsible
          title="대표 적용 차량"
          summary={vehicles.map((v) => v.title).join(" · ")}
        >
          <div className="flex flex-wrap gap-2">
            {vehicles.map((v) => (
              <Link
                key={v.slug}
                href={`/vehicle/${v.slug}`}
                className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 ring-1 ring-slate-100 hover:bg-white"
              >
                {v.title}
              </Link>
            ))}
          </div>
        </Collapsible>
      ) : null}

      <section className={`${bm.card} ${bm.cardPad}`}>
        <p className={bm.label}>다음 행동</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link className={`${bm.btnNavy} text-xs`} href={HUB_PHOTO_CHECK}>
            사진으로 확인
          </Link>
          <Link className={`${bm.btnSecondary} text-xs`} href="/order-checklist">
            주문 전 체크
          </Link>
          <Link className={`${bm.btnTertiary} text-xs`} href="/support/order-guide">
            주문 안내
          </Link>
          <Link className={`${bm.btnTertiary} text-xs`} href="/support">
            고객센터
          </Link>
          <Link className={`${bm.btnSecondary} text-xs`} href="/service-center">
            매장·출장 상담
          </Link>
        </div>
      </section>
    </div>
  );
}
