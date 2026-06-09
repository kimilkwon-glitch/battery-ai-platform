import { productBatteryCode } from "@/lib/batteryNormalize";
import { getBatteryFitmentVehicleLabels } from "@/lib/vehicleBattery";

export type BatteryCardBrandId = "rocket" | "solite";

/**
 * 배터리 카드 "대표 적용" 표시용 — DB 매칭·주문 로직과 분리.
 * 상품명/광고명 확정 대표 차종만 짧게 노출 (2~3개).
 */
const BY_BRAND_AND_CODE: Record<string, string> = {
  "rocket:GB80L": "K5 1세대 · YF쏘나타",
  "rocket:GB80R": "렉스턴G4 · 마이티",
  "rocket:GB90R": "포터2 · 투싼ix",
  "rocket:GB100R": "렉스턴G4 · 마이티",
  "rocket:100R": "렉스턴G4 · 마이티",
  "rocket:90R": "포터2 · 투싼ix",
  "rocket:DIN50L": "캐스퍼 · 모닝 어반",
  "rocket:GB55066": "캐스퍼 · 모닝 어반",
  "solite:CMF80L": "i40 · QM5 · SM5 뉴임프",
  "solite:CMF90R": "스포티지R 디젤 · 렉스턴스포츠",
  "solite:DIN44L": "스파크 · 마티즈 크리에이티브",
  "solite:CMF54459": "스파크 · 마티즈 크리에이티브",
};

/** 브랜드 무관 — AGM 등 공통 규격 */
const BY_CODE: Record<string, string> = {
  AGM95L: "싼타페TM · 팰리세이드 · 올뉴쏘렌토",
  AGM105L: "K9 · G80 · G90",
  AGM80L: "그랜저 IG · K5 · 쏘렌토",
  AGM80R: "스타리아 · GV70 · 싼타페",
  AGM60L: "아반떼 · K3 · 코나",
  AGM70L: "쏘렌토 · 스포티지 · 투싼",
  AGM95R: "GV80 · G80",
  DIN74L: "QM6 · SM6 · 말리부",
  CMF57412: "말리부 · SM5",
  CMF40L: "레이 · 모닝",
  CMF100R: "봉고3 · 카니발",
};

const CODE_ALIASES: Record<string, string> = {
  GB55066: "DIN50L",
  CMF54459: "DIN44L",
  GB57820: "DIN74L",
};

function normalizeCardCode(code: string): string {
  const raw = productBatteryCode(code).trim().toUpperCase();
  return CODE_ALIASES[raw] ?? raw;
}

export function getBatteryCardRepresentativeDisplay(
  code: string,
  brand?: BatteryCardBrandId | null,
): string | null {
  const normalized = normalizeCardCode(code);
  if (brand) {
    const brandHit = BY_BRAND_AND_CODE[`${brand}:${normalized}`];
    if (brandHit) return brandHit;
    const folderHit = BY_BRAND_AND_CODE[`${brand}:${code.trim().toUpperCase()}`];
    if (folderHit) return folderHit;
  }
  return BY_CODE[normalized] ?? BY_CODE[code.trim().toUpperCase()] ?? null;
}

/** mapping 없을 때 — DB 라벨을 2~3개로 제한 (말줄임·내부명 최소화) */
function sanitizeFitmentLabel(label: string): string | null {
  const t = label.trim();
  if (!t || t.includes("…") || t.includes("...")) return null;
  if (/럭셔리|세대\)|세대\s|그랜저\s*5/i.test(t)) return null;
  if (t.length > 22) return null;
  return t;
}

export function resolveBatteryCardRepresentativeVehicles(
  code: string,
  brand?: BatteryCardBrandId | null,
  fallback?: string,
): string {
  const mapped = getBatteryCardRepresentativeDisplay(code, brand);
  if (mapped) return mapped;

  if (fallback?.trim()) {
    return fallback;
  }

  const fitment = getBatteryFitmentVehicleLabels(code, 4)
    .map(sanitizeFitmentLabel)
    .filter((v): v is string => Boolean(v))
    .slice(0, 3);

  if (fitment.length >= 2) {
    return fitment.join(" · ");
  }

  return fitment[0] ?? "국산 승용 · SUV";
}
