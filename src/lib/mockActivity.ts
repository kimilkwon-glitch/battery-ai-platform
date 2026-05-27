/**
 * Mock activity runtime — reads static mock-activity.json and merges with localStorage.
 * Generation lives in mockActivityGenerate.ts (script-only, includes vehicle DB).
 */
import mockActivityJson from "@/data/activity/mock-activity.json";
import type {
  MockActivityStore,
  MockEvent,
} from "@/lib/mockActivityGenerate";

export type {
  MockActivityStore,
  MockEvent,
  MockEventType,
  VehiclePick,
  DbVehicleRecord,
} from "@/lib/mockActivityGenerate";

type RecentSearch = {
  query: string;
  matchedVehicle?: string;
  matchedBattery?: string;
  createdAt: string;
};

type PopularVehicle = {
  vehicleId: string;
  displayName: string;
  reason: string;
  score: number;
};

type PopularBattery = {
  batteryId: string;
  displayName: string;
  reason: string;
  score: number;
};

type PhotoReviewVehicle = {
  vehicleId: string;
  displayName: string;
  reason: string;
  href: string;
};

type FailedSearch = {
  query: string;
  suggestion: string;
  createdAt: string;
};

type RecentUpdate = {
  title: string;
  type: "db_update" | "content_update" | "ui_update";
  createdAt: string;
};

export type PopularContent = {
  articleId: string;
  title: string;
  reason: string;
  score: number;
};

export type ActivitySummary = {
  recentSearches: RecentSearch[];
  popularVehicles: PopularVehicle[];
  popularBatteries: PopularBattery[];
  photoReviewVehicles: PhotoReviewVehicle[];
  popularContent: PopularContent[];
  failedSearches: FailedSearch[];
};

const mockStore = mockActivityJson as MockActivityStore;

const VEHICLE_REASONS: Record<string, string> = {
  "grandeur-ig": "연료별 AGM·DIN 확인 문의",
  "sorento-mq4": "하이브리드·MQ4 배터리 문의",
  "porter2-new": "2020년형 100R 확인",
  "porter2-old": "90R·연식 확인",
  "staria-us4": "LPG·디젤 AGM80R",
  "carnival-ka4": "대형 MPV 배터리",
  "k5-dl3": "ISG·AGM 확인",
  "sportage-nq5": "소형 SUV AGM",
  "g80-rg3": "제네시스 AGM95R",
  gv70: "단자 방향 확인",
  gv80: "사진 확인 권장",
  "bmw-g30": "BMS·AGM 수입차",
};

const BATTERY_REASONS: Record<string, string> = {
  AGM80L: "ISG 세단·SUV에서 자주 확인",
  AGM60L: "하이브리드·소형 SUV",
  AGM95R: "대형 SUV·제네시스",
  AGM95L: "대형 SUV 순정 규격",
  "100R": "포터2 2020년형 이후",
  "90R": "상용차·포터2 구형",
  AGM80R: "스타리아·R단자",
  DIN74L: "일반 DIN 교체 문의",
};

function vehicleReason(id: string, name: string): string {
  return VEHICLE_REASONS[id] ?? `${name} 최근 확인`;
}

function batteryReason(id: string): string {
  return BATTERY_REASONS[id] ?? "최근 확인이 많았던 규격";
}

function recencyWeight(iso: string): number {
  const ageMs = Date.now() - new Date(iso).getTime();
  const days = ageMs / 86400000;
  if (days < 1) return 3;
  if (days < 2) return 2.5;
  if (days < 4) return 2;
  if (days < 7) return 1.5;
  return 1;
}

export function getMockActivity(): MockActivityStore {
  return mockStore;
}

