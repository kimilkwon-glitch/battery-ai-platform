/**
 * 고객 화면용 연료·조건 라벨 — DB raw fuel/alias는 그대로 두고 표시만 정규화
 * (검색 매칭·pickPrimary 로직과 분리)
 */

const ENGINE_AS_GASOLINE = /터보|turbo|gdi|mpi|t-gdi|tgi|가솔|gasoline|휘발/i;
const ENGINE_AS_DIESEL = /디젤|diesel|tdi|crdi|crdi|경유/i;

export function mapCustomerFuelLabel(raw: string | null | undefined): string {
  if (!raw?.trim()) return "공통";
  const f = raw.trim();

  if (/isg|스마트충전|idle.?stop|마이드/i.test(f)) return "ISG/스마트충전";
  if (/ev\s*12|12v|보조.?배터리|보조배터리/i.test(f) && /ev|전기|하이브/i.test(f)) return "EV 보조 12V";
  if (/하이브|hev|phev|mild/i.test(f)) return "하이브리드";
  if (/lpg|엘피지/i.test(f)) return "LPG";
  if (ENGINE_AS_DIESEL.test(f)) return "디젤";
  if (/^전기$|^ev$/i.test(f) || (/전기/i.test(f) && !/12|보조/i.test(f))) return "전기";
  if (ENGINE_AS_GASOLINE.test(f)) return "가솔린";
  if (/가솔|gasoline|휘발/i.test(f)) return "가솔린";
  if (/확인|미확|불명/i.test(f)) return "확인 필요";

  if (/^터보$|^gdi$|^mpi$|^tdi$|^crdi$/i.test(f)) {
    if (/tdi|crdi/i.test(f)) return "디젤";
    return "가솔린";
  }

  return "확인 필요";
}

export const CUSTOMER_FUEL_DISPLAY_ORDER = [
  "가솔린",
  "디젤",
  "LPG",
  "하이브리드",
  "ISG/스마트충전",
  "EV 보조 12V",
  "전기",
  "확인 필요",
  "공통",
] as const;

export function sortFuelGroupsByDisplayOrder<T extends { fuelLabel: string }>(groups: T[]): T[] {
  const order = CUSTOMER_FUEL_DISPLAY_ORDER;
  return [...groups].sort((a, b) => {
    const ia = order.indexOf(a.fuelLabel as (typeof order)[number]);
    const ib = order.indexOf(b.fuelLabel as (typeof order)[number]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

export const VEHICLE_HERO_CARD_LIMIT = 3;
