import { isBatteryMatched, normalizeBatteryCode } from "@/lib/batteryNormalize";
import { getVehicleCardBatteryInfo } from "@/lib/vehicleBattery";

/** JIS D31 계열 (115D31L/R 등) — 검색어 인식과 차량 적합 판정을 분리 */
export function isJisD31Spec(spec: string): boolean {
  const n = normalizeBatteryCode(spec);
  return /^\d{2,3}D31[LR]$/i.test(n);
}

export function vehicleSpecFitConfirmed(slug: string | null | undefined, spec: string): boolean {
  if (!slug || !spec) return false;
  const db = getVehicleCardBatteryInfo(slug);
  if (!db.hasConfirmedDb) return false;
  const n = normalizeBatteryCode(spec);
  return (
    normalizeBatteryCode(db.displayCode) === n ||
    db.batteryOptions.some((o) => isBatteryMatched(n, o) || normalizeBatteryCode(o) === n)
  );
}

export function buildSpecFitMessage(
  spec: string,
  vehicleName?: string,
  slug?: string | null,
): string | null {
  const n = normalizeBatteryCode(spec);
  if (!n) return null;

  const confirmed = slug ? vehicleSpecFitConfirmed(slug, n) : false;

  if (isJisD31Spec(n)) {
    if (vehicleName && !confirmed) {
      return `검색하신 ${n} 규격은 확인되었습니다. 다만 입력하신 차량에 실제 장착 가능한지는 연식·연료·현재 배터리 사진 확인이 필요합니다.`;
    }
    if (!vehicleName) {
      return `${n} 규격은 확인되었습니다. 차량 연식·연료와 단자 방향(L/R)을 함께 확인해 주세요.`;
    }
  }

  if (vehicleName && !confirmed) {
    return `해당 차량과 검색 규격(${n})의 적합 여부를 바로 확정하기 어렵습니다. 현재 장착된 배터리 사진이나 차량 연식·연료 정보를 함께 확인해 주세요.`;
  }

  return null;
}
