import siteActivitySeed from "@/data/activity/site-activity.json";
import {
  getMockActivity,
  mergeMockAndLocalActivity,
  type PopularContent,
} from "@/lib/mockActivity";
import { getVehicleAsset, vehicleAssetHref } from "@/lib/car-assets";
import { trends } from "@/lib/platform-data";

export type { PopularContent };

const STORAGE_KEY = "batteryai-activity-v1";
const MAX_RECENT = 12;
const MAX_FAILED = 8;

export type RecentSearch = {
  query: string;
  matchedVehicle?: string;
  matchedBattery?: string;
  createdAt: string;
};

export type PopularVehicle = {
  vehicleId: string;
  displayName: string;
  reason: string;
  score: number;
};

export type PopularBattery = {
  batteryId: string;
  displayName: string;
  reason: string;
  score: number;
};

export type RecentUpdate = {
  title: string;
  type: "db_update" | "content_update" | "ui_update";
  createdAt: string;
};

export type FailedSearch = {
  query: string;
  suggestion: string;
  createdAt: string;
};

export type PhotoReviewVehicle = {
  vehicleId: string;
  displayName: string;
  reason: string;
  href: string;
};

export type SiteActivity = {
  recentSearches: RecentSearch[];
  popularVehicles: PopularVehicle[];
  popularBatteries: PopularBattery[];
  recentUpdates: RecentUpdate[];
  failedSearches: FailedSearch[];
  photoReviewVehicles: PhotoReviewVehicle[];
};

type ActivityDelta = {
  recentSearches: RecentSearch[];
  vehicleClicks: Record<string, number>;
  batteryClicks: Record<string, number>;
  contentViews: Record<string, number>;
  photoClicks: Record<string, number>;
  failedSearches: FailedSearch[];
};

const seed = siteActivitySeed as SiteActivity;

function emptyDelta(): ActivityDelta {
  return {
    recentSearches: [],
    vehicleClicks: {},
    batteryClicks: {},
    contentViews: {},
    photoClicks: {},
    failedSearches: [],
  };
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readDelta(): ActivityDelta {
  if (!canUseStorage()) return emptyDelta();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDelta();
    const parsed = JSON.parse(raw) as Partial<ActivityDelta>;
    return {
      recentSearches: parsed.recentSearches ?? [],
      vehicleClicks: parsed.vehicleClicks ?? {},
      batteryClicks: parsed.batteryClicks ?? {},
      contentViews: parsed.contentViews ?? {},
      photoClicks: parsed.photoClicks ?? {},
      failedSearches: parsed.failedSearches ?? [],
    };
  } catch {
    return emptyDelta();
  }
}

