import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeftRight,
  BadgeCheck,
  Battery,
  BatteryCharging,
  BookOpen,
  CalendarCheck,
  Camera,
  Car,
  CheckCircle,
  CircleAlert,
  ClipboardCheck,
  Clock,
  Focus,
  Gauge,
  GitCompare,
  HelpCircle,
  Layers,
  ListFilter,
  LocateFixed,
  MapPin,
  MapPinned,
  MessageCircleQuestion,
  MessagesSquare,
  Package,
  PackageCheck,
  Phone,
  PlugZap,
  Route,
  ScanLine,
  ScanSearch,
  Search,
  Settings,
  ShieldCheck,
  SplitSquareHorizontal,
  Store,
  TrendingUp,
  Truck,
  Wrench,
  ZapOff,
} from "lucide-react";
import { IconPhotoScan, IconTool, IconTruckDelivery } from "@tabler/icons-react";
import type { ComponentType } from "react";

type TablerIcon = ComponentType<{ className?: string; stroke?: number }>;

/** 사이트 전역 의미 단위 아이콘 키 — 동일 CTA/기능은 동일 키 */
export type IconKey =
  | "search"
  | "vehicle"
  | "battery"
  | "batterySpec"
  | "ev"
  | "photoCheck"
  | "photoLabel"
  | "photoTerminal"
  | "photoTray"
  | "photoVerify"
  | "compare"
  | "compareVs"
  | "symptom"
  | "symptomDischarge"
  | "symptomStart"
  | "warning"
  | "verify"
  | "checklist"
  | "store"
  | "location"
  | "outbound"
  | "delivery"
  | "phone"
  | "qna"
  | "guide"
  | "help"
  | "wrench"
  | "trending"
  | "layers"
  | "terminal"
  | "clock"
  | "package"
  | "messages"
  | "gauge"
  | "zapOff"
  | "plugZap"
  | "scanLine"
  | "mapPinned"
  | "focus"
  | "circleAlert"
  | "listFilter"
  | "calendarCheck"
  | "route"
  | "settings"
  | "badgeCheck"
  | "splitTerminal";

export type IconTone = "blue" | "emerald" | "amber" | "slate" | "indigo" | "neutral";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

export const ICON_SIZE_CLASS: Record<IconSize, string> = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
  xl: "size-6",
  hero: "size-8",
};

export const ICON_TONE_PILL: Record<IconTone, string> = {
  blue: "bm-icon-pill",
  emerald: "bm-icon-pill bm-icon-pill--emerald",
  amber: "bm-icon-pill bm-icon-pill--amber",
  slate: "bm-icon-pill",
  indigo: "bm-icon-pill",
  neutral: "bm-icon-pill",
};

export const ICON_TONE_TEXT: Record<IconTone, string> = {
  blue: "text-blue-600",
  emerald: "text-emerald-700",
  amber: "text-amber-700",
  slate: "text-slate-600",
  indigo: "text-indigo-600",
  neutral: "text-slate-500",
};

type IconDef = {
  lucide: LucideIcon;
  tabler?: TablerIcon;
  tone: IconTone;
};

export const ICON_MAP: Record<IconKey, IconDef> = {
  search: { lucide: Search, tone: "blue" },
  vehicle: { lucide: Car, tone: "blue" },
  battery: { lucide: Battery, tone: "blue" },
  batterySpec: { lucide: BatteryCharging, tone: "blue" },
  ev: { lucide: PlugZap, tone: "emerald" },
  photoCheck: { lucide: Camera, tabler: IconPhotoScan, tone: "emerald" },
  photoLabel: { lucide: ScanSearch, tone: "emerald" },
  photoTerminal: { lucide: ScanLine, tone: "emerald" },
  photoTray: { lucide: MapPinned, tone: "emerald" },
  photoVerify: { lucide: ShieldCheck, tone: "emerald" },
  compare: { lucide: GitCompare, tone: "blue" },
  compareVs: { lucide: ArrowLeftRight, tone: "blue" },
  symptom: { lucide: AlertTriangle, tone: "amber" },
  symptomDischarge: { lucide: ZapOff, tone: "amber" },
  symptomStart: { lucide: Gauge, tone: "amber" },
  warning: { lucide: CircleAlert, tone: "amber" },
  verify: { lucide: CheckCircle, tone: "emerald" },
  checklist: { lucide: ClipboardCheck, tone: "emerald" },
  store: { lucide: Store, tone: "slate" },
  location: { lucide: MapPin, tone: "slate" },
  outbound: { lucide: Truck, tabler: IconTruckDelivery, tone: "slate" },
  delivery: { lucide: PackageCheck, tone: "slate" },
  phone: { lucide: Phone, tone: "slate" },
  qna: { lucide: MessageCircleQuestion, tone: "indigo" },
  guide: { lucide: BookOpen, tone: "indigo" },
  help: { lucide: HelpCircle, tone: "indigo" },
  wrench: { lucide: Wrench, tabler: IconTool, tone: "slate" },
  trending: { lucide: TrendingUp, tone: "blue" },
  layers: { lucide: Layers, tone: "blue" },
  terminal: { lucide: SplitSquareHorizontal, tone: "blue" },
  clock: { lucide: Clock, tone: "slate" },
  package: { lucide: Package, tone: "slate" },
  messages: { lucide: MessagesSquare, tone: "indigo" },
  gauge: { lucide: Gauge, tone: "amber" },
  zapOff: { lucide: ZapOff, tone: "amber" },
  plugZap: { lucide: PlugZap, tone: "emerald" },
  scanLine: { lucide: ScanLine, tone: "emerald" },
  mapPinned: { lucide: LocateFixed, tone: "emerald" },
  focus: { lucide: Focus, tone: "amber" },
  circleAlert: { lucide: CircleAlert, tone: "amber" },
  listFilter: { lucide: ListFilter, tone: "blue" },
  calendarCheck: { lucide: CalendarCheck, tone: "slate" },
  route: { lucide: Route, tone: "slate" },
  settings: { lucide: Settings, tone: "slate" },
  badgeCheck: { lucide: BadgeCheck, tone: "blue" },
  splitTerminal: { lucide: SplitSquareHorizontal, tone: "blue" },
};

