import { normalizeBatteryCode } from "@/lib/batteryNormalize";
import { baseQuestions } from "@/lib/platform-base-questions";
import type { Question } from "@/lib/platform-types";
import {
  BATTERY_QNA_FALLBACK,
  SEARCH_QNA_FALLBACK,
  VEHICLE_QNA_FALLBACK,
} from "./fallbacks";
import { platformQnaQuestions } from "./catalog-questions";
import { filterQuestionsForBatteryDisplay } from "@/lib/qna/qna-display-filter";
import type { QnaMatchContext } from "./types";

const questions: Question[] = [...baseQuestions, ...platformQnaQuestions];

const DEPRIORITIZED = /115D31L/i;

function normSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

function normQuery(q: string): string {
  return q.trim().toLowerCase();
}

function questionBlob(q: Question): string {
  return [
    q.title,
    q.shortAnswer ?? "",
    q.answer,
    q.category,
    q.tags.join(" "),
    q.batteryCode ?? "",
    ...(q.relatedBatteryCodes ?? []),
    ...(q.relatedSearchQueries ?? []),
    q.vehicleId ?? "",
    ...(q.relatedVehicleSlugs ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

function scoreQuestion(q: Question, ctx: QnaMatchContext): number {
  let score = q.priority ?? 0;
  const blob = questionBlob(q);

  if (DEPRIORITIZED.test(blob)) score -= 80;

  if (ctx.batteryCode) {
    const code = normalizeBatteryCode(ctx.batteryCode);
    if (q.batteryCode && normalizeBatteryCode(q.batteryCode) === code) score += 45;
    if (q.relatedBatteryCodes?.some((c) => normalizeBatteryCode(c) === code)) score += 38;
    if (q.tags.some((t) => normalizeBatteryCode(t) === code)) score += 22;
  }

  if (ctx.vehicleSlug) {
    const slug = normSlug(ctx.vehicleSlug);
    if (q.vehicleId && normSlug(q.vehicleId) === slug) score += 40;
    if (q.relatedVehicleSlugs?.some((s) => normSlug(s) === slug)) score += 35;
    if (blob.includes(slug.replace(/-/g, " ")) || blob.includes(slug)) score += 12;
  }

  if (ctx.searchQuery) {
    const qn = normQuery(ctx.searchQuery);
    if (q.relatedSearchQueries?.some((sq) => qn.includes(normQuery(sq)) || normQuery(sq).includes(qn))) {
      score += 50;
    }
    const tokens = qn.split(/\s+/).filter((t) => t.length > 1);
    for (const t of tokens) {
      if (blob.includes(t)) score += 8;
    }
    if (/포터|90r|100r|gb90|gb100/.test(qn) && /포터|90r|100r/.test(blob)) score += 18;
    if (/블랙박스|방전|암전류|대기전류/.test(qn) && /블랙박스|방전|암전류|대기/.test(blob)) score += 20;
    if (/하이브리드|ev|보조|12v|아이오닉|ev6/.test(qn) && /ev|12v|하이브리드|보조/.test(blob)) score += 18;
    if (/cmf80|스타리아/.test(qn) && /cmf80|스타리아/.test(blob)) score += 22;
    if (/봉고|din74/.test(qn) && /봉고|din74/.test(blob)) score += 20;
    if (/vs|비교|대체/.test(qn) && /비교|대체|vs/.test(blob)) score += 15;
    if (/그랜저\s*ig/.test(qn) && /그랜저|agm80|agm70/.test(blob)) score += 14;
  }

  if (ctx.compareCodes?.length) {
    const codes = ctx.compareCodes.map((c) => normalizeBatteryCode(c));
    const related = [
      q.batteryCode,
      ...(q.relatedBatteryCodes ?? []),
      ...q.tags,
    ]
      .filter(Boolean)
      .map((c) => normalizeBatteryCode(String(c)));
    const hits = related.filter((c) => codes.includes(c)).length;
    score += hits * 28;
    if (/비교|대체|단자|타입/.test(blob)) score += 10;
  }

  if (q.homeFeatured) score += 5;
  if (q.featured) score += 3;

  return score;
}

/** fallback ID를 먼저 고정한 뒤, 점수 상위 질문으로 빈 슬롯만 채움 */
function mergeWithFallbacks(picked: Question[], fallbackIds: string[] | undefined, limit: number): Question[] {
  const seen = new Set<string>();
  const out: Question[] = [];

  for (const id of fallbackIds ?? []) {
    if (out.length >= limit) break;
    if (seen.has(id)) continue;
    const q = questions.find((item) => item.id === id);
    if (q) {
      seen.add(id);
      out.push(q);
    }
  }

  for (const q of picked) {
    if (out.length >= limit) break;
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    out.push(q);
  }

  return out.slice(0, limit);
}

function pickQuestions(pool: Question[], ctx: QnaMatchContext): Question[] {
  const limit = ctx.limit ?? 4;
  const minScore = ctx.searchQuery || ctx.batteryCode || ctx.vehicleSlug || ctx.compareCodes ? 8 : 6;
  const ranked = pool
    .map((q) => ({ q, score: scoreQuestion(q, ctx) }))
    .filter((row) => row.score >= minScore)
    .sort((a, b) => b.score - a.score || (b.q.priority ?? 0) - (a.q.priority ?? 0));

  const seen = new Set<string>();
  const out: Question[] = [];
  for (const { q } of ranked) {
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    out.push(q);
    if (out.length >= limit) break;
  }
  return out;
}

function fallbackIdsForSearch(query: string): string[] {
  const qn = normQuery(query);
  for (const row of SEARCH_QNA_FALLBACK) {
    if (row.pattern.test(qn)) return row.ids;
  }
  return [];
}

function fallbackIdsForBattery(code: string): string[] {
  const family = normalizeBatteryCode(code);
  return BATTERY_QNA_FALLBACK[family] ?? BATTERY_QNA_FALLBACK[code] ?? [];
}

function fallbackIdsForVehicle(slug: string, fuelHint?: string | null): string[] {
  const base = VEHICLE_QNA_FALLBACK[normSlug(slug)] ?? [];
  if (/하이브리드|hev/i.test(fuelHint ?? "")) {
    return [
      ...base,
      ...(VEHICLE_QNA_FALLBACK["sportage-nq5"] ?? []),
      "q-hybrid-replace",
      "q-agm60l-vs-ev12v",
    ];
  }
  return base;
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

export function getQuestionsForBattery(batteryCode: string, limit = 4): Question[] {
  const picked = pickQuestions(questions, { batteryCode, limit: limit + 2 });
  const merged = mergeWithFallbacks(picked, fallbackIdsForBattery(batteryCode), limit + 2);
  return filterQuestionsForBatteryDisplay(batteryCode, merged).slice(0, limit);
}

export function getQuestionsForVehicle(
  vehicleSlug: string,
  limit = 4,
  fuelHint?: string | null,
): Question[] {
  const ctx: QnaMatchContext = { vehicleSlug, limit };
  if (fuelHint && /하이브리드|hev/i.test(fuelHint)) {
    ctx.searchQuery = `${vehicleSlug} 하이브리드`;
  }
  const picked = pickQuestions(questions, ctx);
  return mergeWithFallbacks(picked, fallbackIdsForVehicle(vehicleSlug, fuelHint), limit);
}

export function getQuestionsForSearch(searchQuery: string, limit = 4, altQuery?: string): Question[] {
  const primary = searchQuery.trim() || altQuery?.trim() || "";
  if (!primary) return [];

  const picked = pickQuestions(questions, { searchQuery: primary, limit });
  const fallbackIds = [
    ...new Set([
      ...fallbackIdsForSearch(primary),
      ...(altQuery?.trim() && altQuery.trim() !== primary ? fallbackIdsForSearch(altQuery) : []),
    ]),
  ];
  return mergeWithFallbacks(picked, fallbackIds, limit);
}

export function getQuestionsForCompare(codes: string[], limit = 4): Question[] {
  return pickQuestions(questions, { compareCodes: codes, limit });
}

export const HOME_FEATURED_QNA_IDS = [
  "q-porter2-year",
  "q-blackbox",
  "q-agm60l-vs-ev12v",
  "q-agm70l-vs-agm80l",
  "q-cmf80l-search-80l",
] as const;

export function getHomeFeaturedQuestions(limit = 5): Question[] {
  const byId = HOME_FEATURED_QNA_IDS.map((id) => questions.find((q) => q.id === id)).filter(
    (q): q is Question => Boolean(q),
  );
  if (byId.length >= limit) return byId.slice(0, limit);
  const extra = questions.filter((q) => q.homeFeatured && !byId.some((b) => b.id === q.id));
  return [...byId, ...extra].slice(0, limit);
}
