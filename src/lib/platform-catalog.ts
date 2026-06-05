/**
 * Battery Manager 확장 카탈로그 (차량·배터리·콘텐츠·상품)
 * platform-data.ts와 병합 사용
 */
import type { VehicleBodyType } from "@/components/VehicleThumbnail";
import { bodyTypeFromAsset, getVehicleAsset } from "./car-assets";
import { EMPTY_BATTERY_IMAGE_SET, getBatteryImageSet, brandIdToBatteryBrandKey } from "./battery-alias-map";
import { getBatteryInternetPriceWon } from "./battery-prices";
import type { Battery, Question, Symptom, Vehicle } from "./platform-types";
import { platformQnaQuestions } from "./qna/catalog-questions";

export type ContentItem = {
  id: string;
  title: string;
  summary: string;
  batteryCode: string;
  vehicleId?: string;
  href: string;
  tag: string;
};

export type ShopProduct = {
  id: string;
  batteryCode: string;
  name: string;
  price: number | null;
  capacity: string;
  cca: string;
  type: string;
  terminal: string;
  vehicleIds: string[];
  caution: string;
  brandId: string;
};

export const vehicleBodyTypes: Record<string, VehicleBodyType> = {
  "grandeur-tg": "sedan",
  "grandeur-hg": "sedan",
  "grandeur-ig": "sedan",
  "grandeur-ig-fl": "sedan",
  "grandeur-gn7": "sedan",
  "sonata": "sedan",
  "bmw-g30": "sedan",
  "k5-dl3": "sedan",
  "sorento-mq4": "suv",
  "santa-fe": "suv",
  "palisade": "suv",
  "tucson-nx4": "suv",
  "seltos": "compactSuv",
  "ev6": "ev",
  "ioniq5": "ev",
  "carnival-ka4": "van",
};

export function getVehicleBodyType(vehicleId: string): VehicleBodyType {
  const asset =
    getVehicleAsset(vehicleId) ??
    getVehicleAsset(vehicleId.replace(/_/g, "-"));
  if (asset) return bodyTypeFromAsset(asset);
  return vehicleBodyTypes[vehicleId] ?? "sedan";
}

