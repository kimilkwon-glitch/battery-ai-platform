#!/usr/bin/env npx tsx
/**
 * Unmatched vehicle assets — detailed review report (read-only).
 * Source: same criteria as audit-vehicle-db-integrity + vehicle-battery-db.json
 * Output: reports/unmatched-assets-review.json + .md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import vehicleBatteryDb from "../src/data/vehicle-battery-db.json";
import { VEHICLE_GENERATIONS_V04 } from "../src/data/vehicle-generation-v04.config";
import { VEHICLE_GENERATIONS_CHEVROLET } from "../src/data/vehicle-generation-chevrolet.config";
import {
  vehicleAssets,
  type VehicleAsset,
  vehicleAssetBrandLabel,
  type CarBrandKey,
} from "../src/lib/car-assets";
import {
  getRecordsForSlug,
  getVehicleCardBatteryInfo,
  getVehicleBatteryPageData,
  getVehicleDbProfile,
  hasConfirmedBatteryData,
  hasUsableBatteryData,
  type VehicleBatteryRecord,
} from "../src/lib/vehicleBattery";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const AUDIT_JSON = path.join(ROOT, "reports", "vehicle-db-integrity-audit.json");
const OUT_JSON = path.join(ROOT, "reports", "unmatched-assets-review.json");
const OUT_MD = path.join(ROOT, "reports", "unmatched-assets-review.md");

/** 2026-06-03 A그룹 38건 기준선 — 연결 성공 집계용 */
const BASELINE_A_GROUP_ASSET_IDS = [
  "carnival-vq",
  "morning-sa",
  "niro-de",
  "ray-tam-2fl",
  "niro-de-fl",
  "morning-ja-fl",
  "carnival-yp-fl",
  "carnival-ka4-fl",
  "k8-gl3-fl",
  "niro-sg2",
  "ray-tam",
  "morning-ja",
  "kia-mohave-2008",
  "bongo3-ev",
  "sportage-nq5",
  "kia-soul-2008",
  "morning-ta",
  "carnival-yp",
  "kia-all-new-carens-2013",
  "k8-gl3",
  "chevrolet-the-new-cruze-2015",
  "daewoo-lacetti-premiere-2008",
  "chevrolet-all-new-cruze-2017",
  "chevrolet-cruze-2011",
  "hyundai-grand-starex-2007",
  "santafe-mx5",
  "kona-sx2",
  "santafe-mx5-hev",
  "santafe-cm",
  "santafe-dm",
  "avante-ad",
  "avante-hd",
  "avante-md",
  "tucson-tl",
  "kona-os",
  "tucson-lm",
  "sonata-lf",
  "sonata-yf",
] as const;

const DB_RECORDS = (vehicleBatteryDb as { records: VehicleBatteryRecord[] }).records;

const DOMESTIC_BRANDS = new Set<CarBrandKey>([
  "hyundai",
  "kia",
  "genesis",
  "renault",
  "ssangyong",
  "kg",
  "chevrolet-gmdaewoo",
]);

const BRAND_BUCKET: Record<CarBrandKey, string> = {
  hyundai: "현대",
  kia: "기아",
  genesis: "제네시스",
  renault: "르노",
  ssangyong: "KG·쌍용",
  kg: "KG·쌍용",
  "chevrolet-gmdaewoo": "쉐보레",
};

const ASSET_BRAND_TO_DB: Record<CarBrandKey, string[]> = {
  hyundai: ["현대"],
  kia: ["기아"],
  genesis: ["제네시스"],
  renault: ["르노코리아", "르노삼성", "르노"],
  ssangyong: ["쌍용", "KG", "KGM", "KG모빌리티"],
  kg: ["KG", "KGM", "쌍용", "KG모빌리티"],
  "chevrolet-gmdaewoo": ["쉐보레", "GM대우", "GM", "대우"],
};

const SEARCH_ALIAS_BY_ID = new Map<string, string[]>();
for (const g of [...VEHICLE_GENERATIONS_V04, ...VEHICLE_GENERATIONS_CHEVROLET]) {
  SEARCH_ALIAS_BY_ID.set(g.id, g.searchAliases ?? []);
}

type DbCandidate = {
  id: string;
  brand: string;
  model: string;
  displayName: string;
  years: string | null;
  startYear: number | null;
  endYear: number | null;
  fuel: string | null;
  primaryBattery: string;
  batteryOptions: string[];
  status: string;
  confidence: string;
  aliases: string[];
  matchReason: string;
  matchScore: number;
};

