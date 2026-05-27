import type {
  DetailedIssue,
  FinalStatus,
  JourneyType,
  NextActionLikelihood,
  Persona,
  Personality,
  ScenarioMetrics,
  UserSentiment,
} from "./types";

export type CustomerFeedback = {
  userRating: number;
  userSentiment: UserSentiment;
  userComment: string;
  frustrationTags: string[];
  trustScore: number;
  nextActionLikelihood: NextActionLikelihood;
};

const BANNED_IN_CUSTOMER_TEXT =
  /\b(CTA|UI|UX|exact match|core result|issue|selector|viewport|route|fallback|API|매핑|컴포넌트|component|render|hierarchy)\b|상단 영역|플랫폼 데이터/gi;

/** 분석/페르소나 카탈로그식 문장 — 고객 멘트로 쓰이면 재생성 */
const ANALYST_PHRASES =
  /핵심 정보가|이탈$|이탈\s|무관한 결과가|포기$|포기\s|CTA가|테스트 페이지|개발자 표현|첫 화면에 없으면/;

const ISSUE_TAGS: Record<string, string> = {
  "core-result-visibility": "내 차 결과 안 보임",
  "missing-cta": "버튼 못 찾음",
  "battery-exact-match": "규격 헷갈림",
  "vehicle-result-missing": "내 차 결과 안 보임",
  "browse-vehicle-missing": "차종 찾기 어려움",
  "browse-spec-missing": "규격 찾기 어려움",
  "photo-guidance-missing": "사진 확인 못 찾음",
  "photo-cta": "사진 확인 못 찾음",
  "repair-shop-missing": "정비소/문의 못 찾음",
  "shop-guidance-missing": "주문 안내 부족",
  "faq-content-missing": "답변 찾기 어려움",
  "journey-navigation-failed": "메뉴 찾기 어려움",
  "dev-terminology": "문구가 개발자 같음",
  "excessive-cards": "검색결과 헷갈림",
  "unrelated-batteries": "규격 헷갈림",
  "page-too-long": "페이지 너무 김",
  "badge-overload": "표시 너무 많음",
  "badge-vs-title": "표시 너무 많음",
  "bms-ibs-relevance": "BMS/IBS 안내 부족",
};

type CommentCtx = {
  persona: Persona;
  primaryIssue: string;
  battery?: string;
  vehicleShort: string;
  query: string;
  variant: number;
};

function seedFrom(personaId: string, extra = 0): number {
  let h = extra;
  for (let i = 0; i < personaId.length; i++) h = (h * 31 + personaId.charCodeAt(i)) >>> 0;
  return h;
}

