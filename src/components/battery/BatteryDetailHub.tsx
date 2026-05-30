"use client";

import Link from "next/link";
import { BatteryDetailOrderPanel } from "@/components/battery/BatteryDetailOrderPanel";
import { BatteryDetailContentSlot } from "@/components/battery/BatteryDetailContentSlot";
import { BatteryDetailExpandSections } from "@/components/battery/BatteryDetailExpandSections";
import { openChatInquiry } from "@/lib/chat-inquiry-events";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { BATTERY_DETAIL_BUILD_STAMP } from "@/lib/battery-detail/core-battery-codes";
import { resolveBatteryDetailHubContent } from "@/lib/battery-detail/battery-detail-hub-fallback";
import type { HubFeaturedVehicle } from "@/lib/battery-detail/battery-detail-hub-content";
import { bm } from "@/lib/design-tokens";

type VehicleRow = { slug: string; title: string; brand: string; fuel: string };

type Props = {
  code: string;
  vehicles: VehicleRow[];
  relatedCodes?: string[];
};

function vehicleTitleKey(title: string): string {
  return title.replace(/\s+/g, "").trim().toLowerCase();
}

function formatVehicleLabel(v: HubFeaturedVehicle | VehicleRow): string {
  const condition = "condition" in v && v.condition ? v.condition : undefined;
  if (condition?.includes("2020")) return "포터2 (2020년 이후)";
  if (condition && !condition.includes("90R")) {
    const short = condition.split("·")[0]?.trim();
    if (short && short !== v.title) return `${v.title} (${short})`;
  }
  return v.title;
}

function mergeFeaturedVehicles(
  featured: HubFeaturedVehicle[],
  fromDb: VehicleRow[],
): { slug: string; title: string }[] {
  const seenSlug = new Set<string>();
  const seenTitle = new Set<string>();
  const out: { slug: string; title: string }[] = [];

  const push = (slug: string, title: string) => {
    const key = vehicleTitleKey(title);
    if (seenSlug.has(slug) || seenTitle.has(key) || out.length >= 4) return;
    seenSlug.add(slug);
    seenTitle.add(key);
    out.push({ slug, title });
  };

  for (const f of featured) {
    push(f.slug, formatVehicleLabel(f));
  }
  for (const v of fromDb) {
    push(v.slug, formatVehicleLabel(v));
  }
  return out;
}

function BatteryDetailMobileSticky({ code }: { code: string }) {
  return (
    <div className={bm.stickyMobileBar} data-battery-detail-sticky>
      <div className="mx-auto flex max-w-[1280px] gap-2">
        <Link
          className={`${bm.btnNavy} flex flex-1 items-center justify-center text-xs`}
          href={`/ai?topic=order&code=${encodeURIComponent(code)}`}
        >
          택배주문
        </Link>
        <Link
          className={`${bm.btnSecondary} flex flex-1 items-center justify-center text-xs`}
          href={HUB_STORE_DETAIL}
        >
          매장·출장
        </Link>
        <button
          type="button"
          className={`${bm.btnSecondary} flex flex-1 items-center justify-center text-xs`}
          onClick={() => openChatInquiry({ batteryCode: code })}
        >
          채팅
        </button>
      </div>
    </div>
  );
}

export function BatteryDetailHub({ code, vehicles, relatedCodes = [] }: Props) {
  const hub = resolveBatteryDetailHubContent(code, relatedCodes);
  const displayCode = hub.code;
  const vehicleCards = mergeFeaturedVehicles(hub.featuredVehicles, vehicles);
  const vehicleSummary =
    vehicleCards.length > 0
      ? `${vehicleCards
          .slice(0, 3)
          .map((v) => v.title)
          .join(" · ")}${vehicleCards.length > 3 ? " 외" : ""}`
      : undefined;

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
        vehicleSummary={vehicleSummary}
      />

      <BatteryDetailContentSlot code={displayCode} />

      <BatteryDetailExpandSections hub={hub} vehicles={vehicleCards} />

      <BatteryDetailMobileSticky code={displayCode} />
    </div>
  );
}