export function getIconDef(key: IconKey): IconDef {
  return ICON_MAP[key];
}

export function getLucideIcon(key: IconKey): LucideIcon {
  return ICON_MAP[key].lucide;
}

export function getTablerIcon(key: IconKey): TablerIcon | undefined {
  return ICON_MAP[key].tabler;
}

/** 메인 히어로 검색 유형 칩 */
export const HOME_SEARCH_CHIP_ICONS: Record<string, IconKey> = {
  "차량명 검색": "vehicle",
  "배터리 규격 검색": "batterySpec",
  "증상 진단": "symptom",
  "사진 확인": "photoCheck",
};

/** 인기 검색 패턴 태그 */
export const TRENDING_TAG_ICONS: Record<string, IconKey> = {
  연식: "vehicle",
  연료: "batterySpec",
  HEV: "ev",
  CMF: "layers",
  비교: "compare",
  EV: "ev",
  증상: "symptom",
};

/** 증상 허브 카드 */
export const SYMPTOM_ITEM_ICONS: Record<string, IconKey> = {
  "slow-start": "symptomStart",
  blackbox: "symptomDischarge",
  parking: "symptomDischarge",
  jump: "symptomDischarge",
  winter: "symptomDischarge",
  "hybrid-aux": "ev",
  ev12v: "ev",
  isg: "batterySpec",
  warning: "warning",
  "after-replace": "checklist",
};

/** 주문 체크리스트 단계 */
export const ORDER_CHECKLIST_STEP_ICONS: IconKey[] = [
  "vehicle",
  "calendarCheck",
  "ev",
  "warning",
  "photoLabel",
];

/** 주문 체크리스트 주제 카드 */
export const ORDER_SECTION_ICON_FROM_TITLE: Record<string, IconKey> = {
  "단자 방향": "terminal",
  "AGM": "layers",
  "CMF80L": "warning",
  "90R": "compareVs",
  "하이브리드": "ev",
};

/** 사진 예시 카드 */
export const PHOTO_EXAMPLE_ICONS: Record<string, IconKey> = {
  top: "photoTray",
  label: "photoLabel",
  terminal: "photoTerminal",
  tray: "photoTray",
  blur: "circleAlert",
  hidden: "warning",
  crop: "focus",
};

/** 매장 카드 id */
export const STORE_CARD_ICONS: Record<string, IconKey> = {
  deokcheon: "store",
  hakjang: "store",
  outbound: "outbound",
  "photo-guide": "photoCheck",
};

/** 택배 주문 단계 */
export const DELIVERY_STEP_ICONS: IconKey[] = ["batterySpec", "vehicle", "photoCheck"];

/** 플랫폼 허브 링크 */
export const PLATFORM_HUB_ICON_KEYS: Record<string, IconKey> = {
  ["/order-checklist"]: "checklist",
  ["/symptoms"]: "symptom",
  ["/photo-check"]: "photoCheck",
  ["/compare"]: "compare",
  ["/service"]: "store",
  ["/guides"]: "guide",
};

export function resolveIconKeyForHubLink(title: string, href: string): IconKey {
  const path = href.split("?")[0] ?? href;
  if (PLATFORM_HUB_ICON_KEYS[path]) return PLATFORM_HUB_ICON_KEYS[path];
  if (/체크리스트|주문 전/.test(title)) return "checklist";
  if (/증상|진단|방전|시동/.test(title)) return "symptom";
  if (/사진/.test(title)) return "photoCheck";
  if (/비교|vs/i.test(title)) return "compare";
  if (/매장|출장|택배|서비스/.test(title)) return "store";
  if (/Q&A|질문|가이드/.test(title)) return /가이드/.test(title) ? "guide" : "qna";
  if (/검색/.test(title)) return "search";
  return "help";
}