type ReviewItem = {
  index: number;
  group: "A" | "B" | "C";
  assetId: string;
  catalogId: string;
  displayName: string;
  brand: CarBrandKey;
  brandLabel: string;
  brandBucket: string;
  market: "domestic" | "import";
  modelGroup: string;
  generationName?: string;
  yearRange?: string;
  yearStart: number | null;
  yearEnd: number | null;
  imageFile: string;
  imagePath: string;
  dbModels?: string[];
  searchAliases: string[];
  aliases: string[];
  batteryMatchStatus?: string;
  defaultBatteryCode?: string;
  currentBatteryNotes?: string;
  recommendExcluded: boolean;
  dbModelNameCandidateCount: number;
  dbDisplayNameCandidateCount: number;
  dbAliasCandidateCount: number;
  slugLinkedRecordCount: number;
  slugLinkedConfirmedCount: number;
  slugLinkedUsableCount: number;
  dbLinkTier: string;
  isBatteryLinked: boolean;
  topDbCandidates: DbCandidate[];
  unmatchedCause: string;
  recommendedAction: string;
  reviewPriority: "HIGH" | "MID" | "LOW";
  auditClassification?: string;
  auditReason?: string;
};

function norm(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().replace(/\s+/g, "").replace(/[()~·\-/]/g, "");
}

function parseYearRange(yearRange?: string): { yearStart: number | null; yearEnd: number | null } {
  if (!yearRange?.trim()) return { yearStart: null, yearEnd: null };
  const m = yearRange.match(/(\d{4})\s*[-~]\s*(\d{4}|현재|이후)/);
  if (!m) return { yearStart: null, yearEnd: null };
  const yearStart = parseInt(m[1], 10);
  const yearEnd = m[2] === "현재" || m[2] === "이후" ? null : parseInt(m[2], 10);
  return { yearStart, yearEnd };
}

function brandMatchesRecord(assetBrand: CarBrandKey, recordBrand: string): boolean {
  const allowed = ASSET_BRAND_TO_DB[assetBrand] ?? [];
  const rb = norm(recordBrand);
  return allowed.some((b) => rb.includes(norm(b)) || norm(b).includes(rb));
}

function yearsOverlap(
  assetStart: number | null,
  assetEnd: number | null,
  r: VehicleBatteryRecord,
): boolean {
  if (assetStart == null) return true;
  const rs = r.startYear ?? null;
  const re = r.endYear ?? null;
  const aEnd = assetEnd ?? 9999;
  const rEnd = re ?? 9999;
  const aStart = assetStart;
  const rStart = rs ?? 0;
  if (rStart > aEnd) return false;
  if (re != null && re < aStart) return false;
  if (rs != null && rs > aEnd) return false;
  return true;
}

function scoreRecord(
  r: VehicleBatteryRecord,
  asset: VehicleAsset,
  matchReason: string,
  base: number,
): number {
  let score = base;
  if (brandMatchesRecord(asset.brand, r.brand)) score += 25;
  else score -= 15;
  const models = asset.dbModels ?? [];
  if (models.some((m) => norm(r.model) === norm(m) || norm(r.displayName).includes(norm(m)))) score += 30;
  if (norm(r.displayName).includes(norm(asset.displayName))) score += 20;
  if (asset.aliases.some((a) => norm(r.displayName).includes(norm(a)) || r.aliases.some((ra) => norm(ra).includes(norm(a)))))
    score += 10;
  if (yearsOverlap(asset.yearStart ?? parseYearRange(asset.yearRange).yearStart, parseYearRange(asset.yearRange).yearEnd, r))
    score += 15;
  else score -= 20;
  if (hasConfirmedBatteryData(r)) score += 20;
  if (r.status === "needs_review" || r.confidence === "low") score -= 8;
  if (matchReason.includes("model")) score += 5;
  return score;
}

function isAssetBatteryLinked(a: VehicleAsset): boolean {
  const slug = a.catalogId ?? a.id;
  const db = getVehicleCardBatteryInfo(slug);
  const page = getVehicleBatteryPageData(slug);
  if (a.defaultBatteryCode) return true;
  if (db.hasConfirmedDb && Boolean(db.displayCode)) return true;
  return db.hasUsableDb && page.hasData;
}

function collectUnmatchedAssets(): VehicleAsset[] {
  return vehicleAssets.filter((a) => !isAssetBatteryLinked(a));
}

