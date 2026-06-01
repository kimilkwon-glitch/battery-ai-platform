"use client";

import { BatteryDetailOrderPanel } from "@/components/battery/BatteryDetailOrderPanel";
import { BatteryDetailProductTabs } from "@/components/battery/BatteryDetailProductTabs";
import { BatteryWishlistButton } from "@/components/battery/BatteryWishlistButton";
import { BuyNowButton } from "@/components/cart/BuyNowButton";
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
    if (seenSlug.has(slug) || seenTitle.has(key) || out.length >= 8) return;
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
      <div className="mx-auto flex max-w-[1280px] items-center gap-2 px-1">
        <BuyNowButton batteryCode={code} className="flex-1 py-3 text-sm" />
        <BatteryWishlistButton code={code} size="sm" />
      </div>
    </div>
  );
}

export function BatteryDetailHub({ code, vehicles, relatedCodes = [] }: Props) {
  const hub = resolveBatteryDetailHubContent(code, relatedCodes);
  const displayCode = hub.code;
  const vehicleCards = mergeFeaturedVehicles(hub.featuredVehicles, vehicles);

  return (
    <div
      className="space-y-8 pb-20 md:pb-6"
      data-battery-detail-hub={displayCode}
      data-battery-detail-build-stamp={BATTERY_DETAIL_BUILD_STAMP}
    >
      <BatteryDetailOrderPanel code={displayCode} vehicles={vehicleCards} />

      <BatteryDetailProductTabs code={displayCode} vehicles={vehicleCards} />

      <BatteryDetailMobileSticky code={displayCode} />
    </div>
  );
}
