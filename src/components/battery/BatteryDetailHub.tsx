"use client";

import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { BatteryImageOrSlot } from "@/components/media/BatteryImageOrSlot";
import { BatteryDetailOrderPanel } from "@/components/battery/BatteryDetailOrderPanel";
import { openChatInquiry } from "@/lib/chat-inquiry-events";
import { SectionHeader } from "@/components/common/SectionHeader";
import { bm } from "@/lib/design-tokens";
import { buildVehicleDetailHref } from "@/lib/battery-cta";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { BATTERY_DETAIL_BUILD_STAMP } from "@/lib/battery-detail/core-battery-codes";
import { resolveBatteryDetailHubContent } from "@/lib/battery-detail/battery-detail-hub-fallback";
import type { HubFeaturedVehicle } from "@/lib/battery-detail/battery-detail-hub-content";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { BatteryDetailRelatedQna } from "@/components/battery/BatteryDetailRelatedQna";
import { BatterySpecSummary } from "@/components/battery/BatterySpecSummary";
import { BrandNoteStrip } from "@/components/battery/BrandNoteStrip";
import { BatteryKnowledgeCard } from "@/components/battery/BatteryKnowledgeCard";
import {
  getDetailKnowledgeBullets,
  getKnowledgeTopicsForSpec,
} from "@/lib/battery-knowledge";
import { UpgradeRuleCard } from "@/components/battery/UpgradeRuleCard";
import { PlatformHubLinks } from "@/components/platform/hub/PlatformHubLinks";

type VehicleRow = { slug: string; title: string; brand: string; fuel: string };

type Props = {
  code: string;
  vehicles: VehicleRow[];
  relatedCodes?: string[];
};

function specField(value: string | null | undefined, missing = "확인 필요"): string {
  const v = value?.trim();
  if (!v || v === "—") return missing;
  return v;
}

