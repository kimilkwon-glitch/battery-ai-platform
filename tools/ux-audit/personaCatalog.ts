import type {
  AgeGroup,
  JourneyType,
  KnowledgeLevel,
  Personality,
  PersonaVehicle,
  StartBehavior,
  Urgency,
} from "./types";

export type VehicleEntry = PersonaVehicle & { label: string };

export const VEHICLE_CATALOG: VehicleEntry[] = [
  { brand: "현대", model: "그랜저", generation: "IG", year: "2018", fuel: "가솔린", label: "그랜저 IG" },
  { brand: "현대", model: "그랜저", generation: "HG", year: "2015", fuel: "가솔린", label: "그랜저 HG" },
  { brand: "현대", model: "그랜저", generation: "GN7", year: "2023", fuel: "가솔린", label: "디 올 뉴 그랜저 GN7" },
  { brand: "제네시스", model: "G80", generation: "RG3", year: "2021", fuel: "가솔린", label: "제네시스 G80 RG3" },
  { brand: "제네시스", model: "GV70", generation: "JK1", year: "2022", fuel: "가솔린", label: "GV70" },
  { brand: "제네시스", model: "GV80", generation: "JX1", year: "2021", fuel: "가솔린", label: "GV80" },
  { brand: "기아", model: "쏘렌토", generation: "MQ4", year: "2021", fuel: "디젤", label: "쏘렌토 MQ4" },
  { brand: "기아", model: "셀토스", generation: "SP2", year: "2020", fuel: "가솔린", label: "셀토스" },
  { brand: "기아", model: "스포티지", generation: "NQ5", year: "2022", fuel: "하이브리드", label: "스포티지 NQ5" },
  { brand: "기아", model: "카니발", generation: "KA4", year: "2021", fuel: "디젤", label: "카니발 KA4" },
  { brand: "현대", model: "스타리아", generation: "US4", year: "2022", fuel: "디젤", label: "스타리아" },
  { brand: "현대", model: "포터2", generation: "2세대", year: "2019", fuel: "디젤", label: "포터2 2019" },
  { brand: "현대", model: "포터2", generation: "2세대", year: "2021", fuel: "디젤", label: "포터2 2020 이후" },
  { brand: "기아", model: "봉고3", generation: "3세대", year: "2020", fuel: "디젤", label: "봉고3" },
  { brand: "현대", model: "투싼", generation: "NX4", year: "2022", fuel: "가솔린", label: "투싼 NX4" },
  { brand: "현대", model: "싼타페", generation: "TM", year: "2019", fuel: "디젤", label: "싼타페 TM" },
  { brand: "현대", model: "싼타페", generation: "MX5", year: "2024", fuel: "하이브리드", label: "싼타페 MX5" },
  { brand: "현대", model: "코나", generation: "OS", year: "2021", fuel: "가솔린", label: "코나" },
  { brand: "현대", model: "아이오닉5", generation: "NE", year: "2022", fuel: "전기", label: "아이오닉5" },
  { brand: "현대", model: "아이오닉6", generation: "CE", year: "2023", fuel: "전기", label: "아이오닉6" },
  { brand: "기아", model: "EV6", generation: "CV", year: "2022", fuel: "전기", label: "EV6" },
  { brand: "현대", model: "아반떼", generation: "CN7", year: "2021", fuel: "가솔린", label: "아반떼 CN7" },
  { brand: "기아", model: "K5", generation: "DL3", year: "2021", fuel: "가솔린", label: "K5" },
  { brand: "기아", model: "K8", generation: "GL3", year: "2022", fuel: "가솔린", label: "K8" },
  { brand: "기아", model: "레이", generation: "TAM", year: "2020", fuel: "가솔린", label: "레이" },
  { brand: "기아", model: "모닝", generation: "JA", year: "2021", fuel: "가솔린", label: "모닝" },
  { brand: "르노코리아", model: "QM6", generation: "HFG", year: "2019", fuel: "가솔린", label: "QM6" },
  { brand: "쌍용", model: "티볼리", generation: "X100", year: "2020", fuel: "가솔린", label: "티볼리" },
  { brand: "KG모빌리티", model: "렉스턴 스포츠", generation: "Y400", year: "2021", fuel: "디젤", label: "렉스턴 스포츠" },
  { brand: "BMW", model: "520i", generation: "G30", year: "2019", fuel: "가솔린", label: "BMW 520i" },
  { brand: "벤츠", model: "C클래스", generation: "W205", year: "2018", fuel: "디젤", label: "벤츠 C클래스" },
  { brand: "MINI", model: "Cooper", generation: "F56", year: "2020", fuel: "가솔린", label: "미니" },
  { brand: "아우디", model: "A6", generation: "C8", year: "2021", fuel: "디젤", label: "아우디 A6" },
];

