"use client";

import Link from "next/link";
import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import { CtaHierarchy } from "@/components/common/CtaHierarchy";
import { SectionHeader } from "@/components/common/SectionHeader";
import { BatterySpecBadge } from "@/components/common/BatterySpecBadge";
import { bm } from "@/lib/design-tokens";
import { getBatteryImageSet, getBatteryDisplaySpec } from "@/lib/battery-alias-map";
import { findBatteryBrandImages, resolveBatteryImageSetForCode } from "@/lib/batteryImages";
import { buildVehicleDetailHref } from "@/lib/battery-cta";
import { compareHref, guideHref, getBattery } from "@/lib/platform-data";

const VEHICLE_PREVIEW = 6;

type Props = {
  code: string;
  relatedCodes: string[];
  vehicles: { slug: string; title: string; brand: string; fuel: string }[];
};

/** 비핵심 규격 — 간략 상세 (핵심 9규격은 page.tsx에서 BatteryDetailHub SSR) */
export function BatteryDetailClient({ code, relatedCodes, vehicles }: Props) {
  const brandImgs = findBatteryBrandImages(code);
  const rocket =
    getBatteryImageSet(code, "rocket") ??
    (brandImgs.rocket ? { main: brandImgs.rocket } : undefined) ??
    resolveBatteryImageSetForCode(code);
  const solite = getBatteryImageSet(code, "solite") ?? (brandImgs.solite ? { main: brandImgs.solite } : undefined);
  const spec = getBatteryDisplaySpec(code);
  const catalog = getBattery(code);
  const previewVehicles = vehicles.slice(0, VEHICLE_PREVIEW);
  const hasMoreVehicles = vehicles.length > VEHICLE_PREVIEW;

  return (
    <div className="space-y-4">
      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader
          label="배터리 규격"
          title={code}
          description={
            spec
              ? `${spec.type} ${spec.capacityAh ? `${spec.capacityAh}L` : ""} 계열 · ${spec.terminal}타입`.replace(
                  /\s+/g,
                  " ",
                )
              : undefined
          }
        />
        {spec ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {spec.capacityAh ? <BatterySpecBadge tone="blue">{spec.capacityAh}Ah</BatterySpecBadge> : null}
            {catalog.cca ? <BatterySpecBadge tone="green">CCA {catalog.cca}</BatterySpecBadge> : null}
            {spec.terminal ? <BatterySpecBadge tone="gray">{spec.terminal} 단자</BatterySpecBadge> : null}
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["로케트", rocket] as const,
              ["쏠라이트", solite] as const,
            ] as const
          ).map(([label, imageSet]) => (
            <div key={label} className={`overflow-hidden ${bm.card}`}>
              <p className="bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-500">{label}</p>
              <div className={bm.imageBattery}>
                <BatteryThumbnail
                  code={code}
                  fit="contain"
                  imageSet={imageSet}
                  role="main"
                  tall
                  overlayLabel={false}
                  darkOverlay={false}
                  className="h-full w-full rounded-none"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <CtaHierarchy
            ctas={[
              { label: "내 차 기준으로 확인", href: `/search?q=${encodeURIComponent(code)}` },
              { label: "사진으로 확인", href: "/photo-check" },
            ]}
            links={[
              { label: "문의하기", href: "/ai" },
              { label: "택배·쇼핑", href: "/shop#shop-products" },
              { label: "규격 비교", href: compareHref(code, relatedCodes[0] ?? "DIN74L") },
              { label: "규격 가이드", href: guideHref("terminal-lr") },
            ]}
          />
        </div>
      </section>

      {previewVehicles.length > 0 ? (
        <section className={`${bm.card} ${bm.cardPad}`}>
          <SectionHeader
            title="대표 적용 차량"
            description={hasMoreVehicles ? `외 ${vehicles.length - VEHICLE_PREVIEW}개 차종 더 있음` : undefined}
          />
          <div className="mt-2 space-y-2">
            {previewVehicles.map((v) => (
              <Link
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-[var(--bm-border)] hover:bg-blue-50"
                href={buildVehicleDetailHref(v.slug, v.fuel)}
                key={`${v.slug}-${v.fuel}-${v.title}`}
              >
                <span>
                  <span className="block text-xs font-black">{v.title}</span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {v.brand} · {v.fuel} · {code}
                  </span>
                </span>
                <span className="text-[10px] font-black text-[var(--bm-primary)]">차량 →</span>
              </Link>
            ))}
          </div>
          {hasMoreVehicles ? (
            <Link className={`${bm.btnTertiary} mt-3 inline-flex`} href={`/search?q=${encodeURIComponent(code)}`}>
              전체 적용 차량 검색
            </Link>
          ) : null}
        </section>
      ) : null}

      {relatedCodes.length > 0 ? (
        <section className={`${bm.card} ${bm.cardPad}`}>
          <SectionHeader title="비슷한 규격" />
          <div className="mt-2 flex flex-wrap gap-2">
            {relatedCodes.map((c) => (
              <Link
                className={`${bm.badge} ${bm.badgeBlue} hover:bg-blue-100`}
                href={`/batteries/${encodeURIComponent(c)}`}
                key={c}
              >
                {c}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
