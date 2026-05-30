/**
 * 이미지 슬롯 레지스트리 — 고객 안내용 placeholder 메타 단일 소스
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
  /** 연결 시 public 기준 경로 (예: /media/slots/...) */
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
    statusLabel: "실물 기준 확인",
    caption: `${code} 실물 제품 안내`,
    hint: "배터리 상세·검색 결과 카드 대표 이미지",
    ratio: "4/3",
    purpose: "battery-detail-search-card",
    srcPath: `/media/slots/search/battery/${code}-main.jpg`,
  }),
  vehicleCard: (model: string): ImageSlotDefinition => ({
    assetKey: `search.vehicle.card.${model.replace(/\s+/g, "-")}`,
    statusLabel: "실물 기준 확인",
    caption: "차량 대표 안내",
    hint: model ? `${model} 세대 대표 컷` : "차량 상세 진입 카드",
    ratio: "16/9",
    purpose: "vehicle-search-card",
    srcPath: null,
  }),
  symptomDiagnosis: (): ImageSlotDefinition => ({
    assetKey: "search.symptom.diagnosis",
    statusLabel: "사진으로 확인하기",
    caption: "블랙박스 상시전원 / 방전 점검 안내",
    hint: "증상 진단 카드 보조 — 상시전원·퓨즈·주차 패턴",
    ratio: "16/9",
    purpose: "symptom-search-hero",
    srcPath: "/media/slots/search/symptom/discharge-check.jpg",
  }),
  symptomCause: (causeId: string, title: string): ImageSlotDefinition => ({
    assetKey: `search.symptom.cause.${causeId}`,
    statusLabel: "사진으로 확인하기",
    caption: `${title} 참고 안내`,
    hint: "증상 원인 카드 보조 이미지",
    ratio: "16/9",
    purpose: "symptom-cause-card",
    srcPath: `/media/slots/search/symptom/${causeId}.jpg`,
  }),
  serviceOutbound: (): ImageSlotDefinition => ({
    assetKey: "search.service.outbound",
    statusLabel: "사진으로 확인하기",
    caption: "출장 교체 현장 안내",
    hint: "문의·출장 CTA 신뢰도 — 현장 작업·차량 앞 교체",
    ratio: "16/9",
    purpose: "store-outbound-cta",
    srcPath: "/media/slots/search/service/outbound-field.jpg",
  }),
  serviceStore: (storeId: string): ImageSlotDefinition => ({
    assetKey: `search.service.store.${storeId}`,
    statusLabel: "사진으로 확인하기",
    caption: "매장 전경·작업대 안내",
    hint: "지점 안내 카드 — 덕천·학장 등 매장 실사",
    ratio: "16/9",
    purpose: "store-location-cta",
    srcPath: `/media/slots/search/service/store-${storeId}.jpg`,
  }),
  batteryInstallExample: (code: string): ImageSlotDefinition => ({
    assetKey: `search.battery.install.${code}`,
    statusLabel: "사진으로 확인하기",
    caption: "장착 위치 확인",
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
    statusLabel: "실물 기준 확인",
    caption: `${code} 실물 제품 안내`,
    hint: "상품 상세 Hero — 제품 단독 컷 (로케트·쏠라이트 등 브랜드별)",
    ratio: "4/3",
    purpose: "battery-detail-hero-product",
    srcPath: `/media/slots/battery-detail/${code.replace(/\s+/g, "-")}-product.jpg`,
  }),
  install: (code: string): ImageSlotDefinition => ({
    assetKey: `battery.detail.install.${code.replace(/\s+/g, "-")}`,
    statusLabel: "사진으로 확인하기",
    caption: "장착 위치 확인",
    hint: `${code} — 엔진룸/트레이 장착 위치·홀 패턴 참고`,
    ratio: "16/9",
    purpose: "battery-detail-install",
    srcPath: `/media/slots/battery-detail/${code.replace(/\s+/g, "-")}-install.jpg`,
  }),
  labelTerminal: (code: string): ImageSlotDefinition => ({
    assetKey: `battery.detail.label.${code.replace(/\s+/g, "-")}`,
    statusLabel: "사진으로 확인하기",
    caption: "배터리 라벨·단자 확인 안내",
    hint: "규격 코드·L/R 단자·제조일 — 오주문 방지용",
    ratio: "4/3",
    purpose: "battery-detail-label-terminal",
    srcPath: `/media/slots/battery-detail/${code.replace(/\s+/g, "-")}-label.jpg`,
  }),
} as const;

