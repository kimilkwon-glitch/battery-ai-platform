import type { VehicleSearchRow } from "@/components/platform/SearchVehicleResults";

const VEHICLE_DETAIL_RE = /^\/vehicle\/([^/?#]+)/i;
const SEARCH_LOOP_RE = /^\/search\?/i;

/** 검색 카드·CTA — 상세 경로 (/vehicle/[slug]) */
export function slugFromSearchVehicleRow(row: VehicleSearchRow): string | null {
  const href = row.href?.trim();
  if (!href) return null;
  const m = href.match(VEHICLE_DETAIL_RE);
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

export function resolveSearchVehicleCardDetailHref(row: VehicleSearchRow): string | null {
  const href = row.href?.trim();
  if (!href || SEARCH_LOOP_RE.test(href)) return null;
  if (VEHICLE_DETAIL_RE.test(href)) {
    const slug = slugFromSearchVehicleRow(row);
    return slug ? `/vehicle/${slug}` : href.split("?")[0] || null;
  }
  if (href.startsWith("/")) return href;
  return null;
}

export function resolveSearchVehicleCardSpecHref(row: VehicleSearchRow): string | null {
  const detail = resolveSearchVehicleCardDetailHref(row);
  if (!detail) return row.fuelHref?.trim() || null;
  const base = detail.split("#")[0]!;
  if (row.fuelHref?.startsWith("/vehicle/")) return row.fuelHref;
  return `${base}#fuel-batteries`;
}

export function isSearchLoopVehicleHref(href: string | undefined | null): boolean {
  return Boolean(href?.trim() && SEARCH_LOOP_RE.test(href.trim()));
}
