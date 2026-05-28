"use client";

import Link from "next/link";
import { BatteryImageOrSlot } from "@/components/media/BatteryImageOrSlot";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { CtaHierarchy } from "@/components/common/CtaHierarchy";
import { BatterySpecBadge } from "@/components/common/BatterySpecBadge";
import { SectionHeader } from "@/components/common/SectionHeader";
import { bm } from "@/lib/design-tokens";
import { buildVehicleDetailHref } from "@/lib/battery-cta";
import {
  HUB_PHOTO,
  HUB_SHOP_ANCHORS,
  HUB_STORE,
} from "@/lib/customer-hub-routes";
import {
  BATTERY_DETAIL_HUB_VERSION,
  normalizeCoreBatteryCode,
} from "@/lib/battery-detail/core-battery-codes";
import { getBatteryDetailHubContent, type HubFeaturedVehicle } from "@/lib/battery-detail/battery-detail-hub-content";
import { BATTERY_DETAIL_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import type { HubBadge } from "@/lib/battery-detail/battery-detail-hub-content";

type VehicleRow = { slug: string; title: string; brand: string; fuel: string };

type Props = {
  code: string;
  vehicles: VehicleRow[];
};

function badgeClass(tone: HubBadge["tone"]): string {
  if (tone === "amber") return `${bm.badge} ${bm.badgeAmber}`;
  if (tone === "green") return `${bm.badge} ${bm.badgeGreen}`;
  if (tone === "gray") return `${bm.badge} ${bm.badgeGray}`;
  return `${bm.badge} ${bm.badgeBlue}`;
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
  const actions = [
    { label: "택배 주문", href: HUB_SHOP_ANCHORS.delivery },
    { label: "사진 확인", href: HUB_PHOTO },
    { label: "내 차 검색", href: `/search?q=${encodeURIComponent(code)}` },
  ];
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-3 py-2.5 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md md:hidden"
      data-battery-detail-sticky
    >
      <div className="mx-auto flex max-w-[1280px] gap-2">
        {actions.map((a, i) => (
          <Link
            key={a.label}
            className={
              i === 0
                ? `${bm.btnNavy} flex-1 text-xs`
                : i === 1
                  ? `${bm.btnSecondary} flex-1 text-xs`
                  : `${bm.btnGhost} flex-1 text-xs`
            }
            href={a.href}
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BatteryDetailHub({ code, vehicles }: Props) {
  const hubCode = normalizeCoreBatteryCode(code);
  const hub = getBatteryDetailHubContent(hubCode);
  if (!hub) return null;

  const spec = parseBatterySpecDisplay(hubCode);
  const vehicleCards = mergeFeaturedVehicles(hub.featuredVehicles, vehicles);
  const searchHref = `/search?q=${encodeURIComponent(hubCode)}`;

  return (
    <div
      className="space-y-4 pb-20 md:pb-4"
      data-battery-detail-hub={hubCode}
      data-battery-detail-hub-version={BATTERY_DETAIL_HUB_VERSION}
    >
      {/* A. Hero */}
      <section className={bm.heroPanel}>
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <p className={bm.label}>배터리 규격 허브</p>
          <h1 className={`${bm.titleLg} mt-1`}>{hubCode}</h1>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">{hub.positioning}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <BatterySpecBadge tone="blue">{hub.typeLabel}</BatterySpecBadge>
            {spec.capacity ? <BatterySpecBadge tone="green">{spec.capacity}</BatterySpecBadge> : null}
            {spec.cca ? <BatterySpecBadge tone="green">CCA {spec.cca}</BatterySpecBadge> : null}
            {spec.terminalLabel ? <BatterySpecBadge tone="gray">{spec.terminalLabel}</BatterySpecBadge> : null}
            {hub.badges.map((b) => (
              <span className={badgeClass(b.tone)} key={b.text}>
                {b.text}
              </span>
            ))}
          </div>
          {vehicleCards.length > 0 ? (
            <p className="mt-3 text-xs font-medium text-slate-500">
              대표 적용: {vehicleCards.slice(0, 3).map((v) => v.title).join(" · ")}
              {vehicleCards.length > 3 ? " 외" : ""}
            </p>
          ) : null}
        </div>

        <div className="grid gap-0 sm:grid-cols-[minmax(200px,280px)_1fr]">
          <div className="border-b border-slate-100 p-4 sm:border-b-0 sm:border-r">
            <BatteryImageOrSlot code={hubCode} ratio="4/3" tall className="rounded-xl" />
          </div>
          <div className="p-4 sm:p-5">
            <CtaHierarchy
              ctas={[
                { label: "택배 주문하기", href: HUB_SHOP_ANCHORS.delivery },
                { label: "사진으로 최종 확인", href: HUB_PHOTO },
                { label: "내 차량 기준으로 확인", href: searchHref },
              ]}
              links={[
                { label: "부산 매장/출장 문의", href: HUB_STORE },
                { label: "주문 전 규격 확인", href: HUB_SHOP_ANCHORS.orderCheck },
              ]}
            />
          </div>
        </div>
      </section>

      {/* B. Image slots */}
      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="사진 슬롯" description="실사 연결 전까지 준비중 표시 — 섹션 유지" />
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <p className="mb-1.5 text-[10px] font-black text-slate-500">제품 대표</p>
            <MediaImageSlot slot={BATTERY_DETAIL_IMAGE_SLOTS.product(hubCode)} />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-black text-slate-500">장착 예시</p>
            <MediaImageSlot slot={BATTERY_DETAIL_IMAGE_SLOTS.install(hubCode)} />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-black text-slate-500">라벨·단자</p>
            <MediaImageSlot slot={BATTERY_DETAIL_IMAGE_SLOTS.labelTerminal(hubCode)} />
          </div>
        </div>
      </section>

      {/* C. Spec cards */}
      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="핵심 사양" />
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            ["타입", hub.typeLabel],
            ["용량", spec.capacity ?? "—"],
            ["CCA", spec.cca ?? "—"],
            ["단자", spec.terminalLabel ?? "—"],
            ["용도", hub.useCase],
            ["적용 차량군", vehicleCards.length ? vehicleCards.map((v) => v.title).slice(0, 4).join(", ") : "차량 DB 확인"],
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
      {vehicleCards.length > 0 ? (
        <section className={`${bm.card} ${bm.cardPad}`}>
          <SectionHeader title="대표 적용 차량" description="연료·연식은 차량 상세에서 확인" />
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
        </section>
      ) : null}

      {/* E. Compare */}
      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="비슷한 규격 비교" description="헷갈리기 쉬운 규격 — 비교 후 주문" />
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
      </section>

      {/* F. Misorder prevention */}
      <section className={bm.warningPanel}>
        <SectionHeader title="오주문 방지" description="주문 전 반드시 확인" />
        <ul className="mt-3 space-y-2">
          {hub.misorderTips.map((tip) => (
            <li className="flex gap-2 text-sm font-medium text-slate-700" key={tip}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
              {tip}
            </li>
          ))}
        </ul>
        {hub.cautionNotes.length > 0 ? (
          <div className="mt-3 rounded-lg border border-amber-100/80 bg-white/60 px-3 py-2">
            {hub.cautionNotes.map((n) => (
              <p className="text-xs font-semibold text-amber-900/90" key={n}>
                {n}
              </p>
            ))}
          </div>
        ) : null}
        <Link className={`${bm.btnPrimary} mt-4 inline-flex text-xs`} href={HUB_PHOTO}>
          사진으로 최종 확인
        </Link>
      </section>

      {/* G. Order CTA */}
      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="주문·문의" />
        <CtaHierarchy
          ctas={[
            { label: "택배 주문하기", href: HUB_SHOP_ANCHORS.delivery },
            { label: "사진으로 최종 확인", href: HUB_PHOTO },
            { label: "부산 매장/출장 문의", href: HUB_STORE },
          ]}
          links={[{ label: "내 차량 다시 검색", href: searchHref }]}
        />
      </section>

      <BatteryDetailMobileSticky code={hubCode} />
    </div>
  );
}