export const catalogVehicles: Vehicle[] = [
  {
    id: "grandeur-tg",
    displayName: "그랜저 TG",
    brand: "현대",
    yearRange: "2005-2011",
    fuel: "가솔린/디젤/LPG",
    batteryCode: "DIN74L",
    upgradeCodes: ["DIN74L"],
    symptomIds: ["slow-engine-start"],
    guideIds: ["cca-ah", "terminal-lr"],
    questionIds: [],
    brandIds: ["atk"],
    searchVolume: "4,120",
  },
  {
    id: "grandeur-hg",
    displayName: "그랜저 HG",
    brand: "현대",
    yearRange: "2011-2016",
    fuel: "가솔린/디젤/HEV/LPG",
    batteryCode: "DIN74L",
    upgradeCodes: ["AGM80L", "DIN74L"],
    symptomIds: ["slow-engine-start", "blackbox-drain"],
    guideIds: ["agm-vs-din", "cca-ah"],
    questionIds: [],
    brandIds: ["atk", "rocket"],
    searchVolume: "6,840",
  },
  {
    id: "grandeur-ig",
    displayName: "그랜저 IG",
    brand: "현대",
    yearRange: "2016-2019",
    fuel: "가솔린/LPG",
    batteryCode: "AGM80L",
    upgradeCodes: ["AGM95L"],
    symptomIds: ["slow-engine-start", "winter-discharge"],
    guideIds: ["agm-vs-din", "cca-ah", "wrong-spec"],
    questionIds: ["q-grandeur-upgrade"],
    brandIds: ["rocket", "delco"],
    searchVolume: "15,240",
  },
  {
    id: "grandeur-ig-fl",
    displayName: "더 뉴 그랜저 IG",
    brand: "현대",
    yearRange: "2019-2022",
    fuel: "가솔린/디젤/HEV/LPG",
    batteryCode: "AGM80L",
    upgradeCodes: ["AGM95L"],
    symptomIds: ["slow-engine-start", "agm-replacement"],
    guideIds: ["agm-vs-din", "bms-register"],
    questionIds: [],
    brandIds: ["rocket"],
    searchVolume: "11,620",
  },
  {
    id: "grandeur-gn7",
    displayName: "디 올 뉴 그랜저",
    brand: "현대",
    yearRange: "2022-현재",
    fuel: "가솔린/디젤/HEV/LPG",
    batteryCode: "AGM80L",
    upgradeCodes: ["AGM95L"],
    symptomIds: ["slow-engine-start", "agm-replacement"],
    guideIds: ["agm-vs-din", "bms-register"],
    questionIds: [],
    brandIds: ["rocket", "delco"],
    searchVolume: "12,400",
  },
  {
    id: "sonata",
    displayName: "쏘나타",
    brand: "현대",
    yearRange: "2019-2024",
    fuel: "가솔린/LPG",
    batteryCode: "AGM80L",
    upgradeCodes: ["AGM95L"],
    symptomIds: ["slow-engine-start", "short-trip-wear"],
    guideIds: ["agm-vs-din", "cca-ah"],
    questionIds: ["q-voltage-121"],
    brandIds: ["rocket", "solite"],
    searchVolume: "10,880",
  },
  {
    id: "seltos",
    displayName: "셀토스",
    brand: "기아",
    yearRange: "2019-2025",
    fuel: "가솔린",
    batteryCode: "AGM60L",
    upgradeCodes: ["AGM70L"],
    symptomIds: ["slow-engine-start", "blackbox-drain"],
    guideIds: ["agm-vs-din", "agm-sizes"],
    questionIds: ["q-seltos-upgrade"],
    brandIds: ["rocket"],
    searchVolume: "11,082",
  },
  {
    id: "sorento-mq4",
    displayName: "쏘렌토 MQ4",
    brand: "기아",
    yearRange: "2020-2025",
    fuel: "디젤/HEV",
    batteryCode: "AGM95L",
    upgradeCodes: ["AGM105L"],
    symptomIds: ["blackbox-drain", "slow-engine-start"],
    guideIds: ["agm-vs-din", "bms-register", "wrong-spec"],
    questionIds: ["q-sorento-agm"],
    brandIds: ["rocket", "varta"],
    searchVolume: "18,100",
  },
  {
    id: "tucson-nx4",
    displayName: "투싼 NX4",
    brand: "현대",
    yearRange: "2020-2025",
    fuel: "가솔린/HEV",
    batteryCode: "AGM70L",
    upgradeCodes: ["AGM80L"],
    symptomIds: ["slow-engine-start", "blackbox-drain"],
    guideIds: ["agm-sizes", "agm-vs-din"],
    questionIds: [],
    brandIds: ["rocket", "solite"],
    searchVolume: "9,420",
  },
  {
    id: "santa-fe",
    displayName: "싼타페",
    brand: "현대",
    yearRange: "2018-2024",
    fuel: "가솔린/디젤",
    batteryCode: "AGM80L",
    upgradeCodes: ["AGM95L"],
    symptomIds: ["winter-discharge", "slow-engine-start"],
    guideIds: ["winter-cca", "agm-vs-din"],
    questionIds: [],
    brandIds: ["rocket", "varta"],
    searchVolume: "8,640",
  },
  {
    id: "palisade",
    displayName: "팰리세이드",
    brand: "현대",
    yearRange: "2019-2025",
    fuel: "가솔린/디젤",
    batteryCode: "AGM95L",
    upgradeCodes: ["AGM105L"],
    symptomIds: ["blackbox-drain", "slow-engine-start"],
    guideIds: ["agm-sizes", "bms-register"],
    questionIds: [],
    brandIds: ["rocket", "delco"],
    searchVolume: "7,920",
  },
  {
    id: "carnival-ka4",
    displayName: "카니발 KA4",
    brand: "기아",
    yearRange: "2020-2025",
    fuel: "가솔린/디젤",
    batteryCode: "AGM95L",
    upgradeCodes: ["AGM105L"],
    symptomIds: ["blackbox-drain", "short-trip-wear"],
    guideIds: ["agm-sizes", "blackbox-cutoff"],
    questionIds: [],
    brandIds: ["varta", "rocket"],
    searchVolume: "7,104",
  },
  {
    id: "ev6",
    displayName: "EV6",
    brand: "기아",
    yearRange: "2021-2026",
    fuel: "전기",
    batteryCode: "EV 12V",
    upgradeCodes: ["EV 12V AGM"],
    symptomIds: ["ev12v-discharge"],
    guideIds: ["ev-12v", "bms-register"],
    questionIds: ["q-ev6-12v"],
    brandIds: ["infinit", "varta"],
    searchVolume: "21,600",
  },
  {
    id: "ioniq5",
    displayName: "아이오닉5",
    brand: "현대",
    yearRange: "2021-2026",
    fuel: "전기",
    batteryCode: "EV 12V",
    upgradeCodes: ["EV 12V AGM"],
    symptomIds: ["ev12v-discharge"],
    guideIds: ["ev-12v"],
    questionIds: [],
    brandIds: ["infinit"],
    searchVolume: "14,200",
  },
  {
    id: "bmw-g30",
    displayName: "BMW 520i (G30)",
    brand: "BMW",
    yearRange: "2017-2023",
    fuel: "가솔린/디젤",
    batteryCode: "AGM92Ah",
    upgradeCodes: ["AGM95Ah"],
    symptomIds: ["slow-engine-start", "agm-replacement", "bms-warning"],
    guideIds: ["bms-register", "agm-vs-din"],
    questionIds: ["q-bmw-bms"],
    brandIds: ["varta", "delco"],
    searchVolume: "6,200",
  },
  {
    id: "k5-dl3",
    displayName: "K5 DL3",
    brand: "기아",
    yearRange: "2019-2024",
    fuel: "가솔린/LPG",
    batteryCode: "DIN74L",
    upgradeCodes: ["AGM80L"],
    symptomIds: ["slow-engine-start"],
    guideIds: ["din-sizes", "agm-vs-din"],
    questionIds: ["q-din-agm"],
    brandIds: ["atk", "solite"],
    searchVolume: "9,744",
  },
];