/** Q&A·가이드 허브 */
export const QNA_IMAGE_SLOTS = {
  blackboxCheck: (): ImageSlotDefinition => ({
    assetKey: "qna.symptom.blackbox",
    statusLabel: "사진으로 확인하기",
    caption: "블랙박스 방전 점검 안내",
    hint: "상시전원·퓨즈·주차 패턴 참고",
    ratio: "16/9",
    purpose: "qna-blackbox-discharge",
    srcPath: "/media/slots/qna/blackbox-discharge-check.jpg",
  }),
  labelCheck: (): ImageSlotDefinition => ({
    assetKey: "qna.guide.label",
    statusLabel: "사진으로 확인하기",
    caption: "배터리 라벨 확인 안내",
    hint: "규격 코드·제조일·L/R 단자",
    ratio: "4/3",
    purpose: "qna-label-check",
    srcPath: "/media/slots/qna/battery-label-check.jpg",
  }),
  terminalDirection: (): ImageSlotDefinition => ({
    assetKey: "qna.guide.terminal",
    statusLabel: "사진으로 확인하기",
    caption: "단자 방향 확인 안내",
    hint: "플러스 단자 L/R·극성",
    ratio: "4/3",
    purpose: "qna-terminal-direction",
    srcPath: "/media/slots/qna/terminal-direction.jpg",
  }),
  hybridAuxLocation: (): ImageSlotDefinition => ({
    assetKey: "qna.ev.hybrid-aux",
    statusLabel: "사진으로 확인하기",
    caption: "하이브리드 보조배터리 위치 안내",
    hint: "엔진룸·트렁크 보조 12V 위치",
    ratio: "16/9",
    purpose: "qna-hybrid-aux-location",
    srcPath: "/media/slots/qna/hybrid-aux-location.jpg",
  }),
  porterInstall: (): ImageSlotDefinition => ({
    assetKey: "qna.commercial.porter",
    statusLabel: "사진으로 확인하기",
    caption: "포터2 장착 위치 확인",
    hint: "90R·100R 트레이·연식 확인",
    ratio: "16/9",
    purpose: "qna-porter-install",
    srcPath: "/media/slots/qna/porter2-battery-install.jpg",
  }),
} as const;

