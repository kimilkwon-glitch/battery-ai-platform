import { getSearchHref } from "@/lib/battery-search";
import { getBatteryHref, getVehicleHref } from "@/lib/content";
import { getVehicleAsset, vehicleAssetHref } from "@/lib/car-assets";

export const HERO_QUICK_VEHICLES = [
  { id: "grandeur-ig", label: "그랜저" },
  { id: "sorento-mq4", label: "쏘렌토" },
  { id: "porter2-new", label: "포터2" },
  { id: "staria-us4", label: "스타리아" },
  { id: "g80-rg3", label: "G80" },
] as const;

export const HERO_SEARCH_SUGGESTIONS = [
  "그랜저 IG 가솔린",
  "쏘렌토 MQ4 하이브리드",
  "포터2 20년식",
  "스타리아 LPG",
  "G80 RG3",
] as const;

export const FEATURED_VEHICLE_IDS = [
  "sorento-mq4",
  "grandeur-ig",
  "ioniq5-ne",
  "k8-gl3",
  "carnival-ka4",
  "tucson-nx4",
] as const;

export const FEATURED_BATTERY_CODES = ["AGM60L", "AGM70L", "AGM80L", "DIN74L", "AGM95R", "100R"] as const;

export const HERO_BATTERY_CODES = ["AGM80L", "AGM60L", "100R"] as const;

export const CONFUSED_CASES = [
  {
    title: "포터2 2020년 전후 90R/100R",
    desc: "연식에 따라 규격이 달라지는 대표 케이스",
    href: "/guides/porter2-year-battery-guide",
    badge: "연식",
  },
  {
    title: "스타리아 AGM80R",
    desc: "디젤·LPG R단자 AGM 확인",
    href: "/guides/staria-agm80r-guide",
    badge: "R단자",
  },
  {
    title: "쏘렌토 MQ4 하이브리드 AGM60L",
    desc: "HEV 트림 전용 소형 AGM",
    href: "/guides/sorento-mq4-hybrid-agm60l",
    badge: "HEV",
  },
  {
    title: "G90 연식별 AGM105L/R",
    desc: "대형 세단 L/R 단자·용량 구분",
    href: "/guides/g80-rg3-agm95r-guide",
    badge: "제네시스",
  },
] as const;

export const SIDEBAR_QUICK_FIND = [
  { label: "차종으로 찾기", desc: "내 차량 기준 배터리 확인", href: "/vehicles", icon: "car" as const },
  { label: "규격으로 찾기", desc: "AGM · DIN · CMF 규격 비교", href: "/compare", icon: "battery" as const },
  { label: "연료별로 보기", desc: "가솔린 · 디젤 · LPG · HEV", href: getSearchHref("하이브리드 배터리"), icon: "fuel" as const },
  { label: "사진으로 확인", desc: "단자·라벨 사진으로 규격 확인", href: "/analysis/photo", icon: "camera" as const },
  { label: "증상으로 찾기", desc: "시동·방전 증상 기준 확인", href: "/diagnosis", icon: "symptom" as const },
] as const;

export const SIDEBAR_POPULAR_VEHICLES = [
  { id: "grandeur-ig", label: "그랜저 IG" },
  { id: "sorento-mq4", label: "쏘렌토 MQ4" },
  { id: "porter2-new", label: "포터2" },
  { id: "staria-us4", label: "스타리아" },
  { id: "g80-rg3", label: "G80 RG3" },
] as const;

export const SIDEBAR_POPULAR_BATTERIES = [
  { code: "AGM60L", label: "AGM60L" },
  { code: "AGM70L", label: "AGM70L" },
  { code: "AGM80L", label: "AGM80L" },
  { code: "AGM95R", label: "AGM95R" },
  { code: "100R", label: "100R" },
] as const;

export const SIDEBAR_RECENT_UPDATES = [
  {
    title: "쏘렌토 MQ4 하이브리드 AGM60L 반영",
    href: "/guides/sorento-mq4-hybrid-agm60l",
  },
  {
    title: "포터2 2020년 이후 100R 반영",
    href: "/guides/porter2-year-battery-guide",
  },
  {
    title: "GV70 AGM80R 반영",
    href: getSearchHref("GV70 AGM80R"),
  },
] as const;

export function vehicleLinkForId(vehicleId: string): string {
  const asset = getVehicleAsset(vehicleId);
  if (asset) return vehicleAssetHref(asset);
  return getVehicleHref(vehicleId);
}

export function batteryLinkForCode(code: string): string {
  return getBatteryHref(code);
}