function searchByModels(asset: VehicleAsset): VehicleBatteryRecord[] {
  const models = asset.dbModels ?? [];
  if (!models.length) return [];
  return DB_RECORDS.filter((r) => {
    if (!brandMatchesRecord(asset.brand, r.brand)) return false;
    return models.some(
      (m) =>
        norm(r.model) === norm(m) ||
        norm(r.model).includes(norm(m)) ||
        norm(r.displayName).includes(norm(m)),
    );
  });
}

function searchByDisplayName(asset: VehicleAsset): VehicleBatteryRecord[] {
  const q = norm(asset.displayName);
  const brand = norm(vehicleAssetBrandLabel(asset.brand));
  return DB_RECORDS.filter((r) => {
    if (!brandMatchesRecord(asset.brand, r.brand)) return false;
    const hay = norm(`${r.displayName} ${r.model}`);
    return hay.includes(q) || q.includes(hay) || hay.includes(brand + q.replace(brand, ""));
  });
}

function searchByAliases(asset: VehicleAsset): VehicleBatteryRecord[] {
  const terms = [...asset.aliases, ...getSearchAliases(asset)];
  return DB_RECORDS.filter((r) => {
    if (!brandMatchesRecord(asset.brand, r.brand)) return false;
    const hay = norm(`${r.displayName} ${r.model} ${r.aliases.join(" ")}`);
    return terms.some((t) => {
      const nt = norm(t);
      return nt.length >= 2 && (hay.includes(nt) || norm(r.model).includes(nt));
    });
  });
}

function getSearchAliases(asset: VehicleAsset): string[] {
  const fromConfig = SEARCH_ALIAS_BY_ID.get(asset.id) ?? [];
  const aliasOnly = asset.aliases.filter((a) => a !== asset.displayName);
  return [...new Set([...fromConfig, ...aliasOnly])];
}

function toCandidate(r: VehicleBatteryRecord, asset: VehicleAsset, matchReason: string, base: number): DbCandidate {
  return {
    id: r.id,
    brand: r.brand,
    model: r.model,
    displayName: r.displayName,
    years: r.years,
    startYear: r.startYear,
    endYear: r.endYear,
    fuel: r.fuel,
    primaryBattery: r.primaryBattery,
    batteryOptions: r.batteryOptions ?? [],
    status: r.status,
    confidence: r.confidence,
    aliases: r.aliases ?? [],
    matchReason,
    matchScore: scoreRecord(r, asset, matchReason, base),
  };
}

function topCandidates(asset: VehicleAsset): {
  modelCount: number;
  displayCount: number;
  aliasCount: number;
  top: DbCandidate[];
} {
  const byId = new Map<string, DbCandidate>();
  const add = (recs: VehicleBatteryRecord[], reason: string, base: number) => {
    for (const r of recs) {
      const prev = byId.get(r.id);
      const cand = toCandidate(r, asset, reason, base);
      if (!prev || cand.matchScore > prev.matchScore) byId.set(r.id, cand);
    }
  };
  const modelRecs = searchByModels(asset);
  const displayRecs = searchByDisplayName(asset);
  const aliasRecs = searchByAliases(asset);
  add(modelRecs, "dbModels.model/displayName", 40);
  add(displayRecs, "displayName.similarity", 30);
  add(aliasRecs, "aliases.similarity", 25);
  const top = [...byId.values()].sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  return {
    modelCount: modelRecs.length,
    displayCount: displayRecs.length,
    aliasCount: aliasRecs.length,
    top,
  };
}

/** C그룹 재검토 — 원본 차종표/DB 후보가 있으면 A로 승격 */
const C_GROUP_RECONNECT_MODELS =
  /봉고\s*3|봉고3|젠트라\s*x|젠트라x|토스카|쏘나타\s*nf|nf\s*쏘나타|투싼\s*jm|jm\s*투싼|뉴\s*체어맨|체어맨|렉스턴|무쏘\s*스포츠|액티언\s*스포츠|액티언|카이런/i;

function classifyGroup(
  asset: VehicleAsset,
  slug: string,
  slugRecs: VehicleBatteryRecord[],
  candidateTop: DbCandidate[],
): "A" | "B" | "C" {
  const profile = getVehicleDbProfile(slug);
  const slugUsable = slugRecs.some((r) => hasUsableBatteryData(r, profile));
  const slugConfirmed = slugRecs.some(hasConfirmedBatteryData);
  const hasDbCandidates =
    candidateTop.length > 0 ||
    candidateTop.some((c) => Boolean(c.primaryBattery?.trim())) ||
    slugUsable ||
    slugConfirmed;

  const labelHay = `${asset.displayName} ${asset.id} ${(asset.dbModels ?? []).join(" ")}`;
  const forceReconnect = C_GROUP_RECONNECT_MODELS.test(labelHay) && hasDbCandidates;

  const { yearStart } = parseYearRange(asset.yearRange);
  const ys = asset.yearStart ?? yearStart;
  const legacyExposureOnly = asset.recommendExcluded || (ys != null && ys < 2005);

  if (hasDbCandidates || forceReconnect) return "A";
  if (legacyExposureOnly) return "C";
  const candidateConfirmed = candidateTop.some((c) => c.status === "confirmed" && Boolean(c.primaryBattery?.trim()));
  if (candidateConfirmed) return "A";
  return "B";
}