export const BATTERY_SPECS = [
  "AGM60L",
  "AGM70L",
  "AGM80L",
  "AGM80R",
  "AGM95L",
  "AGM95R",
  "AGM105L",
  "DIN50L",
  "DIN60L",
  "DIN62L",
  "DIN74L",
  "DIN74R",
  "DIN80L",
  "DIN90L",
  "90R",
  "100R",
  "115D31L",
  "115D31R",
  "CMF60L",
  "CMF80L",
  "eAGM60",
] as const;

export const SITUATIONS = [
  "시동 지연",
  "완전 방전",
  "장기주차 후 방전",
  "블랙박스 방전",
  "배터리 교체 예정",
  "규격 확인",
  "단자 방향 확인",
  "BMS/IBS 등록 확인",
  "택배 주문 전 확인",
  "정비소/매장 찾기",
  "사진으로 확인",
  "겨울철 시동 불량",
  "업그레이드 검토",
  "호환성 확인",
  "가격 비교",
] as const;

export const PERSONALITIES: Personality[] = [
  "급한 사람",
  "꼼꼼한 사람",
  "가격 비교형",
  "차를 잘 모르는 사람",
  "정비 지식 있는 사람",
  "모바일로 대충 보는 사람",
  "신뢰 확인형",
  "구매 직전형",
  "문의 전 확인형",
];

export const AGE_GROUPS: AgeGroup[] = ["20대", "30대", "40대", "50대", "60대"];

export const JOURNEY_START_BEHAVIOR: Record<JourneyType, StartBehavior> = {
  direct_search: "검색창부터 사용",
  browse_vehicle: "메인 카드 클릭",
  browse_spec: "규격표부터 확인",
  compare_battery: "검색창부터 사용",
  symptom_check: "메인 카드 클릭",
  photo_check: "사진 확인 버튼 찾기",
  faq_browse: "FAQ부터 확인",
  shop_order_check: "여러 페이지 둘러보기",
  repair_shop_search: "정비소/매장 찾기",
  trust_check: "여러 페이지 둘러보기",
};

export const CTAS_BY_JOURNEY: Record<JourneyType, string[]> = {
  direct_search: ["상세 보기", "규격 상세 보기", "차량 상세", "확인하기"],
  browse_vehicle: ["차량 상세", "규격 상세 보기", "상세 보기", "전체 차종"],
  browse_spec: ["규격 상세 보기", "상세 보기", "비교", "확인하기"],
  compare_battery: ["규격 상세 보기", "비교", "사진으로 확인", "확인하기"],
  symptom_check: ["증상 확인", "상세 보기", "문의", "사진으로 확인"],
  photo_check: ["사진으로 확인", "문의", "확인하기", "상세 보기"],
  faq_browse: ["답변 보기", "더보기", "문의", "확인하기"],
  shop_order_check: ["사진으로 확인", "문의", "확인하기", "상세 보기"],
  repair_shop_search: ["문의", "확인하기", "상세 보기", "작업"],
  trust_check: ["상세 보기", "확인하기", "가이드", "검색"],
};

export function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

export function knowledgeFor(index: number): KnowledgeLevel {
  const m = index % 10;
  if (m < 4) return "beginner";
  if (m < 8) return "normal";
  return "advanced";
}

export function urgencyFor(journey: JourneyType, personality: Personality, index: number): Urgency {
  if (personality === "급한 사람" || personality === "구매 직전형") return index % 2 === 0 ? "high" : "normal";
  if (journey === "symptom_check" || journey === "direct_search") return index % 4 === 0 ? "high" : "normal";
  if (personality === "모바일로 대충 보는 사람") return "low";
  return index % 5 === 0 ? "high" : index % 3 === 0 ? "low" : "normal";
}

export function deviceFor(journey: JourneyType, personality: Personality, index: number): "desktop" | "mobile" {
  if (personality === "모바일로 대충 보는 사람") return "mobile";
  if (journey === "photo_check" || journey === "symptom_check") return index % 2 === 0 ? "mobile" : "desktop";
  return index % 3 === 0 ? "mobile" : "desktop";
}

export function severityFor(journey: JourneyType, urgency: Urgency, personality: Personality): "HIGH" | "MEDIUM" | "LOW" {
  if (urgency === "high" || personality === "급한 사람" || personality === "구매 직전형") return "HIGH";
  if (journey === "compare_battery" || journey === "shop_order_check" || personality === "꼼꼼한 사람") return "MEDIUM";
  if (journey === "trust_check" || journey === "faq_browse") return "LOW";
  return urgency === "normal" ? "MEDIUM" : "LOW";
}

export function vehicleShortLabel(v: VehicleEntry): string {
  if (v.model === "G80") return `G80 ${v.generation}`;
  if (v.generation && !v.label.includes(v.generation) && v.model !== "포터2") {
    return `${v.model} ${v.generation}`;
  }
  return v.label.split(" ").slice(0, 2).join(" ");
}
