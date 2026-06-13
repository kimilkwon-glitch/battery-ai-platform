"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import type { BatteryBrandSpec } from "@/data/battery/types";
import {
  BRAND_HUB_FAMILY_TABS,
  listBrandHubProductsForTab,
  resolveBrandHubSpecCard,
  type BrandHubFamilyTabId,
  type BrandHubTheme,
  type CustomerBrandHubId,
} from "@/lib/brand-hub-customer";

const INITIAL_CHIP_COUNT = 4;

type Props = {
  brandId: CustomerBrandHubId;
  theme: BrandHubTheme;
  tabCounts: Record<BrandHubFamilyTabId, number>;
};

function SpecChip({
  spec,
  brandId,
  theme,
}: {
  spec: BatteryBrandSpec;
  brandId: CustomerBrandHubId;
  theme: BrandHubTheme;
}) {
  const card = resolveBrandHubSpecCard(spec.code, brandId, spec);
  return (
    <Link
      href={card.detailHref}
      className={clsx(
        "brand-hub-spec-chip inline-flex min-h-[2.25rem] shrink-0 items-center justify-center rounded-lg px-3 py-1.5 text-xs font-black transition",
        theme.id === "rocket"
          ? "bg-white text-slate-800 ring-1 ring-[var(--brand-rocket-border)] hover:bg-[var(--brand-rocket-soft)] hover:text-[var(--brand-rocket-primary)]"
          : "bg-white text-slate-800 ring-1 ring-[var(--brand-solite-border)] hover:bg-[var(--brand-solite-soft)] hover:text-[var(--brand-solite-primary)]",
      )}
    >
      {card.displayCode}
    </Link>
  );
}

function FamilyGroup({
  familyId,
  brandId,
  theme,
  count,
}: {
  familyId: BrandHubFamilyTabId;
  brandId: CustomerBrandHubId;
  theme: BrandHubTheme;
  count: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const label = BRAND_HUB_FAMILY_TABS.find((t) => t.id === familyId)?.label ?? familyId;
  const products = listBrandHubProductsForTab(brandId, familyId);

  if (products.length === 0) return null;

  const visible = expanded ? products : products.slice(0, INITIAL_CHIP_COUNT);
  const hiddenCount = Math.max(0, products.length - INITIAL_CHIP_COUNT);

  return (
    <div className="brand-hub-mobile-family" data-family={familyId}>
      <p className={clsx("text-sm font-black", theme.contentTitle)}>
        {label}
        <span className={clsx("ml-1.5 text-xs font-bold", theme.contentMuted)}>
          · {count}개 규격
        </span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {visible.map((spec) => (
          <SpecChip key={spec.code} spec={spec} brandId={brandId} theme={theme} />
        ))}
        {!expanded && hiddenCount > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={clsx(
              "inline-flex min-h-[2.25rem] shrink-0 items-center rounded-lg px-3 py-1.5 text-xs font-black",
              "bg-slate-50 text-slate-600 ring-1 ring-dashed ring-slate-300",
            )}
          >
            +{hiddenCount} 더보기
          </button>
        ) : null}
      </div>
      {expanded && hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className={clsx("mt-2 text-xs font-bold underline", theme.contentMuted)}
        >
          접기
        </button>
      ) : null}
    </div>
  );
}

export function BrandHubMobileSpecExplorer({ brandId, theme, tabCounts }: Props) {
  return (
    <div className="brand-hub-mobile-explorer space-y-4 lg:hidden">
      {BRAND_HUB_FAMILY_TABS.map((tab) => (
        <FamilyGroup
          key={tab.id}
          familyId={tab.id}
          brandId={brandId}
          theme={theme}
          count={tabCounts[tab.id]}
        />
      ))}
    </div>
  );
}