function estimateCause(
  asset: VehicleAsset,
  slug: string,
  slugRecs: VehicleBatteryRecord[],
  card: ReturnType<typeof getVehicleCardBatteryInfo>,
  candidates: ReturnType<typeof topCandidates>,
  profile: ReturnType<typeof getVehicleDbProfile>,
): string {
  const parts: string[] = [];
  if (asset.recommendExcluded) parts.push("recommendExcluded=true — 기본 추천·노출 후보 제외");
  const ys = asset.yearStart ?? parseYearRange(asset.yearRange).yearStart;
  if (ys != null && ys < 2005) parts.push("연식 2005년 미만 — 레거시 노출 제외 후보");
  if (!asset.image?.trim()) parts.push("차량 이미지 경로 없음");
  if (asset.batteryMatchStatus === "needsReview")
    parts.push("batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외");
  if (asset.defaultBatteryCode) parts.push("defaultBatteryCode 있으나 카드 확정 실패(비정상)");
  if (slugRecs.length === 0 && candidates.modelCount > 0)
    parts.push("dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — catalogId/slug·세대토큰·연식 필터 불일치");
  if (slugRecs.length > 0 && !card.hasConfirmedDb)
    parts.push("slug 연결 레코드는 있으나 confirmed primaryBattery 없음 — needs_review/low confidence");
  if (profile && profile.generationTokens.length > 0 && slugRecs.length === 0 && candidates.top.length > 0)
    parts.push(`세대 토큰(${profile.generationTokens.join(",")}) 매칭 실패로 레코드 필터링`);
  const models = asset.dbModels ?? [];
  if (models.length && candidates.modelCount > 8)
    parts.push(`dbModels(${models.join("/")})가 넓어 동명 세대·연식 혼선 가능`);
  if (candidates.modelCount === 0 && candidates.displayCount === 0 && candidates.aliasCount === 0)
    parts.push("vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류");
  if (parts.length === 0) parts.push("확정 배터리·defaultBatteryCode 모두 없음 — 운영 분류상 상담 확인 노출");
  return parts.join("; ");
}

function recommendAction(asset: VehicleAsset, group: "A" | "B" | "C", cause: string): string {
  if (group === "C") return "노출 제외·검색 후순위 유지; DB 연결보다 카탈로그 정리 우선";
  if (/getRecordsForSlug.*0건|세대 토큰|slug·세대/i.test(cause))
    return "vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels 세대별 분리";
  if (/dbModels.*넓/i.test(cause)) return "dbModels를 세대·플랫폼코드 단위로 좁히기; yearStart/yearEnd 명시";
  if (/needsReview/i.test(cause)) return "DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만";
  if (/실제 미등록/i.test(cause)) return "vehicle-battery-db 신규 레코드 검토 또는 상담 확인 유지(임의 defaultBatteryCode 금지)";
  if (group === "A") return "slug/getRecordsForSlug 연결 수정 — DB 데이터는 이미 있을 가능성 높음";
  return "상담 확인 유지 + DB·alias 조사; 국산 주요차종이면 수동 매칭 검토";
}

function reviewPriority(
  asset: VehicleAsset,
  group: "A" | "B" | "C",
  candidates: ReturnType<typeof topCandidates>,
  slugRecs: VehicleBatteryRecord[],
): "HIGH" | "MID" | "LOW" {
  if (group === "C") return "LOW";
  const domestic = DOMESTIC_BRANDS.has(asset.brand);
  const hasImage = Boolean(asset.image?.trim());
  const hasCandidates =
    candidates.top.length > 0 ||
    candidates.modelCount > 0 ||
    slugRecs.length > 0;
  const majorDomestic =
    domestic &&
    hasImage &&
    hasCandidates &&
    !asset.recommendExcluded &&
    (asset.yearStart ?? parseYearRange(asset.yearRange).yearStart ?? 9999) >= 2005;
  if (majorDomestic && (group === "A" || candidates.top.some((c) => c.matchScore >= 55))) return "HIGH";
  if (domestic && hasImage) return "MID";
  if (!domestic) return "LOW";
  return "MID";
}

