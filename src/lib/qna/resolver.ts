import { normalizeBatteryCode } from "@/lib/batteryNormalize";
import { baseQuestions } from "@/lib/platform-base-questions";
import type { Question } from "@/lib/platform-types";
import { platformQnaQuestions } from "./catalog-questions";
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

function pickQuestions(pool: Question[], ctx: QnaMatchContext): Question[] {
  const limit = ctx.limit ?? 4;
  const minScore = ctx.searchQuery || ctx.batteryCode || ctx.vehicleSlug || ctx.compareCodes ? 12 : 8;
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

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

export function getQuestionsForBattery(batteryCode: string, limit = 4): Question[] {
  return pickQuestions(questions, { batteryCode, limit });
}

export function getQuestionsForVehicle(vehicleSlug: string, limit = 4): Question[] {
  return pickQuestions(questions, { vehicleSlug, limit });
}

export function getQuestionsForSearch(searchQuery: string, limit = 4): Question[] {
  if (!searchQuery.trim()) return [];
  return pickQuestions(questions, { searchQuery, limit });
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