/** mock 이벤트 배열 → UI 요약 (score는 내부용, UI에 노출하지 않음) */
export function getActivitySummary(events: MockEvent[]): ActivitySummary {
  const searchMap = new Map<string, { score: number; latest: string; vehicle?: string; battery?: string }>();
  const vehicleMap = new Map<string, { name: string; score: number }>();
  const batteryMap = new Map<string, { score: number }>();
  const photoMap = new Map<string, { name: string; score: number }>();
  const contentMap = new Map<string, { title: string; score: number }>();
  const failedMap = new Map<string, { suggestion: string; latest: string }>();

  for (const e of events) {
    const w = recencyWeight(e.createdAt);
    if (e.type === "search" && e.query) {
      if (e.failed && e.suggestion) {
        const prev = failedMap.get(e.query);
        failedMap.set(e.query, {
          suggestion: e.suggestion,
          latest: !prev || e.createdAt > prev.latest ? e.createdAt : prev.latest,
        });
      } else {
        const prev = searchMap.get(e.query) ?? { score: 0, latest: e.createdAt };
        searchMap.set(e.query, {
          score: prev.score + w,
          latest: e.createdAt > prev.latest ? e.createdAt : prev.latest,
          vehicle: e.vehicleName ?? prev.vehicle,
          battery: e.batteryName ?? prev.battery,
        });
      }
    }
    if ((e.type === "vehicle_view" || e.type === "fuel_tab_click" || e.type === "year_chip_click") && e.vehicleId) {
      const prev = vehicleMap.get(e.vehicleId) ?? { name: e.vehicleName ?? e.vehicleId, score: 0 };
      vehicleMap.set(e.vehicleId, { name: prev.name || e.vehicleName || e.vehicleId, score: prev.score + w * (e.type === "vehicle_view" ? 2 : 1) });
    }
    if (e.type === "battery_view" && e.batteryId) {
      const prev = batteryMap.get(e.batteryId) ?? { score: 0 };
      batteryMap.set(e.batteryId, { score: prev.score + w * 2 });
    }
    if (e.type === "photo_check_click" && e.vehicleId) {
      const prev = photoMap.get(e.vehicleId) ?? { name: e.vehicleName ?? e.vehicleId, score: 0 };
      photoMap.set(e.vehicleId, { name: prev.name, score: prev.score + w * 2.5 });
    }
    if (e.type === "content_view" && e.contentId) {
      const prev = contentMap.get(e.contentId) ?? { title: e.contentTitle ?? e.contentId, score: 0 };
      contentMap.set(e.contentId, { title: prev.title || e.contentTitle || e.contentId, score: prev.score + w * 2 });
    }
  }

  const recentSearches = [...searchMap.entries()]
    .sort((a, b) => b[1].latest.localeCompare(a[1].latest) || b[1].score - a[1].score)
    .slice(0, 10)
    .map(([query, v]) => ({
      query,
      matchedVehicle: v.vehicle,
      matchedBattery: v.battery,
      createdAt: v.latest,
    }));

  const popularVehicles = [...vehicleMap.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 8)
    .map(([vehicleId, v]) => ({
      vehicleId,
      displayName: v.name,
      reason: vehicleReason(vehicleId, v.name),
      score: v.score,
    }));

  const popularBatteries = [...batteryMap.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 8)
    .map(([batteryId, v]) => ({
      batteryId,
      displayName: batteryId,
      reason: batteryReason(batteryId),
      score: v.score,
    }));

  const photoReviewVehicles = [...photoMap.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 6)
    .map(([vehicleId, v]) => ({
      vehicleId,
      displayName: v.name,
      reason: "사진으로 규격·단자 확인이 필요한 차량",
      href: vehicleId.startsWith("import-") || ["g80-rg3", "gv70", "gv80", "g90"].includes(vehicleId)
        ? `/search?q=${encodeURIComponent(v.name + " 배터리")}`
        : `/vehicle/${vehicleId}`,
    }));

  const popularContent = [...contentMap.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 5)
    .map(([articleId, v]) => ({
      articleId,
      title: v.title,
      reason: "최근 많이 본 가이드",
      score: v.score,
    }));

  const failedSearches = [...failedMap.entries()]
    .sort((a, b) => b[1].latest.localeCompare(a[1].latest))
    .slice(0, 8)
    .map(([query, v]) => ({
      query,
      suggestion: v.suggestion,
      createdAt: v.latest,
    }));

  return {
    recentSearches,
    popularVehicles,
    popularBatteries,
    photoReviewVehicles,
    popularContent,
    failedSearches,
  };
}

export type LocalActivityInput = {
  recentSearches: RecentSearch[];
  vehicleClicks: Record<string, number>;
  batteryClicks: Record<string, number>;
  contentViews?: Record<string, number>;
  photoClicks?: Record<string, number>;
  failedSearches: FailedSearch[];
};

const LOCAL_SEARCH_BOOST = 80;
const LOCAL_VEHICLE_BOOST = 40;
const LOCAL_BATTERY_BOOST = 40;
const LOCAL_CONTENT_BOOST = 30;
const LOCAL_PHOTO_BOOST = 35;

