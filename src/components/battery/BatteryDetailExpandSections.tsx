"use client";

import Link from "next/link";
import { useState } from "react";
import { SpecComparisonTable } from "@/components/battery/SpecComparisonTable";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { BATTERY_DETAIL_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import { getCustomerBrandSpecs } from "@/lib/battery-knowledge";
import { bm } from "@/lib/design-tokens";
import type { BatteryDetailHubContent } from "@/lib/battery-detail/battery-detail-hub-content";
import { getSearchHref } from "@/lib/battery-search";

function Collapsible({
  id,
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  id?: string;
  title: string;
  summary?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section id={id} className={`${bm.card} scroll-mt-24 overflow-hidden`}>
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
    <div id="battery-detail-info" className="scroll-mt-24 space-y-3">
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
        <p className="mt-3 text-[11px] font-semibold text-slate-500">
          라벨·단자는 <strong className="text-slate-700">규격 체크</strong>에서 사진으로 확인하세요.
        </p>
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
            <div className="mt-3">
              <Link className={`${bm.btnSecondary} text-xs`} href={getSearchHref("포터2 배터리")}>
                상용차 배터리 확인하기
              </Link>
            </div>
          ) : null}
        </Collapsible>
      ) : null}

      {vehicles.length > 0 ? (
        <Collapsible
          id="battery-vehicles"
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
    </div>
  );
}