function buildItem(index: number, asset: VehicleAsset, auditMap: Map<string, { class: string; reason: string }>): ReviewItem {
  const slug = asset.catalogId ?? asset.id;
  const { yearStart, yearEnd } = parseYearRange(asset.yearRange);
  const ys = asset.yearStart ?? yearStart;
  const ye = yearEnd;
  const slugRecs = getRecordsForSlug(slug);
  const card = getVehicleCardBatteryInfo(slug);
  const profile = getVehicleDbProfile(slug);
  const candidates = topCandidates(asset);
  const group = classifyGroup(asset, slug, slugRecs, candidates.top);
  const unmatchedCause = estimateCause(asset, slug, slugRecs, card, candidates, profile);
  const recommendedAction = recommendAction(asset, group, unmatchedCause);
  const priority = reviewPriority(asset, group, candidates, slugRecs);
  const audit = auditMap.get(asset.id);

  return {
    index,
    group,
    assetId: asset.id,
    catalogId: slug,
    displayName: asset.displayName,
    brand: asset.brand,
    brandLabel: vehicleAssetBrandLabel(asset.brand),
    brandBucket: BRAND_BUCKET[asset.brand] ?? asset.brand,
    market: DOMESTIC_BRANDS.has(asset.brand) ? "domestic" : "import",
    modelGroup: asset.modelGroup,
    generationName: asset.generationName,
    yearRange: asset.yearRange,
    yearStart: ys,
    yearEnd: ye,
    imageFile: asset.imageFile,
    imagePath: asset.image,
    dbModels: asset.dbModels,
    searchAliases: getSearchAliases(asset),
    aliases: asset.aliases,
    batteryMatchStatus: asset.batteryMatchStatus,
    defaultBatteryCode: asset.defaultBatteryCode,
    currentBatteryNotes: asset.batteryNotes,
    recommendExcluded: Boolean(asset.recommendExcluded),
    dbModelNameCandidateCount: candidates.modelCount,
    dbDisplayNameCandidateCount: candidates.displayCount,
    dbAliasCandidateCount: candidates.aliasCount,
    slugLinkedRecordCount: slugRecs.length,
    slugLinkedConfirmedCount: slugRecs.filter(hasConfirmedBatteryData).length,
    slugLinkedUsableCount: slugRecs.filter((r) => hasUsableBatteryData(r, profile)).length,
    dbLinkTier: card.dbLinkTier,
    isBatteryLinked: isAssetBatteryLinked(asset),
    topDbCandidates: candidates.top,
    unmatchedCause,
    recommendedAction,
    reviewPriority: priority,
    auditClassification: audit?.class,
    auditReason: audit?.reason,
  };
}