function bat(partial: Omit<Battery, "images"> & { code: string }): Battery {
  const brandKey = brandIdToBatteryBrandKey(partial.brandId);
  const images =
    (brandKey ? getBatteryImageSet(partial.code, brandKey) : undefined) ?? EMPTY_BATTERY_IMAGE_SET;
  return { ...partial, images };
}

export const catalogBatteries: Battery[] = [
  bat({ code: "AGM60L", type: "AGM", capacity: "60Ah", cca: "640CCA", terminal: "L", size: "242×175×190", vehicleIds: ["seltos"], compareWith: ["AGM70L", "DIN60L"], brandId: "rocket", pros: "소형 SUV·ISG", cons: "용량업 시 공간 확인", isgFit: "적합", bmsNote: "IBS 확인" }),
  bat({ code: "AGM70L", type: "AGM", capacity: "70Ah", cca: "760CCA", terminal: "L", size: "278×175×190", vehicleIds: ["seltos", "k5-dl3", "tucson-nx4"], compareWith: ["AGM60L", "AGM80L"], brandId: "rocket", pros: "중형 플랫폼", cons: "CCA 여유 확인", isgFit: "적합", bmsNote: "권장" }),
  bat({ code: "AGM80L", type: "AGM", capacity: "80Ah", cca: "800CCA", terminal: "L", size: "315×175×190", vehicleIds: ["grandeur-ig", "bmw-g30", "k5-dl3", "sonata", "santa-fe", "tucson-nx4"], compareWith: ["AGM70L", "DIN74L", "AGM95L"], brandId: "rocket", pros: "ISG 세단/SUV", cons: "가격 상승", isgFit: "매우 적합", bmsNote: "BMS 확인" }),
  bat({ code: "AGM95L", type: "AGM", capacity: "95Ah", cca: "850CCA", terminal: "L", size: "353×175×190", vehicleIds: ["sorento-mq4", "grandeur-ig", "palisade", "carnival-ka4"], compareWith: ["AGM80L", "AGM105L", "AGM95R"], brandId: "rocket", pros: "대형·ISG", cons: "무게·가격", isgFit: "매우 적합", bmsNote: "등록 권장" }),
  bat({ code: "AGM95R", type: "AGM", capacity: "95Ah", cca: "850CCA", terminal: "R", size: "353×175×190", vehicleIds: ["sorento-mq4"], compareWith: ["AGM95L"], brandId: "rocket", pros: "R단자 대형·ISG", cons: "L/R 혼동 주의", isgFit: "매우 적합", bmsNote: "등록 권장" }),
  bat({ code: "AGM105L", type: "AGM", capacity: "105Ah", cca: "900CCA", terminal: "L", size: "353×175×190", vehicleIds: ["sorento-mq4", "palisade", "carnival-ka4"], compareWith: ["AGM95L", "AGM80L"], brandId: "rocket", pros: "대형 SUV·승합", cons: "무게·가격", isgFit: "매우 적합", bmsNote: "IBS 확인" }),
  bat({ code: "AGM92Ah", type: "AGM", capacity: "92Ah", cca: "850CCA", terminal: "L", size: "353×175×190", vehicleIds: ["bmw-g30"], compareWith: ["AGM80L", "AGM95L"], brandId: "varta", pros: "수입차 순정", cons: "등록 필수", isgFit: "필수", bmsNote: "등록 필수" }),
  bat({ code: "DIN60L", type: "DIN", capacity: "60Ah", cca: "600CCA", terminal: "L", size: "242×175×190", vehicleIds: ["k5-dl3"], compareWith: ["AGM60L", "DIN74L"], brandId: "atk", pros: "소형 일반", cons: "ISG 비권장", isgFit: "조건부", bmsNote: "확인" }),
  bat({ code: "DIN74L", type: "DIN", capacity: "74Ah", cca: "680CCA", terminal: "L", size: "278×175×190", vehicleIds: ["k5-dl3", "grandeur-ig"], compareWith: ["AGM80L", "AGM70L"], brandId: "atk", pros: "일반 차량", cons: "ISG 비권장", isgFit: "조건부", bmsNote: "다운그레이드 주의" }),
  bat({ code: "DIN80L", type: "DIN", capacity: "80Ah", cca: "720CCA", terminal: "L", size: "315×175×190", vehicleIds: ["sonata"], compareWith: ["DIN74L", "AGM80L"], brandId: "atk", pros: "일반 중형", cons: "ISG 주의", isgFit: "조건부", bmsNote: "확인" }),
  bat({ code: "EV 12V", type: "EV", capacity: "60Ah", cca: "620CCA", terminal: "L", size: "242×175×190", vehicleIds: ["ev6", "ioniq5"], compareWith: ["EV 12V AGM", "AGM70L"], brandId: "infinit", pros: "EV 보조전원", cons: "일반 대체 주의", isgFit: "EV 전용", bmsNote: "로그 확인" }),
  bat({ code: "EV 12V AGM", type: "EV", capacity: "60Ah", cca: "650CCA", terminal: "L", size: "242×175×190", vehicleIds: ["ev6", "ioniq5"], compareWith: ["EV 12V"], brandId: "infinit", pros: "EV AGM 보조", cons: "순정 확인", isgFit: "EV 전용", bmsNote: "권장" }),
  bat({ code: "CMF40L", type: "CMF", capacity: "40Ah", cca: "520CCA", terminal: "L", size: "207×175×190", vehicleIds: ["seltos"], compareWith: ["CMF60L"], brandId: "solite", pros: "소형 CMF", cons: "용량 확인", isgFit: "조건부", bmsNote: "확인" }),
  bat({ code: "CMF60L", type: "CMF", capacity: "60Ah", cca: "640CCA", terminal: "L", size: "242×175×190", vehicleIds: ["seltos", "k5-dl3"], compareWith: ["CMF80L", "AGM60L"], brandId: "solite", pros: "중형 CMF", cons: "ISG 트림 확인", isgFit: "조건부", bmsNote: "확인" }),
  bat({ code: "CMF80L", type: "CMF", capacity: "80Ah", cca: "780CCA", terminal: "L", size: "315×175×190", vehicleIds: ["grandeur-ig", "sonata"], compareWith: ["CMF90L", "AGM80L"], brandId: "solite", pros: "중대형 CMF", cons: "가격·무게", isgFit: "조건부", bmsNote: "확인" }),
  bat({ code: "CMF80R", type: "CMF", capacity: "80Ah", cca: "780CCA", terminal: "R", size: "315×175×190", vehicleIds: ["sonata"], compareWith: ["CMF80L"], brandId: "solite", pros: "R단자 CMF", cons: "L/R 혼동 주의", isgFit: "조건부", bmsNote: "단자 확인" }),
  bat({ code: "CMF90L", type: "CMF", capacity: "90Ah", cca: "820CCA", terminal: "L", size: "353×175×190", vehicleIds: ["sorento-mq4"], compareWith: ["CMF100L"], brandId: "solite", pros: "대형 CMF", cons: "공간 확인", isgFit: "조건부", bmsNote: "확인" }),
  bat({ code: "CMF90R", type: "CMF", capacity: "90Ah", cca: "820CCA", terminal: "R", size: "353×175×190", vehicleIds: ["sorento-mq4"], compareWith: ["CMF90L"], brandId: "solite", pros: "R단자 대형", cons: "L/R 혼동 주의", isgFit: "조건부", bmsNote: "단자 확인" }),
  bat({ code: "CMF100L", type: "CMF", capacity: "100Ah", cca: "860CCA", terminal: "L", size: "353×175×190", vehicleIds: ["palisade"], compareWith: ["CMF90L"], brandId: "solite", pros: "대형 SUV", cons: "무게·가격", isgFit: "조건부", bmsNote: "확인" }),
  bat({ code: "CMF100R", type: "CMF", capacity: "100Ah", cca: "860CCA", terminal: "R", size: "353×175×190", vehicleIds: ["palisade"], compareWith: ["CMF100L"], brandId: "solite", pros: "R단자 대형", cons: "L/R 혼동 주의", isgFit: "조건부", bmsNote: "단자 확인" }),
  bat({ code: "CMF54459", type: "DIN", capacity: "50Ah", cca: "580CCA", terminal: "L", size: "207×175×190", vehicleIds: ["k5-dl3"], compareWith: ["DIN74L", "CMF57412"], brandId: "solite", pros: "DIN H5·쏠라이트", cons: "ISG 비권장", isgFit: "조건부", bmsNote: "DIN44L 호환" }),
  bat({ code: "CMF56219", type: "DIN", capacity: "62Ah", cca: "620CCA", terminal: "L", size: "242×175×190", vehicleIds: ["k5-dl3"], compareWith: ["CMF57412", "DIN74L"], brandId: "solite", pros: "DIN H6·쏠라이트", cons: "ISG 비권장", isgFit: "조건부", bmsNote: "DIN62L 표기" }),
  bat({ code: "CMF57412", type: "DIN", capacity: "74Ah", cca: "680CCA", terminal: "L", size: "278×175×190", vehicleIds: ["k5-dl3", "grandeur-ig"], compareWith: ["AGM80L", "CMF56219"], brandId: "solite", pros: "DIN H6·쏠라이트", cons: "ISG 비권장", isgFit: "조건부", bmsNote: "다운그레이드 주의" }),
];