export function mergeMockAndLocalActivity(
  mockEvents: MockEvent[],
  local: LocalActivityInput,
  seed?: {
    popularVehicles?: PopularVehicle[];
    popularBatteries?: PopularBattery[];
    photoReviewVehicles?: PhotoReviewVehicle[];
    recentUpdates?: RecentUpdate[];
  },
): ActivitySummary & { recentUpdates: RecentUpdate[] } {
  const mockSummary = getActivitySummary(mockEvents);

  const localSearchCount = local.recentSearches.length;
  const hasLocal = localSearchCount > 0 || Object.keys(local.vehicleClicks).length > 0;

  const vehicleMap = new Map<string, PopularVehicle>();
  for (const v of [...mockSummary.popularVehicles, ...(seed?.popularVehicles ?? [])]) {
    const prev = vehicleMap.get(v.vehicleId);
    vehicleMap.set(v.vehicleId, {
      ...v,
      score: (prev?.score ?? 0) + v.score,
    });
  }
  for (const [id, count] of Object.entries(local.vehicleClicks)) {
    const prev = vehicleMap.get(id);
    vehicleMap.set(id, {
      vehicleId: id,
      displayName: prev?.displayName ?? id,
      reason: prev?.reason ?? vehicleReason(id, id),
      score: (prev?.score ?? 0) + count * LOCAL_VEHICLE_BOOST,
    });
  }

  const batteryMap = new Map<string, PopularBattery>();
  for (const b of [...mockSummary.popularBatteries, ...(seed?.popularBatteries ?? [])]) {
    const prev = batteryMap.get(b.batteryId);
    batteryMap.set(b.batteryId, { ...b, score: (prev?.score ?? 0) + b.score });
  }
  for (const [id, count] of Object.entries(local.batteryClicks)) {
    const prev = batteryMap.get(id);
    batteryMap.set(id, {
      batteryId: id,
      displayName: id,
      reason: prev?.reason ?? batteryReason(id),
      score: (prev?.score ?? 0) + count * LOCAL_BATTERY_BOOST,
    });
  }

  const contentMap = new Map<string, PopularContent>();
  for (const c of mockSummary.popularContent) {
    contentMap.set(c.articleId, { ...c });
  }
  for (const [id, count] of Object.entries(local.contentViews ?? {})) {
    const prev = contentMap.get(id);
    contentMap.set(id, {
      articleId: id,
      title: prev?.title ?? id,
      reason: prev?.reason ?? "최근 많이 본 가이드",
      score: (prev?.score ?? 0) + count * LOCAL_CONTENT_BOOST,
    });
  }

  const photoMap = new Map<string, PhotoReviewVehicle & { score: number }>();
  for (const p of [...mockSummary.photoReviewVehicles, ...(seed?.photoReviewVehicles ?? [])]) {
    photoMap.set(p.vehicleId, { ...p, score: (photoMap.get(p.vehicleId)?.score ?? 0) + 1 });
  }
  for (const [id, count] of Object.entries(local.photoClicks ?? {})) {
    const prev = photoMap.get(id);
    photoMap.set(id, {
      vehicleId: id,
      displayName: prev?.displayName ?? id,
      reason: prev?.reason ?? "사진 확인 권장",
      href: prev?.href ?? `/search?q=${encodeURIComponent(id)}`,
      score: (prev?.score ?? 0) + count * LOCAL_PHOTO_BOOST,
    });
  }

  const recentSearches = [...local.recentSearches, ...mockSummary.recentSearches]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter((s, i, arr) => arr.findIndex((x) => x.query === s.query) === i)
    .slice(0, 10);

  if (localSearchCount > 0) {
    for (let i = 0; i < local.recentSearches.length; i++) {
      const s = local.recentSearches[i];
      if (s.matchedVehicle) {
        const vid = s.matchedVehicle.toLowerCase().replace(/\s+/g, "-");
        const prev = vehicleMap.get(vid);
        if (prev) prev.score += LOCAL_SEARCH_BOOST;
      }
    }
  }

  const popularVehicles = [...vehicleMap.values()].sort((a, b) => b.score - a.score).slice(0, 8);
  const popularBatteries = [...batteryMap.values()].sort((a, b) => b.score - a.score).slice(0, 8);
  const popularContent = [...contentMap.values()].sort((a, b) => b.score - a.score).slice(0, 5);
  const photoReviewVehicles = [...photoMap.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ score: _s, ...rest }) => rest);

  const failedSearches = [...local.failedSearches, ...mockSummary.failedSearches]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter((s, i, arr) => arr.findIndex((x) => x.query === s.query) === i)
    .slice(0, 8);

  const mixRatio = hasLocal ? 1 : 0;
  void mixRatio;

  return {
    recentSearches,
    popularVehicles,
    popularBatteries,
    photoReviewVehicles,
    popularContent,
    failedSearches,
    recentUpdates: seed?.recentUpdates ?? [],
  };
}