function mdEscape(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function formatCandidatesShort(cands: DbCandidate[]): string {
  if (!cands.length) return "—";
  return cands
    .slice(0, 2)
    .map((c) => `${c.displayName}(${c.primaryBattery || "—"}, score ${c.matchScore})`)
    .join("; ");
}

function generateMd(items: ReviewItem[], meta: Record<string, unknown>): string {
  const lines: string[] = [];
  lines.push("# Unmatched Assets Review", "");
  lines.push(`생성: ${meta.generatedAt}`, "");
  lines.push(`기준: \`reports/vehicle-db-integrity-audit.json\` + 런타임 unmatched 판정(확정 DB·defaultBatteryCode 없음)`, "");
  lines.push("");

  lines.push("## 1. 요약");
  const ba = meta.beforeAfter as
    | { unmatched?: { before: number; after: number }; aGroup?: { before: number; after: number } }
    | undefined;
  if (ba?.unmatched) {
    lines.push(
      `unmatched **${ba.unmatched.before} → ${ba.unmatched.after}** · A그룹 **${ba.aGroup?.before ?? "—"} → ${ba.aGroup?.after ?? "—"}**`,
    );
    lines.push("");
  }
  lines.push("| 항목 | 건수 |");
  lines.push("|------|------|");
  const s = meta.summary as Record<string, number>;
  for (const [k, v] of Object.entries(s)) {
    lines.push(`| ${k} | ${v} |`);
  }
  lines.push("");
  const conn = meta.connectionStats as
    | { aGroupResolvedCount?: number; aGroupDeferred?: { assetId: string; displayName: string; reason: string }[] }
    | undefined;
  if (conn?.aGroupResolvedCount != null) {
    lines.push(`### A그룹 연결 성공: ${conn.aGroupResolvedCount}건`);
    if (conn.aGroupDeferred?.length) {
      lines.push("### A그룹 보류");
      for (const d of conn.aGroupDeferred) {
        lines.push(`- **${d.displayName}** (\`${d.assetId}\`): ${d.reason.slice(0, 160)}`);
      }
    }
    lines.push("");
  }

  lines.push("## 2. 브랜드별 요약");
  lines.push("| 브랜드 | 건수 | HIGH | MID | LOW |");
  lines.push("|--------|------|------|-----|-----|");
  const brandRows = meta.brandSummary as { brand: string; count: number; high: number; mid: number; low: number }[];
  for (const b of brandRows) {
    lines.push(`| ${b.brand} | ${b.count} | ${b.high} | ${b.mid} | ${b.low} |`);
  }
  lines.push("");

  lines.push("## 3. HIGH 우선 검토 대상");
  lines.push("| assetId | displayName | brand | yearRange | dbModels | 가까운 DB 후보 | unmatched 원인 | 추천 조치 |");
  lines.push("|---------|-------------|-------|-----------|----------|----------------|----------------|-----------|");
  const high = items.filter((i) => i.reviewPriority === "HIGH");
  for (const i of high) {
    lines.push(
      `| ${i.assetId} | ${mdEscape(i.displayName)} | ${i.brandLabel} | ${i.yearRange ?? "—"} | ${mdEscape((i.dbModels ?? []).join(", "))} | ${mdEscape(formatCandidatesShort(i.topDbCandidates))} | ${mdEscape(i.unmatchedCause)} | ${mdEscape(i.recommendedAction)} |`,
    );
  }
  lines.push("");

  lines.push("## 4. 전체 리스트");
  lines.push("| 번호 | group | priority | assetId | catalogId | displayName | brand | yearRange | defaultBatteryCode | dbModels | 가까운 DB 후보 수 | 원인 | 추천 조치 |");
  lines.push("|------|-------|----------|---------|-----------|-------------|-------|-----------|-------------------|----------|------------------|------|-----------|");
  for (const i of items) {
    const candN = i.topDbCandidates.length;
    lines.push(
      `| ${i.index} | ${i.group} | ${i.reviewPriority} | ${i.assetId} | ${i.catalogId} | ${mdEscape(i.displayName)} | ${i.brandBucket} | ${i.yearRange ?? "—"} | ${i.defaultBatteryCode ?? "—"} | ${mdEscape((i.dbModels ?? []).join(", "))} | ${candN} | ${mdEscape(i.unmatchedCause.slice(0, 120))}${i.unmatchedCause.length > 120 ? "…" : ""} | ${mdEscape(i.recommendedAction.slice(0, 80))}${i.recommendedAction.length > 80 ? "…" : ""} |`,
    );
  }
  lines.push("");

  lines.push("## 5. DB 후보가 있는 unmatched");
  lines.push("vehicle-battery-db에서 model/displayName/alias 검색 또는 slug 연결로 후보가 1건 이상인데도 카드 확정이 없는 차량.");
  lines.push("");
  const withCand = items.filter(
    (i) =>
      i.dbModelNameCandidateCount > 0 ||
      i.dbDisplayNameCandidateCount > 0 ||
      i.dbAliasCandidateCount > 0 ||
      i.slugLinkedRecordCount > 0,
  );
  lines.push(`총 **${withCand.length}**건`, "");
  lines.push("| assetId | displayName | 후보(model/display/alias/slug) | top DB | group | priority |");
  lines.push("|---------|-------------|--------------------------------|--------|-------|----------|");
  for (const i of withCand) {
    lines.push(
      `| ${i.assetId} | ${mdEscape(i.displayName)} | ${i.dbModelNameCandidateCount}/${i.dbDisplayNameCandidateCount}/${i.dbAliasCandidateCount}/${i.slugLinkedRecordCount} | ${mdEscape(formatCandidatesShort(i.topDbCandidates))} | ${i.group} | ${i.reviewPriority} |`,
    );
  }
  lines.push("");

  lines.push("## 6. 진짜 DB 후보가 없는 unmatched");
  const noCand = items.filter(
    (i) =>
      i.dbModelNameCandidateCount === 0 &&
      i.dbDisplayNameCandidateCount === 0 &&
      i.dbAliasCandidateCount === 0 &&
      i.slugLinkedRecordCount === 0,
  );
  lines.push(`총 **${noCand.length}**건`, "");
  lines.push("| assetId | displayName | brand | yearRange | 원인 |");
  lines.push("|---------|-------------|-------|-----------|------|");
  for (const i of noCand) {
    lines.push(
      `| ${i.assetId} | ${mdEscape(i.displayName)} | ${i.brandLabel} | ${i.yearRange ?? "—"} | ${mdEscape(i.unmatchedCause)} |`,
    );
  }
  lines.push("");

  lines.push("## 7. 노출 제외 후보");
  const exclude = items.filter(
    (i) =>
      i.group === "C" ||
      i.recommendExcluded ||
      (i.yearStart != null && i.yearStart < 2005) ||
      i.market === "import",
  );
  lines.push(`총 **${exclude.length}**건`, "");
  lines.push("| assetId | displayName | yearRange | recommendExcluded | group | 원인 |");
  lines.push("|---------|-------------|-----------|-------------------|-------|------|");
  for (const i of exclude) {
    lines.push(
      `| ${i.assetId} | ${mdEscape(i.displayName)} | ${i.yearRange ?? "—"} | ${i.recommendExcluded ? "Y" : "N"} | ${i.group} | ${mdEscape(i.unmatchedCause)} |`,
    );
  }
  lines.push("");

  lines.push("## 부록: 국산차 / 수입차 분리");
  lines.push("### 국산차");
  for (const i of items.filter((x) => x.market === "domestic")) {
    lines.push(`- [${i.index}] **${i.displayName}** (${i.assetId}) — ${i.group}/${i.reviewPriority}`);
  }
  lines.push("");
  lines.push("### 수입차");
  const imp = items.filter((x) => x.market === "import");
  if (!imp.length) lines.push("- (이번 unmatched 목록에 수입차 asset 없음)");
  else for (const i of imp) lines.push(`- [${i.index}] **${i.displayName}** (${i.assetId})`);

  return lines.join("\n");
}

function main() {
  const prior = fs.existsSync(OUT_JSON)
    ? (JSON.parse(fs.readFileSync(OUT_JSON, "utf8")) as {
        summary?: Record<string, number>;
        items?: ReviewItem[];
      })
    : null;

  const audit = fs.existsSync(AUDIT_JSON)
    ? (JSON.parse(fs.readFileSync(AUDIT_JSON, "utf8")) as {
        unmatchedClassifications?: { assetId: string; class: string; reason: string }[];
        summary?: Record<string, unknown>;
      })
    : { unmatchedClassifications: [] };

  const auditMap = new Map(
    (audit.unmatchedClassifications ?? []).map((u) => [u.assetId, { class: u.class, reason: u.reason }]),
  );

  const priorAGroupIds = new Set(
    (prior?.items ?? []).filter((i) => i.group === "A").map((i) => i.assetId),
  );
  const beforeCounts = {
    unmatched: 120,
    aGroup: 38,
    bGroup: 71,
    cGroup: 11,
  };

  const unmatched = collectUnmatchedAssets();
  unmatched.sort((a, b) => {
    const ba = BRAND_BUCKET[a.brand] ?? a.brand;
    const bb = BRAND_BUCKET[b.brand] ?? b.brand;
    if (ba !== bb) return ba.localeCompare(bb, "ko");
    return a.displayName.localeCompare(b.displayName, "ko");
  });

  const items = unmatched.map((a, i) => buildItem(i + 1, a, auditMap));

  const groupCounts = { A: 0, B: 0, C: 0 };
  const priorityCounts = { HIGH: 0, MID: 0, LOW: 0 };
  const marketCounts = { domestic: 0, import: 0 };
  for (const it of items) {
    groupCounts[it.group]++;
    priorityCounts[it.reviewPriority]++;
    marketCounts[it.market]++;
  }

  const withDbCandidates = items.filter(
    (i) =>
      i.dbModelNameCandidateCount > 0 ||
      i.dbDisplayNameCandidateCount > 0 ||
      i.dbAliasCandidateCount > 0 ||
      i.slugLinkedRecordCount > 0,
  ).length;

  const noDbCandidates = items.filter(
    (i) =>
      i.dbModelNameCandidateCount === 0 &&
      i.dbDisplayNameCandidateCount === 0 &&
      i.dbAliasCandidateCount === 0 &&
      i.slugLinkedRecordCount === 0,
  ).length;

  const brandSummaryMap = new Map<string, { count: number; high: number; mid: number; low: number }>();
  for (const it of items) {
    const b = it.brandBucket;
    const row = brandSummaryMap.get(b) ?? { count: 0, high: 0, mid: 0, low: 0 };
    row.count++;
    if (it.reviewPriority === "HIGH") row.high++;
    else if (it.reviewPriority === "MID") row.mid++;
    else row.low++;
    brandSummaryMap.set(b, row);
  }

  const brandSummary = [...brandSummaryMap.entries()]
    .map(([brand, v]) => ({ brand, ...v }))
    .sort((a, b) => b.count - a.count);

  const baselineA = new Set(BASELINE_A_GROUP_ASSET_IDS);
  const aGroupResolved = BASELINE_A_GROUP_ASSET_IDS.filter((id) => {
    const asset = vehicleAssets.find((a) => a.id === id);
    return asset && isAssetBatteryLinked(asset);
  });
  const aGroupStillOpen = items.filter((i) => i.group === "A" && baselineA.has(i.assetId as (typeof BASELINE_A_GROUP_ASSET_IDS)[number]));
  const aGroupDeferred = aGroupStillOpen.map((i) => ({
    assetId: i.assetId,
    displayName: i.displayName,
    reason: i.unmatchedCause,
  }));

  const generatedAt = new Date().toISOString();
  const auditSummary = {
    ...(typeof audit.summary === "object" && audit.summary ? audit.summary : {}),
    unmatchedAssets: items.length,
    unmatchedA: groupCounts.A,
    unmatchedB: groupCounts.B,
    unmatchedC: groupCounts.C,
    highPriority: priorityCounts.HIGH,
    midPriority: priorityCounts.MID,
    lowPriority: priorityCounts.LOW,
  };

  const payload = {
    generatedAt,
    sourceAudit: "reports/vehicle-db-integrity-audit.json",
    note:
      "unmatched = defaultBatteryCode·confirmed·usable DB 연결 없음. usable=raw/medium+연식·브랜드·모델 일치.",
    auditSummary,
    beforeAfter: {
      unmatched: { before: beforeCounts.unmatched, after: items.length },
      aGroup: { before: beforeCounts.aGroup, after: groupCounts.A },
      bGroup: { before: beforeCounts.bGroup, after: groupCounts.B },
      cGroup: { before: beforeCounts.cGroup, after: groupCounts.C },
    },
    connectionStats: {
      aGroupPriorCount: BASELINE_A_GROUP_ASSET_IDS.length,
      aGroupResolvedCount: aGroupResolved.length,
      aGroupDeferredCount: aGroupDeferred.length,
      aGroupResolvedAssetIds: aGroupResolved,
      aGroupDeferred,
    },
    summary: {
      "전체 unmatched": items.length,
      "A: DB 연결 가능 의심": groupCounts.A,
      "B: 실제 미확정 의심": groupCounts.B,
      "C: 노출 제외 후보": groupCounts.C,
      국산차: marketCounts.domestic,
      수입차: marketCounts.import,
      "HIGH 우선순위": priorityCounts.HIGH,
      "MID 우선순위": priorityCounts.MID,
      "LOW 우선순위": priorityCounts.LOW,
      "DB 후보 있으나 unmatched": withDbCandidates,
      "DB 후보 0건": noDbCandidates,
      "A그룹 연결 성공(이전 대비)": aGroupResolved.length,
      "A그룹 보류": aGroupDeferred.length,
    },
    brandSummary,
    highPriorityTop30: items
      .filter((i) => i.reviewPriority === "HIGH")
      .slice(0, 30)
      .map((i) => ({
        assetId: i.assetId,
        displayName: i.displayName,
        brand: i.brandLabel,
        yearRange: i.yearRange,
        dbModels: i.dbModels,
        topDbCandidates: i.topDbCandidates,
        unmatchedCause: i.unmatchedCause,
        recommendedAction: i.recommendedAction,
      })),
    items,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), "utf8");
  fs.writeFileSync(
    OUT_MD,
    generateMd(items, {
      generatedAt,
      summary: payload.summary,
      brandSummary,
      beforeAfter: payload.beforeAfter,
      connectionStats: payload.connectionStats,
    }),
    "utf8",
  );

  console.log("Wrote", OUT_JSON);
  console.log("Wrote", OUT_MD);
  console.log("Unmatched:", items.length);
  console.log("A/B/C:", groupCounts.A, groupCounts.B, groupCounts.C);
  console.log("HIGH/MID/LOW:", priorityCounts.HIGH, priorityCounts.MID, priorityCounts.LOW);
  console.log("With DB candidates:", withDbCandidates);
  console.log("No DB candidates:", noDbCandidates);
}

main();