export const catalogExtraSymptoms: Symptom[] = [
  { id: "battery-warning", title: "배터리 경고등", subtitle: "충전·센서·SOH", tags: ["경고등"], metric: "점검 82%", vehicleIds: ["bmw-g30", "sorento-mq4"], batteryCodes: ["AGM92Ah", "AGM95L"], guideIds: ["bms-register"] },
  { id: "bms-warning", title: "IBS/BMS 오류", subtitle: "등록·센서 학습", tags: ["BMS", "IBS"], metric: "수입차 91%", vehicleIds: ["bmw-g30"], batteryCodes: ["AGM92Ah"], guideIds: ["bms-register"] },
  { id: "short-trip-wear", title: "단거리 주행 문제", subtitle: "충전 부족·SOH", tags: ["단거리"], metric: "누적 54%", vehicleIds: ["sonata", "carnival-ka4"], batteryCodes: ["AGM80L"], guideIds: ["cca-ah"] },
];

export const catalogExtraQuestions: Question[] = platformQnaQuestions;

export const contents: ContentItem[] = [
  { id: "c1", title: "쏘렌토 MQ4 AGM95L 교체 체크리스트", summary: "IBS 학습·AGM80L 혼동 주의", batteryCode: "AGM95L", vehicleId: "sorento-mq4", href: "/search?q=쏘렌토%20MQ4%20AGM95L", tag: "교체가이드" },
  { id: "c2", title: "EV6 12V 방전 패턴 분석", summary: "보조배터리·대기전류 점검", batteryCode: "EV 12V", vehicleId: "ev6", href: "/vehicle/ev6", tag: "EV" },
  { id: "c3", title: "AGM80L vs DIN74L 실전 비교", summary: "ISG 차량 오주문 사례", batteryCode: "AGM80L", href: "/compare?items=AGM80L,DIN74L", tag: "비교" },
  { id: "c4", title: "겨울철 CCA 점검 5분 요약", summary: "시동 지연 전 점검 항목", batteryCode: "AGM80L", href: "/guide/spec?guide=winter-cca", tag: "계절" },
  { id: "c5", title: "셀토스 AGM70L 업그레이드 Q&A", summary: "용량업 조건 정리", batteryCode: "AGM70L", vehicleId: "seltos", href: "/community?q=셀토스", tag: "Q&A" },
];

export const shopProducts: ShopProduct[] = catalogBatteries.map((b) => ({
  id: `shop-${b.code.replace(/\s+/g, "-").toLowerCase()}`,
  batteryCode: b.code,
  name: `${b.code} 배터리`,
  price: getBatteryInternetPriceWon(b.brandId, b.code),
  capacity: b.capacity,
  cca: b.cca,
  type: b.type,
  terminal: b.terminal,
  vehicleIds: b.vehicleIds,
  caution: b.type === "DIN" ? "ISG 차량 다운그레이드 주의" : b.type === "EV" ? "EV 보조전원 전용 확인" : "BMS/IBS 등록 확인",
  brandId: b.brandId,
}));