function mergeFeaturedVehicles(
  featured: HubFeaturedVehicle[],
  fromDb: VehicleRow[],
): { slug: string; title: string; brand: string; fuel: string; condition?: string }[] {
  const seen = new Set<string>();
  const out: { slug: string; title: string; brand: string; fuel: string; condition?: string }[] = [];

  for (const f of featured) {
    const key = `${f.slug}|${f.fuel ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      slug: f.slug,
      title: f.title,
      brand: "",
      fuel: f.fuel ?? "확인 필요",
      condition: f.condition,
    });
  }

  for (const v of fromDb) {
    const key = `${v.slug}|${v.fuel}`;
    if (seen.has(key) || out.length >= 8) continue;
    seen.add(key);
    out.push({ ...v, condition: `${v.brand} · ${v.fuel}` });
  }

  return out.slice(0, 8);
}

function BatteryDetailMobileSticky({ code }: { code: string }) {
  return (
    <div className={bm.stickyMobileBar} data-battery-detail-sticky>
      <div className="mx-auto flex max-w-[1280px] gap-2">
        <Link
          className={`${bm.btnNavy} flex flex-1 items-center justify-center gap-1 text-xs`}
          href={`/ai?topic=order&code=${encodeURIComponent(code)}`}
        >
          <AppIcon iconKey="delivery" size="xs" className="!text-white" />
          <span className="truncate">주문 상담</span>
        </Link>
        <button
          type="button"
          className={`${bm.btnSecondary} flex flex-1 items-center justify-center gap-1 text-xs`}
          onClick={() => openChatInquiry({ batteryCode: code })}
        >
          <AppIcon iconKey="store" size="xs" />
          <span className="truncate">채팅 상담</span>
        </button>
        <Link
          className={`${bm.btnSecondary} flex flex-1 items-center justify-center gap-1 text-xs`}
          href={HUB_STORE_DETAIL}
        >
          <AppIcon iconKey="vehicle" size="xs" />
          <span className="truncate">매장 안내</span>
        </Link>
      </div>
    </div>
  );
}

function getShortCautionNote(code: string): string {
  if (/^AGM/i.test(code)) {
    return "AGM 적용 차량은 일반 배터리와 충전 방식이 다를 수 있습니다. 현재 장착 규격과 차량 조건을 함께 확인해 주세요.";
  }
  return "차량에 따라 코딩·등록 또는 장착 조건이 다를 수 있습니다. 현재 장착 배터리 라벨과 단자 위치를 함께 보면 오주문을 줄일 수 있습니다.";
}

export function BatteryDetailHub({ code, vehicles, relatedCodes = [] }: Props) {
  const hub = resolveBatteryDetailHubContent(code, relatedCodes);
  const displayCode = hub.code;
  const spec = parseBatterySpecDisplay(displayCode);
  const vehicleCards = mergeFeaturedVehicles(hub.featuredVehicles, vehicles);
  const searchHref = `/search?q=${encodeURIComponent(displayCode)}`;
  const knowledgeBullets = getDetailKnowledgeBullets(displayCode);
  const relatedKnowledge = getKnowledgeTopicsForSpec(displayCode);
  const capacityLabel = specField(spec.capacity);
  const ccaLabel = specField(spec.cca, "차량/브랜드별 확인 필요");
  const terminalLabel = specField(spec.terminalLabel);

  return (
    <div
      className="space-y-4 pb-20 md:pb-4"
      data-battery-detail-hub={displayCode}
      data-battery-detail-build-stamp={BATTERY_DETAIL_BUILD_STAMP}
    >
      <BatteryDetailOrderPanel
        code={displayCode}
        typeLabel={hub.typeLabel}
        positioning={hub.positioning}
        vehicleSummary={
          vehicleCards.length > 0
            ? `${vehicleCards
                .slice(0, 3)
                .map((v) => v.title)
                .join(" · ")}${vehicleCards.length > 3 ? " 외" : ""}`
            : undefined
        }
      />

      {/* B. Image slots */}
      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="사진 슬롯" description="실사 연결 전까지 준비중 표시 — 섹션 유지" />
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <p className="mb-1.5 text-[10px] font-bold text-slate-500">제품 대표</p>
            <BatteryImageOrSlot code={displayCode} role="main" ratio="4/3" className="min-h-[140px]" />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-bold text-slate-500">장착 예시</p>
            <BatteryImageOrSlot code={displayCode} role="detail" ratio="4/3" className="min-h-[140px]" />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-bold text-slate-500">라벨·단자</p>
            <BatteryImageOrSlot code={displayCode} role="photo" ratio="4/3" className="min-h-[140px]" />
          </div>
        </div>
      </section>

      <BatterySpecSummary code={displayCode} />

      {knowledgeBullets.length > 0 ? (
        <BatteryKnowledgeCard
          title={`${displayCode} 확인 포인트`}
          summary={knowledgeBullets[0] ?? hub.positioning}
          checkPoints={knowledgeBullets.slice(1)}
          href={
            /EV|12V/i.test(displayCode)
              ? "/guides/knowledge/bk-ev-aux-12v"
              : /R$/i.test(displayCode) || /L$/i.test(displayCode)
                ? "/guides/knowledge/bk-lr-from-name"
                : "/guides#battery-knowledge"
          }
          compact
        />
      ) : null}

      <UpgradeRuleCard code={displayCode} compact />

      {relatedKnowledge.length > 0 ? (
        <section className={`${bm.card} ${bm.cardPad}`}>
          <SectionHeader title="관련 배터리 안내" description="규격 이해용" />
          <ul className="mt-2 space-y-2">
            {relatedKnowledge.map((t) => (
              <li key={t.id}>
                <Link
                  className={`block ${bm.cardInteractive} p-3`}
                  href={`/guides/knowledge/${t.id}`}
                >
                  <p className="text-sm font-black text-slate-900">{t.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-600">{t.hook}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* C. Spec cards */}
      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="핵심 사양" />
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            ["타입", hub.typeLabel],
            ["용량", capacityLabel],
            ["CCA", ccaLabel],
            ["단자", terminalLabel],
            ["용도", hub.useCase],
            [
              "적용 차량군",
              vehicleCards.length
                ? vehicleCards.map((v) => v.title).slice(0, 4).join(", ")
                : "대표 적용 차량 데이터 준비중",
            ],
            ["혼동 주의", hub.confusionSpecs.join(", ")],
          ].map(([k, v]) => (
            <div className={bm.surfaceMuted + " px-3 py-2.5"} key={k}>
              <dt className="text-[10px] font-black uppercase tracking-wide text-slate-400">{k}</dt>
              <dd className="mt-0.5 text-sm font-bold text-slate-800">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* D. Vehicles */}
      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="대표 적용 차량" description="연료·연식은 차량 상세에서 확인" />
        {vehicleCards.length > 0 ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {vehicleCards.map((v) => (
              <article
                className={`${bm.cardInteractive} flex flex-col justify-between p-3`}
                key={`${v.slug}-${v.fuel}`}
              >
                <div>
                  <p className="text-sm font-black text-slate-950">{v.title}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
                    {v.condition ?? `${v.brand} · ${v.fuel}`}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link className={`${bm.btnSecondary} text-[10px]`} href={buildVehicleDetailHref(v.slug, v.fuel)}>
                    차량 상세
                  </Link>
                  <Link
                    className={`${bm.btnTertiary} text-[10px]`}
                    href={buildVehicleDetailHref(v.slug, v.fuel)}
                  >
                    내 차량 기준 확인
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={`${bm.surfaceMuted} mt-3 p-4`}>
            <p className="text-sm font-bold text-slate-800">대표 적용 차량 데이터 준비중</p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              라벨·단자 사진을 함께 보면 안전합니다. 차량명으로 검색해 연식·연료를 확인해 주세요.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link className={`${bm.btnSecondary} text-xs`} href={searchHref}>
                차량 검색
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* E. Compare */}
      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="비슷한 규격 비교" description="헷갈리기 쉬운 규격 — 비교 후 주문" />
        {hub.compareCards.length > 0 ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {hub.compareCards.map((c) => (
              <article className={`${bm.surfaceMuted} p-3`} key={c.target}>
                <p className="text-sm font-black text-slate-900">{c.target}</p>
                <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">{c.diff}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link className={`${bm.btnSecondary} text-[10px]`} href={c.href}>
                    비교 보기
                  </Link>
                  <Link className={`${bm.btnTertiary} text-[10px]`} href={c.detailHref}>
                    {c.target} 상세
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className={`${bm.surfaceMuted} mt-3 px-3 py-4 text-sm font-medium text-slate-600`}>
            비슷한 규격은 사진 확인 후 안내합니다. 무리한 대체 주문을 피하세요.
          </p>
        )}
      </section>

      {/* F. Short caution */}
      <section className={`${bm.card} ${bm.cardPad}`}>
        <p className="text-sm font-medium leading-relaxed text-slate-700">
          {getShortCautionNote(displayCode)}
        </p>
        {hub.cautionNotes.length > 0 ? (
          <p className="mt-2 text-xs font-medium text-slate-600">{hub.cautionNotes[0]}</p>
        ) : null}
      </section>

      <BatteryDetailRelatedQna code={displayCode} />

      <BrandNoteStrip compact />

      <PlatformHubLinks title="다음에 확인하기" limit={6} />

      <BatteryDetailMobileSticky code={displayCode} />
    </div>
  );
}
