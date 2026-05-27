import type { ServiceCenter } from "./platform-types";

export type EnrichedServiceCenter = ServiceCenter & {
  region: string;
  distanceKm: number;
  mobileService: boolean;
  bookingAvailable: boolean;
  expectedWorks: string[];
  detailVehicleLabels: string[];
  inquiryPrepare: string[];
};

const baseCenters: ServiceCenter[] = [
  {
    id: "sc1",
    name: "강남 배터리 진단센터",
    location: "서울 강남",
    distance: "1.2km",
    status: "영업중",
    batteries: ["AGM80L", "AGM95L", "DIN74L"],
    vehicleIds: ["grandeur-ig", "sorento-mq4"],
    capabilities: ["AGM 교체", "BMS 등록", "출장 가능", "내방 가능", "배터리 사진 확인"],
    review: "만족도 4.8",
  },
  {
    id: "sc2",
    name: "수원 EV 12V 센터",
    location: "경기 수원",
    distance: "3.4km",
    status: "예약가능",
    batteries: ["EV 12V", "EV 12V AGM", "AGM70L"],
    vehicleIds: ["ev6", "ioniq5"],
    capabilities: ["EV 12V", "블랙박스 방전 진단", "내방 가능"],
    review: "만족도 4.7",
  },
  {
    id: "sc3",
    name: "부산 AGM 전문점",
    location: "부산 해운대",
    distance: "5.1km",
    status: "영업중",
    batteries: ["AGM70L", "AGM80L", "AGM95L"],
    vehicleIds: ["k5-dl3", "seltos", "palisade"],
    capabilities: ["AGM 교체", "내방 가능", "대형차 가능", "배터리 사진 확인"],
    review: "만족도 4.6",
  },
  {
    id: "sc4",
    name: "대전 블랙박스 방전 클리닉",
    location: "대전 서구",
    distance: "2.8km",
    status: "마감임박",
    batteries: ["AGM80L", "AGM95L", "AGM105L"],
    vehicleIds: ["sorento-mq4", "palisade"],
    capabilities: ["블랙박스 방전 진단", "출장 가능", "배터리 사진 확인", "AGM 교체"],
    review: "만족도 4.5",
  },
  {
    id: "sc5",
    name: "대구 ISG·AGM 센터",
    location: "대구 수성",
    distance: "4.6km",
    status: "예약가능",
    batteries: ["AGM80L", "AGM95L", "AGM92Ah"],
    vehicleIds: ["grandeur-ig", "bmw-g30"],
    capabilities: ["AGM 교체", "BMS 등록", "내방 가능", "대형차 가능"],
    review: "만족도 4.6",
  },
  {
    id: "sc6",
    name: "광주 배터리·전장점",
    location: "광주 북구",
    distance: "6.2km",
    status: "영업중",
    batteries: ["AGM60L", "AGM70L", "AGM80L"],
    vehicleIds: ["seltos", "tucson-nx4"],
    capabilities: ["AGM 교체", "출장 가능", "배터리 사진 확인", "내방 가능"],
    review: "만족도 4.5",
  },
];

function parseDistanceKm(distance: string): number {
  const m = distance.match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : 99;
}

function parseRegion(location: string): string {
  if (location.startsWith("서울")) return "서울";
  if (location.startsWith("경기")) return "경기";
  if (location.startsWith("부산")) return "부산";
  if (location.startsWith("대구")) return "대구";
  if (location.startsWith("대전")) return "대전";
  if (location.startsWith("광주")) return "광주";
  return "기타";
}

const enrichMeta: Record<
  string,
  Omit<EnrichedServiceCenter, keyof ServiceCenter | "region" | "distanceKm">
