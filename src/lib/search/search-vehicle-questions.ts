import type { UnifiedSearchResult } from "@/lib/data/searchAll";

export type VehicleQuestionContext = {
  canonicalKey: string | null;
  fuel: string | null;
  model: string | null;
  candidateSpecs: string[];
};

const HYBRID_CANONICALS = new Set([
  "kia-sorento-mq4-hybrid",
  "hyundai-santafe-mx5-hybrid",
  "kia-sportage-nq5-hybrid",
  "kia-k8-hybrid",
  "hyundai-grandeur-gn7-hybrid",
  "hyundai-tucson-nx4-hybrid",
]);

const BLOCK_ALWAYS = [/다운그레이드/i];

const BLOCK_FOR_HYBRID_VEHICLE = [/블랙박스/i, /블박/i, /완전\s*방전/i];

const BOOST_HYBRID_SORENTO = [
  { re: /쏘렌토\s*MQ4\s*하이브리드.*AGM60L|AGM60L.*쏘렌토\s*MQ4\s*하이브리드/i, boost: 120 },
  { re: /하이브리드.*일반.*배터리|일반\s*차량.*배터리.*다른/i, boost: 90 },
  { re: /배터리\s*사진|사진.*어디|라벨.*촬영/i, boost: 80 },
  { re: /AGM.*교체\s*후|교체\s*후.*확인/i, boost: 70 },
];

function isHybridVehicleContext(ctx: VehicleQuestionContext): boolean {
  if (ctx.canonicalKey && HYBRID_CANONICALS.has(ctx.canonicalKey)) return true;
  return Boolean(ctx.fuel && /하이브리드|hev/i.test(ctx.fuel));
}

function isGenericIceSorentoQuestion(title: string): boolean {
  if (!/쏘렌토/i.test(title)) return false;
  if (/MQ4|하이브리드|HEV|4\s*세대|mq4|하브/i.test(title)) return false;
  if (/가솔린|디젤|AGM80/i.test(title)) return false;
  return true;
}

function scoreQuestion(hit: UnifiedSearchResult, ctx: VehicleQuestionContext | null): number {
  const text = `${hit.title} ${hit.subtitle ?? ""}`;
  let score = hit.score;

  for (const re of BLOCK_ALWAYS) {
    if (re.test(text)) return -1000;
  }

  if (!ctx || !isHybridVehicleContext(ctx)) return score;

  for (const re of BLOCK_FOR_HYBRID_VEHICLE) {
    if (re.test(text)) return -1000;
  }

  if (ctx.canonicalKey === "kia-sorento-mq4-hybrid" && isGenericIceSorentoQuestion(text)) {
    return -1000;
  }

  if (ctx.candidateSpecs.length > 0) {
    const candidate = ctx.candidateSpecs[0]!.toUpperCase();
    if (/\b(AGM|DIN|CMF)\d+/i.test(text) && !text.toUpperCase().includes(candidate)) {
      if (/vs|비교|대체|다운그레이드/i.test(text)) score -= 80;
    }
  }

  if (ctx.canonicalKey === "kia-sorento-mq4-hybrid") {
    for (const { re, boost } of BOOST_HYBRID_SORENTO) {
      if (re.test(text)) score += boost;
    }
    if (/AGM60L/i.test(text) && /하이브리드|MQ4|쏘렌토/i.test(text)) score += 60;
  }

  if (isHybridVehicleContext(ctx) && /하이브리드/i.test(text)) score += 25;

  return score;
}

export function getCuratedVehicleQuestions(ctx: VehicleQuestionContext): UnifiedSearchResult[] {
  if (ctx.canonicalKey === "kia-sorento-mq4-hybrid") {
    return [
      {
        kind: "qa",
        id: "curated-sorento-hybrid-agm60l",
        title: "쏘렌토 MQ4 하이브리드 배터리는 AGM60L인가요?",
        subtitle: "하이브리드·연료별 규격 확인",
        href: "/guides/sorento-mq4-hybrid-agm60l",
        score: 250,
      },
      {
        kind: "qa",
        id: "curated-hybrid-vs-ice",
        title: "하이브리드 차량은 일반 차량과 배터리가 다른가요?",
        subtitle: "연료별 보조배터리 차이",
        href: "/guides/sorento-mq4-hybrid-agm60l",
        score: 220,
      },
      {
        kind: "qa",
        id: "curated-battery-photo",
        title: "배터리 사진은 어디를 찍어야 하나요?",
        subtitle: "라벨·단자 방향 확인",
        href: "/analysis/photo",
        score: 200,
      },
      {
        kind: "qa",
        id: "curated-agm-replace-check",
        title: "AGM 배터리 교체 후 확인해야 할 점은?",
        subtitle: "충전·시동·경고등",
        href: "/guides",
        score: 180,
      },
    ];
  }
  return [];
}

export function rankQuestionsForVehicleContext(
  hits: UnifiedSearchResult[],
  ctx: VehicleQuestionContext | null,
): UnifiedSearchResult[] {
  if (!ctx?.canonicalKey && !ctx?.fuel) return hits;

  const ranked = [...hits]
    .map((h) => ({ hit: h, score: scoreQuestion(h, ctx) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)
    .map(({ hit }) => hit);

  const curated = getCuratedVehicleQuestions(ctx);
  const seen = new Set<string>();
  const merged: UnifiedSearchResult[] = [];
  for (const q of [...curated, ...ranked]) {
    const key = q.title.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(q);
  }
  return merged;
}
