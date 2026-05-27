export type Vehicle = {
  id: string;
  displayName: string;
  brand: string;
  yearRange: string;
  fuel: string;
  batteryCode: string;
  upgradeCodes: string[];
  symptomIds: string[];
  guideIds: string[];
  questionIds: string[];
  brandIds: string[];
  searchVolume: string;
};

import type { BatteryImageSet } from "./battery-image";

export type Battery = {
  code: string;
  type: "AGM" | "DIN" | "EV" | "EFB" | "CMF";
  capacity: string;
  cca: string;
  terminal: string;
  size: string;
  images: BatteryImageSet;
  vehicleIds: string[];
  compareWith: string[];
  brandId: string;
  pros: string;
  cons: string;
  isgFit: string;
  bmsNote: string;
};

export type Symptom = {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  metric: string;
  vehicleIds: string[];
  batteryCodes: string[];
  guideIds: string[];
};

export type Guide = {
  id: string;
  title: string;
  summary: string;
  body: string;
  batteryCodes: string[];
  vehicleIds: string[];
  questionIds?: string[];
  comparePair?: [string, string];
};

export type QuestionType =
  | "업그레이드"
  | "방전"
  | "규격 호환"
  | "BMS/IBS"
  | "AGM/DIN"
  | "단자 방향"
  | "EV 12V"
  | "상용차"
  | "수입차";

export type Question = {
  id: string;
  title: string;
  status: "답변완료" | "답변중" | "전문가답변";
  category: string;
  /** 화면용 — 조회수 대신 "최근 문의 많음" 등 자연스러운 라벨 */
  activityLabel?: string;
  tags: string[];
  vehicleId?: string;
  batteryCode?: string;
  guideId?: string;
  answer: string;
  /** 카드용 1~2줄 요약 */
  shortAnswer?: string;
  questionType?: QuestionType;
  updatedAt?: string;
  featured?: boolean;
};

export type Brand = {
  id: string;
  displayName: string;
  line: string;
  popularCodes: string[];
  vehicleIds: string[];
  types: string[];
  guideIds: string[];
};

export type Trend = {
  id: string;
  label: string;
  reason: string;
  href: string;
  kind: "vehicle" | "battery" | "keyword" | "caution" | "season";
};

export type ServiceCenter = {
  id: string;
  name: string;
  location: string;
  distance: string;
  status: string;
  batteries: string[];
  vehicleIds: string[];
  capabilities: string[];
  review: string;
};