> = {
  sc1: {
    mobileService: true,
    bookingAvailable: true,
    expectedWorks: ["AGM 교체", "BMS 등록", "사진 확인 후 교체"],
    detailVehicleLabels: ["그랜저 IG", "쏘렌토 MQ4", "G80 RG3"],
    inquiryPrepare: ["차량명·연식", "현재 배터리 사진", "BMS 등록 필요 여부"],
  },
  sc2: {
    mobileService: false,
    bookingAvailable: true,
    expectedWorks: ["EV 12V 점검", "보조배터리 교체", "대기전류 확인"],
    detailVehicleLabels: ["EV6", "아이오닉5"],
    inquiryPrepare: ["EV 모델명", "12V 증상 발생 시점", "주행·주차 패턴"],
  },
  sc3: {
    mobileService: false,
    bookingAvailable: false,
    expectedWorks: ["AGM 교체", "대형 SUV 배터리", "단자 방향 확인"],
    detailVehicleLabels: ["K5 DL3", "셀토스", "팰리세이드"],
    inquiryPrepare: ["차종·연식", "장착 배터리 규격", "단자 L/R"],
  },
  sc4: {
    mobileService: true,
    bookingAvailable: true,
    expectedWorks: ["블랙박스 방전 진단", "출장 점검", "AGM 교체"],
    detailVehicleLabels: ["쏘렌토 MQ4", "팰리세이드"],
    inquiryPrepare: ["블랙박스 상시전원 여부", "방전 횟수", "현재 전압"],
  },
  sc5: {
    mobileService: false,
    bookingAvailable: true,
    expectedWorks: ["AGM 교체", "BMS/IBS 등록", "수입차 배터리"],
    detailVehicleLabels: ["그랜저 IG", "BMW 520i"],
    inquiryPrepare: ["차량명·연식", "ISG/BMS 여부", "순정 배터리 코드"],
  },
  sc6: {
    mobileService: true,
    bookingAvailable: false,
    expectedWorks: ["AGM 교체", "출장 가능", "사진 규격 확인"],
    detailVehicleLabels: ["셀토스", "투싼 NX4"],
    inquiryPrepare: ["차량명", "증상(시동/방전)", "배터리 사진"],
  },
};

export function getEnrichedServiceCenters(): EnrichedServiceCenter[] {
  return baseCenters.map((sc) => {
    const meta = enrichMeta[sc.id];
    return {
      ...sc,
      region: parseRegion(sc.location),
      distanceKm: parseDistanceKm(sc.distance),
      ...meta,
    };
  });
}

export const serviceRegions = ["전체", "서울", "경기", "부산", "대구", "대전", "광주"] as const;

export const serviceWorkTypes = [
  "전체",
  "AGM 교체",
  "BMS 등록",
  "출장 가능",
  "대형차 가능",
  "EV 12V",
  "배터리 사진 확인",
  "블랙박스 방전",
] as const;

export const serviceRegionSummary = [
  { region: "서울/경기", count: 2, note: "AGM·BMS·EV 12V" },
  { region: "부산", count: 1, note: "AGM·대형차" },
  { region: "대전", count: 1, note: "출장·블랙박스" },
  { region: "대구/광주", count: 2, note: "AGM·전장" },
] as const;

export const serviceSidebarChecklist = {
  beforeSelect: ["차량명", "연식", "연료", "기존 배터리 규격", "출장 필요 여부"],
  popularWorks: ["AGM 교체", "BMS/IBS 등록", "EV 12V 배터리", "블랙박스 방전", "대형차 배터리"],
  inquiryPrepare: ["배터리 사진", "차량 번호 또는 차종", "증상", "장착 위치"],
} as const;

export const servicePreInquiryLinks = [
  { title: "배터리 규격 검색", description: "규격·호환 차종", href: "/search?q=AGM80L" },
  { title: "차량별 배터리 확인", description: "연식·연료별 안내", href: "/vehicles" },
  { title: "사진으로 규격 확인", description: "라벨·단자 확인", href: "/analysis/photo" },
  { title: "증상 진단", description: "방전·시동 지연", href: "/diagnosis" },
] as const;

export const serviceNextActions = [
  { title: "차량 검색", description: "차종·규격 확인", href: "/vehicles" },
  { title: "증상 진단", description: "방전·시동 지연", href: "/diagnosis" },
  { title: "가이드", description: "교체 전 확인", href: "/guide/spec?guide=agm-vs-din" },
  { title: "사진으로 규격 확인", description: "오주문 방지", href: "/analysis/photo" },
] as const;

export const BRAND_SERVICE_LABEL = "BATTERY MANAGER · 작업 가능점";

export function matchWorkType(capabilities: string[], workType: string): boolean {
  if (workType === "전체") return true;
  if (workType === "출장 가능") return capabilities.some((c) => c.includes("출장"));
  if (workType === "대형차 가능") return capabilities.some((c) => c.includes("대형"));
  if (workType === "EV 12V") return capabilities.some((c) => c.includes("EV 12V"));
  if (workType === "배터리 사진 확인") return capabilities.some((c) => c.includes("사진"));
  if (workType === "BMS 등록") return capabilities.some((c) => c.includes("BMS"));
  if (workType === "블랙박스 방전") return capabilities.some((c) => c.includes("블랙박스"));
  return capabilities.some((c) => c.includes(workType));
}