function roundHalf(n: number): number {
  return Math.max(1, Math.min(5, Math.round(n * 2) / 2));
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** 고객 멘트 금지어 검사 — true면 위반 */
export function hasBannedCustomerTerms(text: string): boolean {
  const cleaned = text.replace(/DB니|DB가|DB\s|플랫폼이|플랫폼\s|이런 말/gi, "");
  return (
    BANNED_IN_CUSTOMER_TEXT.test(cleaned) ||
    ANALYST_PHRASES.test(cleaned) ||
    /\b카드\b/.test(cleaned) ||
    /\b섹션\b/.test(cleaned)
  );
}

export function sanitizeCustomerText(text: string): string {
  let t = text
    .replace(/\bCTA\b/gi, "버튼")
    .replace(/\b카드\b/g, "결과")
    .replace(/상단 영역/g, "첫 화면")
    .replace(/exact match/gi, "딱 맞는 규격")
    .replace(/\bUI\b|\bUX\b/gi, "화면")
    .replace(/\b섹션\b/g, "구역")
    .replace(/플랫폼 데이터/g, "플랫폼");
  if (hasBannedCustomerTerms(t)) {
    t = t.replace(BANNED_IN_CUSTOMER_TEXT, "").replace(/\s+/g, " ").trim();
  }
  return t;
}

export function getCustomerFrustrationForIssue(persona: Persona, issueType: string): string {
  const v = seedFrom(persona.id, issueType.length) % 3;
  const bat = persona.batterySpec ?? "배터리";
  const car = persona.vehicle.model;

  const lines: Record<string, string[]> = {
    "core-result-visibility": [
      persona.personality === "급한 사람"
        ? `아니 ${persona.situation}인데 첫 화면에서 ${car} 결과가 안 보임. 이러면 그냥 전화번호 찾고 나갈 듯.`
        : `검색하자마자 ${car}랑 ${bat}이 바로 안 보여서 뭘 봐야 할지 모르겠음.`,
      `내가 찾은 차랑 배터리가 첫눈에 안 들어옴. ${persona.situation} 때문에 들어왔는데 답답함.`,
      `${car} 배터리 찾으러 왔는데 맞는 결과가 바로 안 떠서 불안함.`,
    ],
    "missing-cta": [
      persona.knowledgeLevel === "beginner"
        ? "대충 맞는 건 알겠는데 그다음에 뭘 눌러야 되는지 애매함."
        : "확인하려면 뭘 눌러야 되는지 안 보임. 문의나 사진 확인 길이 더 필요함.",
      "어디를 눌러야 다음으로 가는지 모르겠음. 구매 전 확인 버튼이 더 잘 보여야 할 듯.",
    ],
    "battery-exact-match": [
      persona.personality === "꼼꼼한 사람" || persona.personality === "가격 비교형"
        ? `${bat} 찾는데 다른 규격이 먼저 보여서 헷갈림. 이거 잘못 사면 골치 아픈데.`
        : `${bat} 검색했는데 다른 규격이 섞여 나오면 신뢰가 좀 떨어짐.`,
      `검색한 ${bat}이 맨 위에 딱 안 나옴. 맞는 건지 확인하기 어려움.`,
    ],
    "vehicle-result-missing": [
      `${car}로 검색했는데 내 차가 바로 안 보임. 이 사이트에 내 차 정보 없는 건가 싶음.`,
      `차종을 쳤는데 관련 결과가 바로 안 떠서 신뢰가 떨어짐.`,
    ],
    "photo-guidance-missing": [
      "사진 찍어서 확인하면 된다길래 찾았는데 어디서 하는지 잘 모르겠음.",
      "배터리 사진 보내는 안내가 바로 안 보여서 차 모르는 사람 입장에선 막막함.",
    ],
    "photo-cta": [
      "사진으로 확인하고 싶은데 버튼이 앞에 없음. 한참 찾다 포기할 뻔.",
    ],
    "repair-shop-missing": [
      "배터리 갈러 어디로 가면 되는지 보려고 했는데 매장이나 출장 안내가 바로 안 보임.",
      "정비소나 지점 찾으러 왔는데 길이 안 보여서 그냥 다른 데 알아볼 듯.",
    ],
    "dev-terminology": [
      persona.personality === "신뢰 확인형"
        ? "DB니 플랫폼이니 이런 말이 보이니까 고객용이라기보다 개발 중인 페이지 같음."
        : "설명이 좀 딱딱하고 내부용 말처럼 보임. 솔직히 신뢰가 떨어짐.",
    ],
    "excessive-cards": [
      "결과가 너무 많이 떠서 뭘 봐야 할지 모르겠음. 내 차에 맞는 게 뭔지 더 헷갈림.",
    ],
    "unrelated-batteries": [
      `${bat} 찾는데 딴 배터리만 많이 보여서 헷갈림. 정확도 괜찮은지 살짝 의심됨.`,
    ],
    "page-too-long": [
      "밑으로 너무 내려야 해서 피곤함. 찾는 내용 나오기 전에 이것저것 너무 많음.",
    ],
    "shop-guidance-missing": [
      "택배로 시키기 전에 뭐 확인해야 하는지 안내가 더 필요함.",
      "주문 전에 단자 방향이랑 배송 얘기가 바로 안 보여서 보류함.",
    ],
    "journey-navigation-failed": [
      "메뉴 이름이 헷갈려서 원하는 데까지 가기가 좀 빡셈.",
      "눌렀는데 다른 데로 가거나 메뉴를 못 찾겠음.",
    ],
    "badge-overload": [
      "작은 표시가 너무 많아서 뭐가 중요한지 한눈에 안 들어옴.",
      "글자보다 잡다한 표시가 먼저 보여서 피곤함.",
    ],
    "faq-content-missing": [
      "질문 답변 찾으려고 왔는데 뭐가 질문이고 뭐가 답인지 구분이 잘 안 됨.",
    ],
    "browse-vehicle-missing": [
      `${car} 배터리 보러 왔는데 차 정보가 바로 안 보임.`,
    ],
    compare_battery: [
      `${bat}이랑 다른 규격 차이를 보러 왔는데 딱 잘라서 안 보여서 불안함.`,
    ],
    "browse-spec-missing": [
      `${bat} 규격 보러 왔는데 목록에서 바로 못 찾겠음. 종류가 많아서 더 헷갈림.`,
      "배터리 규격표가 한눈에 안 들어와서 뭐가 내 차에 맞는지 모르겠음.",
    ],
    "mobile-first-screen": [
      "폰으로 봤는데 첫 화면에 내가 찾는 게 잘 안 보임. 손가락으로 계속 내려야 해서 답답함.",
    ],
    "broken-images": [
      "사진이 안 뜨거나 깨져 보여서 믿음이 좀 떨어짐. 배터리 모양 확인도 어려움.",
    ],
    "bms-ibs-relevance": [
      "BMS나 IBS 얘기는 봤는데 내 차랑 뭔 상관인지 연결이 잘 안 됨.",
      "경고등 뜬 이유 찾으러 왔는데 배터리랑 어떻게 연결되는지 설명이 부족함.",
    ],
    "badge-vs-title": [
      "작은 표시가 너무 많아서 제목이랑 중요한 글자가 잘 안 보임.",
    ],
  };

  const genericFallbacks = [
    "원하는 정보를 못 찾아서 그냥 나갈 것 같음.",
    "뭘 봐야 할지 모르겠어서 한참 헤맸음.",
    "찾긴 찾았는데 확신이 안 서서 답답함.",
  ];
  const pool = lines[issueType] ?? genericFallbacks;
  return sanitizeCustomerText(pool[(v + seedFrom(persona.id, 1)) % pool.length]);
}

function buildPositiveComment(persona: Persona): string {
  const car = persona.vehicle.model;
  const bat = persona.batterySpec ?? "규격";
  const variants = [
    `${car}이랑 ${bat}이 바로 보여서 이해는 빠름. 사진 확인까지 같이 있으면 더 좋을 듯.`,
    `검색하자마자 필요한 정보가 보여서 나쁘지 않음. 다음 단계만 조금 더 분명하면 될 듯.`,
    `크게 막히진 않았음. ${persona.situation} 확인하려고 왔는데 대체로 찾을 만함.`,
  ];
  return sanitizeCustomerText(variants[seedFrom(persona.id) % variants.length]);
}

function buildComment(ctx: CommentCtx, issues: DetailedIssue[]): string {
  if (issues.length === 0) return buildPositiveComment(ctx.persona);

  const primary = ctx.primaryIssue;
  let comment = getCustomerFrustrationForIssue(ctx.persona, primary);

  if (ctx.persona.journeyType === "compare_battery" && primary !== "battery-exact-match") {
    const alt = getCustomerFrustrationForIssue(ctx.persona, "compare_battery");
    if (ctx.variant % 2 === 0) comment = alt;
  }

  if (issues.length >= 2 && ctx.variant % 3 === 0) {
    const secondType = issues[1].issueType;
    if (secondType !== primary) {
      const extra = getCustomerFrustrationForIssue(ctx.persona, secondType).split(".")[0];
      if (extra && !comment.includes(extra.slice(0, 15))) {
        comment = `${comment.replace(/\.$/, "")}. ${extra}.`;
      }
    }
  }

  return sanitizeCustomerText(comment);
}

const SAFE_FALLBACKS = [
  "원하는 정보를 못 찾아서 그냥 나갈 것 같음.",
  "뭘 봐야 할지 모르겠어서 한참 헤맸음.",
  "찾긴 찾았는데 확신이 안 서서 답답함.",
  "내가 찾는 게 바로 안 보여서 답답함.",
  "설명이 많은데 정작 내가 필요한 건 잘 안 보임.",
];

function ensureValidCustomerComment(comment: string, persona: Persona): string {
  let t = sanitizeCustomerText(comment);
  if (!hasBannedCustomerTerms(t)) return t;

  console.warn(`[UX Audit] userComment 금지/분석 문구 감지 (${persona.id}), 재생성`);
  const idx = seedFrom(persona.id, t.length) % SAFE_FALLBACKS.length;
  t = sanitizeCustomerText(SAFE_FALLBACKS[idx]);
  if (!hasBannedCustomerTerms(t)) return t;

  return sanitizeCustomerText(
    `${persona.vehicle.model} 배터리 찾으러 왔는데 원하는 게 바로 안 보여서 답답함.`,
  );
}

function baseRating(finalStatus: FinalStatus, issues: DetailedIssue[]): number {
  const hasHigh = issues.some((i) => i.severity === "HIGH");
  const hasMed = issues.some((i) => i.severity === "MEDIUM");
  const hasLow = issues.some((i) => i.severity === "LOW");

  if (finalStatus === "PASS" && issues.length === 0) return 4.5 + (seedFrom("pass") % 2) * 0.5;
  if (hasHigh) return 1.0 + (hasMed ? 0.5 : 0) + (issues.length === 1 ? 0.5 : 0);
  if (hasMed) return 2.5 + (hasLow ? 0.5 : 0);
  if (hasLow) return 3.5 + (seedFrom("low") % 3) * 0.5;
  return 4.0;
}

function adjustRating(rating: number, persona: Persona, issues: DetailedIssue[]): number {
  let r = rating;
  const types = new Set(issues.map((i) => i.issueType));

  if (persona.urgency === "high" && (types.has("core-result-visibility") || types.has("vehicle-result-missing"))) {
    r -= 0.5;
  }
  if (persona.knowledgeLevel === "beginner" && types.has("missing-cta")) r -= 0.5;
  if (persona.personality === "급한 사람" && issues.some((i) => i.severity === "HIGH")) r -= 0.5;
  if (persona.personality === "구매 직전형" && types.has("missing-cta")) r -= 0.5;

  if (issues.length === 0) r += 0.5;

  return roundHalf(r);
}

function computeTrustScore(persona: Persona, issues: DetailedIssue[], metrics: ScenarioMetrics): number {
  let t = 4;
  if (issues.some((i) => i.issueType === "dev-terminology")) t -= 2;
  if (metrics.devTermHits.length > 0) t -= 1;
  if (issues.some((i) => i.issueType === "unrelated-batteries")) t -= 1;
  if (persona.journeyType === "trust_check" && issues.length > 0) t -= 1;
  if (issues.some((i) => i.severity === "HIGH")) t -= 0.5;
  if (issues.length === 0) t = 5;
  return clamp(Math.round(t), 1, 5);
}

function computeNextAction(
  persona: Persona,
  rating: number,
  issues: DetailedIssue[],
): NextActionLikelihood {
  const types = new Set(issues.map((i) => i.issueType));

  if (rating <= 2 || persona.urgency === "high" && issues.some((i) => i.severity === "HIGH")) return "low";
  if (persona.journeyType === "repair_shop_search" && types.has("repair-shop-missing")) return "low";
  if (types.has("dev-terminology") && persona.personality === "신뢰 확인형") return "low";
  if (rating >= 4 && issues.length <= 1) return "high";
  if (rating >= 3.5 && !issues.some((i) => i.severity === "HIGH")) return "medium";
  return "low";
}

function sentimentFromRating(rating: number): UserSentiment {
  if (rating <= 2) return "very_negative";
  if (rating <= 3) return "negative";
  if (rating <= 4) return "neutral";
  return "positive";
}

function collectTags(issues: DetailedIssue[]): string[] {
  const tags = new Set<string>();
  for (const i of issues) {
    const tag = ISSUE_TAGS[i.issueType];
    if (tag) tags.add(tag);
  }
  if (issues.some((i) => i.issueType === "missing-cta")) tags.add("버튼 못 찾음");
  if (issues.some((i) => i.visibleCardsCount >= 10)) tags.add("페이지 과다");
  return [...tags];
}

export function generateCustomerFeedback(
  persona: Persona,
  issues: DetailedIssue[],
  metrics: ScenarioMetrics,
  finalStatus: FinalStatus,
  error?: string,
): CustomerFeedback {
  if (error) {
    const errComment = sanitizeCustomerText(
      persona.personality === "급한 사람"
        ? "페이지가 제대로 안 열려서 확인도 못 함. 급한데 이러면 그냥 다른 데 찾을 듯."
        : "화면이 안 뜨거나 이상해서 뭐부터 봐야 할지 모르겠음. 다시 들어와도 같으면 나갈 것 같음.",
    );
    return {
      userRating: 1,
      userSentiment: "very_negative",
      userComment: errComment,
      frustrationTags: ["접속/로딩 문제"],
      trustScore: 1,
      nextActionLikelihood: "low",
    };
  }
  const primaryIssue = issues[0]?.issueType ?? "none";
  const variant = seedFrom(persona.id, issues.length) % 5;

  let userRating = adjustRating(baseRating(finalStatus, issues), persona, issues);
  const trustScore = computeTrustScore(persona, issues, metrics);
  const nextActionLikelihood = computeNextAction(persona, userRating, issues);
  const userSentiment = sentimentFromRating(userRating);

  const userComment = ensureValidCustomerComment(
    buildComment(
      {
        persona,
        primaryIssue,
        battery: persona.batterySpec,
        vehicleShort: persona.vehicle.model,
        query: persona.query,
        variant,
      },
      issues,
    ),
    persona,
  );

  return {
    userRating,
    userSentiment,
    userComment: sanitizeCustomerText(userComment),
    frustrationTags: collectTags(issues),
    trustScore,
    nextActionLikelihood,
  };
}

export function starsDisplay(rating: number): string {
  return `⭐ ${rating.toFixed(1)} / 5`;
}

export function aggregateFrustrationTags(results: { frustrationTags: string[] }[]): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of results) {
    for (const t of r.frustrationTags) map.set(t, (map.get(t) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));
}

export function pickRepresentativeComments(
  results: { userComment: string; userRating: number; personaName: string }[],
  n = 5,
): string[] {
  const lowSorted = [...results].sort((a, b) => a.userRating - b.userRating);
  const picks: string[] = [];
  const seen = new Set<string>();
  for (const r of lowSorted) {
    if (picks.length >= n) break;
    const key = r.userComment.slice(0, 40);
    if (seen.has(key)) continue;
    seen.add(key);
    picks.push(`"${r.userComment}" — ${r.personaName.split(" ")[0]}`);
  }
  const highSorted = [...results].sort((a, b) => b.userRating - a.userRating);
  for (const r of highSorted) {
    if (picks.length >= n) break;
    if (r.userRating >= 4) {
      const key = r.userComment.slice(0, 40);
      if (!seen.has(key)) picks.push(`"${r.userComment}" (긍정)`);
    }
  }
  return picks.slice(0, n);
}
