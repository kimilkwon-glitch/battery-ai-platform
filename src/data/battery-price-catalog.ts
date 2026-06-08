/**
 * Battery Manager 운영 가격 — 인터넷가(택배발송)와 출장가 분리.
 * CSV·파란색 가격표 확정값만 사용. 할인/정가/쿠폰 미포함.
 */

import type { BatteryBrandKey } from "@/lib/battery-alias-map";

export type BatteryPriceBrand = Extract<BatteryBrandKey, "rocket" | "solite">;

export type OnsitePriceGroup =
  | "40L"
  | "50L"
  | "60LR"
  | "80L"
  | "80R"
  | "90L"
  | "90R"
  | "100L"
  | "100R"
  | "DIN50L"
  | "DIN60L"
  | "DIN74L"
  | "DIN90L"
  | "DIN100L"
  | "DIN110L"
  | "AGM60L"
  | "AGM70L"
  | "AGM80L"
  | "AGM80R"
  | "AGM95L"
  | "AGM95R"
  | "AGM105L";

/** 브랜드+규격 키 — 인터넷가(택배발송가) */
export const INTERNET_PRICES_WON: Record<string, number> = {
  "rocket:GB120L": 155_000,
  "rocket:AGM95R": 157_000,
  "rocket:AGM80R": 119_300,
  "solite:AGM105L": 204_000,
  "rocket:GB150L": 165_000,
  "rocket:GB170L": 175_000,
  "rocket:GB250L": 240_000,
  "solite:AGM80L": 112_300,
  "solite:AGM95L": 142_000,
  "solite:DIN90L": 78_000,
  "solite:CMF50L": 53_000,
  "solite:AGM60L": 89_000,
  "solite:AGM70L": 102_000,
  "rocket:GB60AL": 65_500,
  "rocket:GB100R": 81_000,
  "rocket:DIN90L": 87_000,
  "solite:DIN62L": 58_500,
  "rocket:DIN62L": 64_500,
  "rocket:GB50L": 51_000,
  "rocket:DIN50L": 50_500,
  "solite:CMF60L": 62_500,
  "rocket:AGM60L": 93_000,
  "solite:CMF100L": 80_000,
  "rocket:GB100L": 81_000,
  "solite:DIN74L": 66_000,
  "rocket:DIN74R": 70_000,
  "rocket:DIN74L": 60_000,
  "solite:CMF90L": 67_000,
  "rocket:GB90L": 71_000,
  "rocket:AGM105L": 206_000,
  "rocket:AGM95L": 157_000,
  "rocket:AGM80L": 119_300,
  "rocket:AGM70L": 106_000,
  "rocket:GB80L": 67_500,
  "solite:CMF80L": 62_000,
  "solite:CMF90R": 67_000,
  "rocket:GB90R": 71_000,
  "solite:DIN44L": 48_000,
  "solite:DIN100L": 87_000,
  "rocket:DIN100L": 98_000,
  /** 예외 — CSV 누락 */
  "solite:CMF40L": 44_500,
  "solite:40L": 44_500,
  /** 예외 — 100L 동일가 */
  "solite:CMF100R": 80_000,
};

/** 파란색 가격표 — 출장가/출장교체가 */
export const ONSITE_PRICES_WON: Record<OnsitePriceGroup, Record<BatteryPriceBrand, number>> = {
  "40L": { rocket: 65_000, solite: 60_000 },
  "50L": { rocket: 75_000, solite: 70_000 },
  "60LR": { rocket: 85_000, solite: 80_000 },
  "80L": { rocket: 90_000, solite: 85_000 },
  "80R": { rocket: 90_000, solite: 85_000 },
  "90L": { rocket: 100_000, solite: 95_000 },
  "90R": { rocket: 100_000, solite: 95_000 },
  "100L": { rocket: 110_000, solite: 105_000 },
  "100R": { rocket: 110_000, solite: 105_000 },
  DIN50L: { rocket: 75_000, solite: 70_000 },
  DIN60L: { rocket: 90_000, solite: 85_000 },
  DIN74L: { rocket: 95_000, solite: 90_000 },
  DIN90L: { rocket: 110_000, solite: 105_000 },
  DIN100L: { rocket: 115_000, solite: 110_000 },
  DIN110L: { rocket: 140_000, solite: 130_000 },
  AGM60L: { rocket: 120_000, solite: 115_000 },
  AGM70L: { rocket: 135_000, solite: 130_000 },
  AGM80L: { rocket: 150_000, solite: 145_000 },
  AGM80R: { rocket: 150_000, solite: 145_000 },
  AGM95L: { rocket: 180_000, solite: 175_000 },
  AGM95R: { rocket: 180_000, solite: 175_000 },
  AGM105L: { rocket: 225_000, solite: 220_000 },
};

/**
 * 폴더/별칭 → 인터넷가 조회용 규격 (상품명·브랜드 우선 — CSV 모델명 오류 보정)
 */
export const INTERNET_PRICING_SPEC_ALIASES: Record<string, Partial<Record<BatteryPriceBrand, string>>> = {
  GB57820: { rocket: "DIN74L" },
  GB57219: { rocket: "DIN74R" },
  GB56219: { rocket: "DIN62L" },
  GB55066: { rocket: "DIN50L" },
  GB59042: { rocket: "DIN90L" },
  GB60044: { rocket: "DIN100L" },
  GB58014: { rocket: "GB80L" },
  CMF57412: { solite: "DIN74L" },
  CMF56219: { solite: "DIN62L" },
  CMF54459: { solite: "DIN44L" },
  "100R": { rocket: "GB100R", solite: "CMF100R" },
  "90R": { rocket: "GB90R", solite: "CMF90R" },
  "80L": { rocket: "GB80L", solite: "CMF80L" },
  "80R": { rocket: "GB80R", solite: "CMF80R" },
  "90L": { rocket: "GB90L", solite: "CMF90L" },
  "100L": { rocket: "GB100L", solite: "CMF100L" },
  "40L": { solite: "CMF40L" },
  CMF80L: { solite: "CMF80L" },
  GB90R: { rocket: "GB90R" },
  GB80L: { rocket: "GB80L" },
  AGM80L: { rocket: "AGM80L" },
  AGM80R: { rocket: "AGM80R" },
};

/** 상품명 기준 충돌 보정 (CSV 브랜드/모델명 무시) */
export const INTERNET_PRICE_PRODUCT_OVERRIDES: { brand: BatteryPriceBrand; match: RegExp; spec: string }[] = [
  { brand: "solite", match: /CMF50L|다마스|라보/i, spec: "CMF50L" },
  { brand: "rocket", match: /GB100R|뉴쏘렌토/i, spec: "GB100R" },
];

export const INTERNET_PRICE_CATALOG_COUNT = Object.keys(INTERNET_PRICES_WON).length;
export const ONSITE_PRICE_GROUP_COUNT = Object.keys(ONSITE_PRICES_WON).length;