/** 메인 홈 고급화 V2 */
export const HOME_IMAGE_SLOTS = {
  heroMatching: (): ImageSlotDefinition => ({
    assetKey: "home.hero.matching",
    statusLabel: "실물 기준 확인",
    caption: "배터리·차량 매칭 안내",
    hint: "차량 실사 + 배터리 규격 라벨이 함께 보이는 플랫폼 히어로",
    ratio: "16/9",
    purpose: "home-hero-visual",
    srcPath: "/media/slots/home/hero-matching.jpg",
  }),
  batteryRank: (code: string): ImageSlotDefinition => ({
    assetKey: `home.battery.rank.${code.replace(/\s+/g, "-")}`,
    statusLabel: "실물 기준 확인",
    caption: `${code} 제품 안내`,
    hint: "많이 찾는 규격 카드 대표 컷",
    ratio: "4/3",
    purpose: "home-battery-rank",
    srcPath: `/media/slots/home/battery/${code.replace(/\s+/g, "-")}-product.jpg`,
  }),
  vehicleQuick: (slug: string, title: string): ImageSlotDefinition => ({
    assetKey: `home.vehicle.quick.${slug}`,
    statusLabel: "실물 기준 확인",
    caption: `${title} 대표 안내`,
    hint: "인기 차량 빠른 검색 카드",
    ratio: "16/9",
    purpose: "home-vehicle-quick",
    srcPath: `/media/slots/home/vehicle/${slug}.jpg`,
  }),
  storeDeokcheon: (): ImageSlotDefinition => ({
    assetKey: "home.store.deokcheon",
    statusLabel: "사진으로 확인하기",
    caption: "덕천점 매장 안내",
    hint: "매장 전경·작업대",
    ratio: "16/9",
    purpose: "home-store-deokcheon",
    srcPath: "/media/slots/home/store/deokcheon.jpg",
  }),
  storeHakjang: (): ImageSlotDefinition => ({
    assetKey: "home.store.hakjang",
    statusLabel: "사진으로 확인하기",
    caption: "학장점 매장 안내",
    hint: "매장 전경·작업대",
    ratio: "16/9",
    purpose: "home-store-hakjang",
    srcPath: "/media/slots/home/store/hakjang.jpg",
  }),
  outboundField: (): ImageSlotDefinition => ({
    assetKey: "home.service.outbound",
    statusLabel: "사진으로 확인하기",
    caption: "출장 교체 현장 안내",
    hint: "현장 작업·차량 앞 교체",
    ratio: "16/9",
    purpose: "home-outbound-field",
    srcPath: "/media/slots/home/service/outbound-field.jpg",
  }),
  inspectionGear: (): ImageSlotDefinition => ({
    assetKey: "home.service.inspection",
    statusLabel: "사진으로 확인하기",
    caption: "배터리 점검 장비 안내",
    hint: "테스터·단자 확인 장비",
    ratio: "4/3",
    purpose: "home-inspection-gear",
    srcPath: "/media/slots/home/service/inspection-gear.jpg",
  }),
  deliveryPack: (): ImageSlotDefinition => ({
    assetKey: "home.delivery.pack",
    statusLabel: "사진으로 확인하기",
    caption: "택배 포장 안내",
    hint: "출고 포장·박스",
    ratio: "4/3",
    purpose: "home-delivery-pack",
    srcPath: "/media/slots/home/delivery/pack.jpg",
  }),
  deliveryCheck: (): ImageSlotDefinition => ({
    assetKey: "home.delivery.check",
    statusLabel: "사진으로 확인하기",
    caption: "출고 전 제품 확인 안내",
    hint: "라벨·외관 최종 점검",
    ratio: "4/3",
    purpose: "home-delivery-check",
    srcPath: "/media/slots/home/delivery/pre-ship-check.jpg",
  }),
  deliveryLabel: (): ImageSlotDefinition => ({
    assetKey: "home.delivery.label",
    statusLabel: "사진으로 확인하기",
    caption: "배터리 라벨 확인 안내",
    hint: "오주문 방지 — 규격 코드 확인",
    ratio: "4/3",
    purpose: "home-delivery-label",
    srcPath: "/media/slots/home/delivery/label-check.jpg",
  }),
  symptomBlackbox: (): ImageSlotDefinition => ({
    assetKey: "home.symptom.blackbox",
    statusLabel: "사진으로 확인하기",
    caption: "블랙박스 방전 점검 안내",
    hint: "상시전원·퓨즈·주차 패턴",
    ratio: "16/9",
    purpose: "home-symptom-blackbox",
    srcPath: "/media/slots/home/symptom/blackbox-discharge.jpg",
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
    "AGM95L",
    "EV 12V",
  ];
  const detailSlots = coreCodes.flatMap((code) => [
    BATTERY_DETAIL_IMAGE_SLOTS.product(code),
    BATTERY_DETAIL_IMAGE_SLOTS.install(code),
    BATTERY_DETAIL_IMAGE_SLOTS.labelTerminal(code),
  ]);
  const homeSlots = [
    HOME_IMAGE_SLOTS.heroMatching(),
    HOME_IMAGE_SLOTS.storeDeokcheon(),
    HOME_IMAGE_SLOTS.storeHakjang(),
    HOME_IMAGE_SLOTS.outboundField(),
    HOME_IMAGE_SLOTS.inspectionGear(),
    HOME_IMAGE_SLOTS.deliveryPack(),
    HOME_IMAGE_SLOTS.deliveryCheck(),
    HOME_IMAGE_SLOTS.deliveryLabel(),
    HOME_IMAGE_SLOTS.symptomBlackbox(),
    ...coreCodes.flatMap((code) => [HOME_IMAGE_SLOTS.batteryRank(code)]),
  ];
  return [
    ...homeSlots,
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
    QNA_IMAGE_SLOTS.blackboxCheck(),
    QNA_IMAGE_SLOTS.labelCheck(),
    QNA_IMAGE_SLOTS.terminalDirection(),
    QNA_IMAGE_SLOTS.hybridAuxLocation(),
    QNA_IMAGE_SLOTS.porterInstall(),
  ];
}