function writeDelta(delta: ActivityDelta): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(delta));
  } catch {
    /* quota / private mode */
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function buildFullSummary(delta = readDelta()) {
  const mock = getMockActivity();
  return mergeMockAndLocalActivity(mock.events, delta, {
    popularVehicles: seed.popularVehicles,
    popularBatteries: seed.popularBatteries,
    photoReviewVehicles: seed.photoReviewVehicles,
    recentUpdates: seed.recentUpdates,
  });
}

function mergedActivity(): SiteActivity {
  const summary = buildFullSummary();
  return {
    recentSearches: summary.recentSearches,
    popularVehicles: summary.popularVehicles,
    popularBatteries: summary.popularBatteries,
    recentUpdates: summary.recentUpdates,
    failedSearches: summary.failedSearches,
    photoReviewVehicles: summary.photoReviewVehicles,
  };
}

/** SSR: mock JSON + site seed (localStorage 없음) */
function buildFullSummaryStatic() {
  const mock = getMockActivity();
  return mergeMockAndLocalActivity(
    mock.events,
    emptyDelta(),
    {
      popularVehicles: seed.popularVehicles,
      popularBatteries: seed.popularBatteries,
      photoReviewVehicles: seed.photoReviewVehicles,
      recentUpdates: seed.recentUpdates,
    },
  );
}

export function getRecentSearches(): RecentSearch[] {
  return mergedActivity().recentSearches;
}

export function getPopularVehicles(limit = 5): PopularVehicle[] {
  return mergedActivity().popularVehicles.slice(0, limit);
}

export function getPopularBatteries(limit = 5): PopularBattery[] {
  return mergedActivity().popularBatteries.slice(0, limit);
}

export function getRecentUpdates(limit = 5): RecentUpdate[] {
  return mergedActivity().recentUpdates.slice(0, limit);
}

export function getFailedSearches(limit = 5): FailedSearch[] {
  return mergedActivity().failedSearches.slice(0, limit);
}

export function getPhotoReviewVehicles(limit = 4): PhotoReviewVehicle[] {
  return mergedActivity().photoReviewVehicles.slice(0, limit);
}

export function getHomeActivitySummary() {
  const summary = buildFullSummary();
  return {
    popularVehicles: summary.popularVehicles.slice(0, 5),
    popularBatteries: summary.popularBatteries.slice(0, 5),
    recentUpdates: summary.recentUpdates.slice(0, 4),
    photoReviewVehicles: summary.photoReviewVehicles.slice(0, 4),
    recentSearches: summary.recentSearches.slice(0, 10),
    popularContent: summary.popularContent.slice(0, 5),
  };
}

/** SSR-safe: mock + seed, no localStorage */
export function getHomeActivitySummaryStatic() {
  const summary = buildFullSummaryStatic();
  return {
    popularVehicles: summary.popularVehicles.slice(0, 5),
    popularBatteries: summary.popularBatteries.slice(0, 5),
    recentUpdates: summary.recentUpdates.slice(0, 4),
    photoReviewVehicles: summary.photoReviewVehicles.slice(0, 4),
    recentSearches: summary.recentSearches.slice(0, 10),
    popularContent: summary.popularContent.slice(0, 5),
  };
}

export type SearchRecordResult = {
  matchedVehicle?: string;
  matchedBattery?: string;
  failed?: boolean;
  suggestion?: string;
};

export function recordSearch(query: string, result?: SearchRecordResult): void {
  if (!canUseStorage() || !query.trim()) return;
  const delta = readDelta();
  const entry: RecentSearch = {
    query: query.trim(),
    matchedVehicle: result?.matchedVehicle,
    matchedBattery: result?.matchedBattery,
    createdAt: nowIso(),
  };
  delta.recentSearches = [entry, ...delta.recentSearches.filter((s) => s.query !== entry.query)].slice(0, MAX_RECENT);

  if (result?.failed && result.suggestion) {
    delta.failedSearches = [
      { query: query.trim(), suggestion: result.suggestion, createdAt: nowIso() },
      ...delta.failedSearches,
    ].slice(0, MAX_FAILED);
  }

  writeDelta(delta);
}

export function recordVehicleClick(vehicleId: string): void {
  if (!canUseStorage() || !vehicleId) return;
  const delta = readDelta();
  delta.vehicleClicks[vehicleId] = (delta.vehicleClicks[vehicleId] ?? 0) + 1;
  writeDelta(delta);
}

export function recordBatteryClick(batteryId: string): void {
  if (!canUseStorage() || !batteryId) return;
  const delta = readDelta();
  delta.batteryClicks[batteryId] = (delta.batteryClicks[batteryId] ?? 0) + 1;
  writeDelta(delta);
}

export function recordContentView(articleId: string): void {
  if (!canUseStorage() || !articleId) return;
  const delta = readDelta();
  delta.contentViews[articleId] = (delta.contentViews[articleId] ?? 0) + 1;
  writeDelta(delta);
}

export function recordPhotoCheckClick(vehicleId: string): void {
  if (!canUseStorage() || !vehicleId) return;
  const delta = readDelta();
  delta.photoClicks[vehicleId] = (delta.photoClicks[vehicleId] ?? 0) + 1;
  writeDelta(delta);
}

export function clearLocalActivity(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export type TrendingListItem = {
  label: string;
  hint: string;
  reason: string;
  href: string;
};

function vehicleActivityHref(vehicleId: string): string {
  const asset = getVehicleAsset(vehicleId);
  if (asset) return vehicleAssetHref(asset);
  return `/vehicle/${vehicleId}`;
}

function batteryActivityHref(batteryId: string): string {
  return `/batteries/${encodeURIComponent(batteryId)}`;
}

function trendKindHint(kind: string): string {
  switch (kind) {
    case "vehicle":
      return "차종";
    case "battery":
      return "규격";
    case "caution":
      return "주의";
    case "season":
      return "계절";
    default:
      return "키워드";
  }
}

function buildTrendingSummary(activity: SiteActivity): {
  popularVehicles: TrendingListItem[];
  popularBatteries: TrendingListItem[];
  risingSpecs: TrendingListItem[];
  photoReview: TrendingListItem[];
  topics: TrendingListItem[];
  recentSearchTopics: TrendingListItem[];
} {
  const popularVehicles: TrendingListItem[] = activity.popularVehicles.slice(0, 8).map((v) => ({
    label: v.displayName,
    hint: "최근 확인",
    reason: v.reason,
    href: vehicleActivityHref(v.vehicleId),
  }));

  const popularBatteries: TrendingListItem[] = activity.popularBatteries.slice(0, 8).map((b) => ({
    label: b.displayName,
    hint: "자주 확인",
    reason: b.reason,
    href: batteryActivityHref(b.batteryId),
  }));

  const risingSpecs: TrendingListItem[] = activity.popularBatteries.slice(0, 6).map((b) => ({
    label: b.displayName,
    hint: "요즘 확인↑",
    reason: b.reason,
    href: batteryActivityHref(b.batteryId),
  }));

  const photoReview: TrendingListItem[] = activity.photoReviewVehicles.map((v) => ({
    label: v.displayName,
    hint: "사진 확인",
    reason: v.reason,
    href: v.href,
  }));

  const topics: TrendingListItem[] = trends.map((t) => ({
    label: t.label,
    hint: trendKindHint(t.kind),
    reason: t.reason,
    href: t.href,
  }));

  const recentSearchTopics: TrendingListItem[] = activity.recentSearches.slice(0, 6).map((s) => ({
    label: s.query,
    hint: s.matchedBattery ? "규격 확인" : "최근 검색",
    reason: s.matchedVehicle ? `${s.matchedVehicle} 관련` : "최근 많이 찾은 검색어",
    href: `/search?q=${encodeURIComponent(s.query)}`,
  }));

  return { popularVehicles, popularBatteries, risingSpecs, photoReview, topics, recentSearchTopics };
}

export function getTrendingPageSummary() {
  return buildTrendingSummary(mergedActivity());
}

export function getTrendingPageSummaryStatic() {
  return buildTrendingSummary(buildFullSummaryStatic());
}
