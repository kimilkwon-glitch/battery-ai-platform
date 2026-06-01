import { normalizeSearchQuery } from "@/lib/search/normalize-query";
import type { VehicleBatteryRecord } from "@/lib/vehicleBattery";

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

/** K3, K5, GV70 등 짧은 차종 검색어 */
export function isCompactVehicleModelQuery(query: string): boolean {
  const q = norm(normalizeSearchQuery(query));
  return /^[a-z가-힣]{1,4}\d{0,2}[a-z]?$/i.test(q) && q.length >= 2 && q.length <= 5;
}

export function vehicleRecordMatchesCompactQuery(
  record: VehicleBatteryRecord,
  query: string,
): boolean {
  const q = norm(normalizeSearchQuery(query));
  if (!isCompactVehicleModelQuery(q)) return true;

  const model = norm(record.model);
  if (model === q) return true;

  const hay = norm(`${record.displayName} ${record.detail}`);
  const boundary = new RegExp(`(?:^|[^a-z0-9가-힣])${q}(?:[^a-z0-9가-힣]|$)`, "i");
  if (boundary.test(hay)) return true;

  /** K3 검색에 K9(3.3 등 숫자 부분매칭) 제외 */
  if (q === "k3" && /\bk9\b|더k9/.test(hay) && !/\bk3\b|올뉴k3|더뉴k3/.test(hay)) {
    return false;
  }

  return false;
}

/** 검색 차종과 무관한 타 차종 caution 문구 제거 */
export function sanitizeCautionForVehicleSearch(
  caution: string | null | undefined,
  query: string,
  vehicleModel?: string | null,
): string | null {
  if (!caution?.trim()) return null;
  const c = caution.trim();
  const q = norm(normalizeSearchQuery(query));

  if (isCompactVehicleModelQuery(q)) {
    if (/k9|더\s*k9/i.test(c) && q === "k3" && !/k3/i.test(c)) return null;
    if (vehicleModel && norm(vehicleModel) !== q && !c.toLowerCase().includes(q)) {
      return null;
    }
  }

  if (c.length > 72) return null;
  return c;
}
