/**
 * 이미지 슬롯 레지스트리 — 실제 사진 연결 전까지 placeholder 메타 단일 소스
 * 연결: public 경로 또는 imageManifest targetId와 assetKey 매칭
 */

export type ImageSlotRatio = "16/9" | "4/3" | "1/1";

export type ImageSlotDefinition = {
  assetKey: string;
  statusLabel: string;
  caption: string;
  hint: string;
  ratio: ImageSlotRatio;
  purpose: string;
  /** 준비되면 public 기준 경로 (예: /media/slots/...) */
  srcPath: string | null;
};

const RATIO_CLASS: Record<ImageSlotRatio, string> = {
  "16/9": "aspect-video",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
};

export function imageSlotRatioClass(ratio: ImageSlotRatio): string {
  return RATIO_CLASS[ratio];
}

/** 검색·상세 UX용 고정 슬롯 */
export const SEARCH_IMAGE_SLOTS = {
  batteryProduct: (code: string): ImageSlotDefinition => ({
    assetKey: `search.battery.product.${code}`,
    statusLabel: "이미지 준비중",
    caption: `${code} 실물 제품 사진 준비중`,
    hint: "배터리 상세·검색 결과 카드 대표 이미지",
    ratio: "4/3",
    purpose: "battery-detail-search-card",
    srcPath: `/media/slots/search/battery/${code}-main.jpg`,
  }),
  vehicleCard: (model: string): ImageSlotDefinition => ({
    assetKey: `search.vehicle.card.${model.replace(/\s+/g, "-")}`,
    statusLabel: "이미지 준비중",
    caption: "차량 대표 이미지 준비중",
    hint: model ? `${model} 세대 대표 컷` : "차량 상세 진입 카드",
    ratio: "16/9",
    purpose: "vehicle-search-card",
    srcPath: null,
  }),
  symptomDiagnosis: (): ImageSlotDefinition => ({
    assetKey: "search.symptom.diagnosis",
    statusLabel: "사진 준비중",
    caption: "블랙박스 상시전원 / 방전 점검 사진 준비중",
    hint: "증상 진단 카드 보조 — 상시전원·퓨즈·주차 패턴",
    ratio: "16/9",
    purpose: "symptom-search-hero",
    srcPath: "/media/slots/search/symptom/discharge-check.jpg",
  }),
  symptomCause: (causeId: string, title: string): ImageSlotDefinition => ({
    assetKey: `search.symptom.cause.${causeId}`,
    statusLabel: "사진 준비중",
    caption: `${title} 참고 사진 준비중`,
    hint: "증상 원인 카드 보조 이미지",
    ratio: "16/9",
    purpose: "symptom-cause-card",
    srcPath: `/media/slots/search/symptom/${causeId}.jpg`,
  }),
  serviceOutbound: (): ImageSlotDefinition => ({
    assetKey: "search.service.outbound",
    statusLabel: "사진 준비중",
    caption: "출장 교체 현장 사진 준비중",
    hint: "문의·출장 CTA 신뢰도 — 현장 작업·차량 앞 교체",
    ratio: "16/9",
    purpose: "store-outbound-cta",
    srcPath: "/media/slots/search/service/outbound-field.jpg",
  }),
  serviceStore: (storeId: string): ImageSlotDefinition => ({
    assetKey: `search.service.store.${storeId}`,
    statusLabel: "사진 준비중",
    caption: "매장 전경·작업대 사진 준비중",
    hint: "지점 안내 카드 — 덕천·학장 등 매장 실사",
    ratio: "16/9",
    purpose: "store-location-cta",
    srcPath: `/media/slots/search/service/store-${storeId}.jpg`,
  }),
  batteryInstallExample: (code: string): ImageSlotDefinition => ({
    assetKey: `search.battery.install.${code}`,
    statusLabel: "사진 준비중",
    caption: "배터리 장착 예시 사진 준비중",
    hint: "고객이 자신 차량 배터리 위치·단자 방향을 이해하도록 돕는 컷",
    ratio: "4/3",
    purpose: "battery-install-guide",
    srcPath: `/media/slots/search/battery/${code}-install.jpg`,
  }),
} as const;

/** 배터리 상세·규격 허브 — 제품/장착/라벨 슬롯 */
export const BATTERY_DETAIL_IMAGE_SLOTS = {
  product: (code: string): ImageSlotDefinition => ({
    assetKey: `battery.detail.product.${code.replace(/\s+/g, "-")}`,
    statusLabel: "이미지 준비중",
    caption: `${code} 실물 제품 사진 준비중`,
    hint: "상품 상세 Hero — 제품 단독 컷 (로케트·쏠라이트 등 브랜드별)",
    ratio: "4/3",
    purpose: "battery-detail-hero-product",
    srcPath: `/media/slots/battery-detail/${code.replace(/\s+/g, "-")}-product.jpg`,
  }),
  install: (code: string): ImageSlotDefinition => ({
    assetKey: `battery.detail.install.${code.replace(/\s+/g, "-")}`,
    statusLabel: "사진 준비중",
    caption: "차량 장착 예시 사진 준비중",
    hint: `${code} — 엔진룸/트레이 장착 위치·홀 패턴 참고`,
    ratio: "16/9",
    purpose: "battery-detail-install",
    srcPath: `/media/slots/battery-detail/${code.replace(/\s+/g, "-")}-install.jpg`,
  }),
  labelTerminal: (code: string): ImageSlotDefinition => ({
    assetKey: `battery.detail.label.${code.replace(/\s+/g, "-")}`,
    statusLabel: "사진 준비중",
    caption: "배터리 라벨·단자 확인 사진 준비중",
    hint: "규격 코드·L/R 단자·제조일 — 오주문 방지용",
    ratio: "4/3",
    purpose: "battery-detail-label-terminal",
    srcPath: `/media/slots/battery-detail/${code.replace(/\s+/g, "-")}-label.jpg`,
  }),
} as const;

/** 레지스트리 전체 목록 (보고·문서용) */
export function listRegisteredImageSlots(): ImageSlotDefinition[] {
  const coreCodes = [
    "AGM60L",
    "AGM70L",
    "AGM80L",
    "DIN74L",
    "100R",
    "CMF80L",
    "115D31L",
    "AGM95L",
    "EV 12V",
  ];
  const detailSlots = coreCodes.flatMap((code) => [
    BATTERY_DETAIL_IMAGE_SLOTS.product(code),
    BATTERY_DETAIL_IMAGE_SLOTS.install(code),
    BATTERY_DETAIL_IMAGE_SLOTS.labelTerminal(code),
  ]);
  return [
    ...detailSlots,
    SEARCH_IMAGE_SLOTS.symptomDiagnosis(),
    SEARCH_IMAGE_SLOTS.serviceOutbound(),
    SEARCH_IMAGE_SLOTS.serviceStore("deokcheon"),
    SEARCH_IMAGE_SLOTS.serviceStore("hakjang"),
    SEARCH_IMAGE_SLOTS.batteryProduct("AGM60L"),
    SEARCH_IMAGE_SLOTS.vehicleCard("차량"),
    SEARCH_IMAGE_SLOTS.batteryInstallExample("AGM60L"),
    SEARCH_IMAGE_SLOTS.symptomCause("blackbox", "블랙박스 상시전원"),
    SEARCH_IMAGE_SLOTS.symptomCause("parasitic", "암전류"),
    SEARCH_IMAGE_SLOTS.symptomCause("parking", "장기주차"),
    SEARCH_IMAGE_SLOTS.symptomCause("aging", "배터리 노후"),
  ];
}
