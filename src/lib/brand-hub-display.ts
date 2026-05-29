import type { BatteryBrandKey } from "@/lib/battery-alias-map";

/** 브랜드 허브 — 메인/참고 브랜드·대표 규격·짧은 설명 */

export const BRAND_HUB_MAIN_IDS = ["rocket", "solite"] as const;
export const BRAND_HUB_REFERENCE_IDS = ["delco", "varta", "atk", "infinit"] as const;

export type BrandHubMainId = (typeof BRAND_HUB_MAIN_IDS)[number];

export const brandHubShortCopy: Record<
  string,
  { title: string; body: string; notation: string }
> = {
  rocket: {
    title: "로케트 배터리",
    body: "GB 표기를 주로 사용하는 국산 배터리 브랜드입니다. 쏠라이트와 같은 계열이라도 제품 코드가 다르게 표기될 수 있습니다.",
    notation: "GB80L · GB100R · GB57820 · AGM80L",
  },
  solite: {
    title: "쏠라이트 배터리",
    body: "CMF 표기를 주로 사용하는 국산 배터리 브랜드입니다. 로케트와 같은 계열이라도 제품 코드가 다르게 표기될 수 있습니다.",
    notation: "CMF80L · CMF100R · CMF57412 · CMF54459",
  },
  delco: {
    title: "델코 배터리",
    body: "수입차·프리미엄 세단에서 확인되는 AGM 브랜드입니다. 순정 규격·BMS 등록을 함께 확인하세요.",
    notation: "AGM92Ah 등",
  },
  varta: {
    title: "바르타 배터리",
    body: "유럽 수입차에서 확인되는 AGM/DIN 브랜드입니다. 순정 코드·등록 절차를 확인하세요.",
    notation: "AGM92Ah 등",
  },
  atk: {
    title: "한국AT 배터리",
    body: "일반 승용·DIN 계열 참고 브랜드입니다. ISG 차량은 AGM 유지가 권장됩니다.",
    notation: "DIN74L 등",
  },
  infinit: {
    title: "INFINIT 배터리",
    body: "EV 12V 보조배터리 참고 브랜드입니다. 일반 AGM과 혼동하지 마세요.",
    notation: "EV 12V",
  },
};

export const brandHubFeaturedByBrand: Record<string, { codes: string[]; imageBrandKey: BatteryBrandKey }> = {
  rocket: { codes: ["AGM80L", "GB80L", "GB100R", "GB57820"], imageBrandKey: "rocket" },
  solite: { codes: ["CMF80L", "CMF100R", "CMF57412", "CMF54459"], imageBrandKey: "solite" },
  delco: { codes: ["AGM92Ah"], imageBrandKey: "rocket" },
  varta: { codes: ["AGM92Ah"], imageBrandKey: "rocket" },
  atk: { codes: ["DIN74L"], imageBrandKey: "rocket" },
  infinit: { codes: ["EV 12V"], imageBrandKey: "rocket" },
};

export const brandHubCardBlurbs: Record<string, string> = {
  AGM80L: "SUV·대형 세단 ISG",
  GB80L: "일반 L타입 80Ah급",
  GB100R: "상용·R타입 100Ah급",
  GB57820: "DIN H6 / DIN74L 대응",
  CMF80L: "일반 CMF L타입",
  CMF100R: "상용·R타입 CMF",
  CMF57412: "DIN H6 CMF 표기",
  CMF54459: "소형 DIN CMF 표기",
  AGM92Ah: "수입차 AGM 참고",
  DIN74L: "DIN H6 참고",
  "EV 12V": "EV 보조 12V",
};