export function resolveIconKeyFromText(text: string): IconKey {
  const s = text;
  if (/통합검색|^검색$|검색하기|검색 결과/.test(s)) return "search";
  if (/차량\s*검색|차량명\s*검색|내\s*차|차종\s*검색|차량\s*기준/.test(s)) return "vehicle";
  if (/규격\s*검색|배터리\s*규격|AGM|DIN|CMF|규격\s*상세/.test(s)) return "batterySpec";
  if (/전기차|하이브리드|EV\s*12|보조\s*12|PlugZap/i.test(s)) return "ev";
  if (/사진확인|사진으로\s*최종|사진\s*확인|사진\s*분석/.test(s)) return "photoCheck";
  if (/라벨/.test(s)) return "photoLabel";
  if (/단자/.test(s)) return "photoTerminal";
  if (/비교|VS|vs\s|규격\s*비교/.test(s)) return "compare";
  if (/방전|블랙박스|야간/.test(s)) return "symptomDischarge";
  if (/시동\s*지연|시동이\s*늦|딸깍/.test(s)) return "symptomStart";
  if (/증상\s*진단|증상/.test(s)) return "symptom";
  if (/점검|확인|검증|Shield/.test(s)) return "verify";
  if (/체크리스트|준비물|주문\s*전/.test(s)) return "checklist";
  if (/매장|직영/.test(s)) return "store";
  if (/위치|지역|권역/.test(s)) return "location";
  if (/출장/.test(s)) return "outbound";
  if (/택배|배송|자가장착/.test(s)) return "delivery";
  if (/전화|문의|상담/.test(s)) return "phone";
  if (/Q&A|질문/.test(s)) return "qna";
  if (/가이드|설명서/.test(s)) return "guide";
  if (/정비|작업|공구/.test(s)) return "wrench";
  if (/경고|주의/.test(s)) return "warning";
  if (/인기\s*검색|패턴|트렌드/.test(s)) return "trending";
  return "help";
}

export function resolveIconKeyFromCtaLabel(label: string): IconKey | null {
  const key = resolveIconKeyFromText(label);
  if (key === "help") return null;
  return key;
}

export function resolveServiceOptionIcon(title: string): IconKey {
  if (title.includes("출장")) return "outbound";
  if (title.includes("택배") || title.includes("자가")) return "delivery";
  if (title.includes("매장") || title.includes("내방")) return "store";
  if (title.includes("사진")) return "photoCheck";
  return "phone";
}

/** image-slot purpose → registry (Tabler는 차량·사진·정비·출장 특화만) */
export function resolveImageSlotIconKey(purpose: string, assetKey: string): {
  key: IconKey;
  preferTabler: boolean;
} {
  if (purpose.includes("outbound") || assetKey.includes("outbound") || assetKey.includes("field")) {
    return { key: "outbound", preferTabler: true };
  }
  if (purpose.includes("vehicle") && assetKey.includes("commercial")) {
    return { key: "vehicle", preferTabler: true };
  }
  if (purpose.includes("photo") || purpose.includes("scan")) {
    return { key: "photoCheck", preferTabler: true };
  }
  if (purpose.includes("inspection") || purpose.includes("work") || purpose.includes("tester")) {
    return { key: "wrench", preferTabler: true };
  }
  if (purpose.includes("store") || assetKey.includes("store")) return { key: "store", preferTabler: false };
  if (purpose.includes("delivery") || purpose.includes("pack")) return { key: "delivery", preferTabler: false };
  if (purpose.includes("label")) return { key: "photoLabel", preferTabler: false };
  if (purpose.includes("symptom") || purpose.includes("blackbox")) return { key: "symptom", preferTabler: false };
  if (purpose.includes("vehicle") || assetKey.includes("vehicle")) return { key: "vehicle", preferTabler: false };
  if (purpose.includes("battery") || purpose.includes("product")) return { key: "battery", preferTabler: false };
  if (purpose.includes("compare")) return { key: "compare", preferTabler: false };
  if (purpose.includes("checklist")) return { key: "checklist", preferTabler: false };
  if (purpose.includes("guide")) return { key: "guide", preferTabler: false };
  if (purpose.includes("region") || purpose.includes("map")) return { key: "location", preferTabler: false };
  return { key: "photoCheck", preferTabler: false };
}

/** Lucide-only count for audit */
export function listUsedLucideIconNames(): string[] {
  const names = new Set<string>();
  for (const def of Object.values(ICON_MAP)) {
    names.add(def.lucide.displayName ?? def.lucide.name);
  }
  return [...names].sort();
}
