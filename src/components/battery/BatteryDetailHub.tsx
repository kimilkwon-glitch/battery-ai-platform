"use client";

import Link from "next/link";
import { BatteryDetailOrderPanel } from "@/components/battery/BatteryDetailOrderPanel";
import { BatteryDetailContentSlot } from "@/components/battery/BatteryDetailContentSlot";
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

function mergeFeaturedVehicles(
  featured: HubFeaturedVehicle[],
  fromDb: VehicleRow[],
): { slug: string; title: string }[] {
  const seen = new Set<string>();
  const out: { slug: string; title: string }[] = [];

  for (const f of featured) {
    if (seen.has(f.slug) || out.length >= 4) continue;
    seen.add(f.slug);
    out.push({ slug: f.slug, title: f.title });
  }
  for (const v of fromDb) {
    if (seen.has(v.slug) || out.length >= 4) continue;
    seen.add(v.slug);
    out.push({ slug: v.slug, title: v.title });
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

      <BatteryDetailMobileSticky code={displayCode} />
    </div>
  );
}
