/**
 * Battery Manager — context-aware navigation graph.
 * 모든 페이지에서 다음 행동·관련 콘텐츠를 일관되게 제공합니다.
 */
import { getArticleById, getArticlesByVehicleId } from "./content";
import { getEnrichedServiceCenters } from "./service-center-hub-data";
import {
  HUB_ORDER_CHECKLIST,
  HUB_PHOTO_CHECK,
  HUB_SERVICE,
  HUB_SYMPTOMS,
} from "./platform-hub-routes";
import {
  aiHref,
  classifySearch,
  communityHref,
  compareHref,
  diagnosisHref,
  getBattery,
  getGuide,
  getSymptom,
  getVehicle,
  guideHref,
  photoHref,
  questions,
  searchHref,
  serviceHref,
  shopHref,
  shopProducts,
  type ActionLink,
  vehicleHref,
  vehicles,
} from "./platform-data";

export type NavContextType =
  | "home"
  | "vehicle"
  | "battery"
  | "guide"
  | "question"
  | "symptom"
  | "brand"
  | "shop"
  | "compare"
  | "photo"
  | "service"
  | "trending"
  | "search"
  | "community";

export type NavContext = {
  type: NavContextType;
  vehicleId?: string;
  batteryCode?: string;
  batteryIds?: string[];
  symptomId?: string;
  guideId?: string;
  articleId?: string;
  questionId?: string;
  brandId?: string;
  fuelTypes?: string[];
  tags?: string[];
  query?: string;
};

export type RelatedLink = { label: string; meta: string; href: string };

const MAX_ACTIONS = 6;

function dedupeActions(links: ActionLink[]): ActionLink[] {
  const seen = new Set<string>();
  return links.filter((l) => {
    if (seen.has(l.href)) return false;
    seen.add(l.href);
    return true;
  });
}

function batteryDetailHref(code: string): string {
  return `/batteries/${encodeURIComponent(code)}`;
}

function shopForBattery(code?: string): string {
  if (!code) return shopHref();
  return `${shopHref()}?q=${encodeURIComponent(code)}`;
}

function primaryBattery(ctx: NavContext): string {
  if (ctx.batteryCode) return ctx.batteryCode;
  if (ctx.batteryIds?.[0]) return ctx.batteryIds[0];
  if (ctx.vehicleId) return getVehicle(ctx.vehicleId).batteryCode;
  return "AGM80L";
}

function primaryVehicle(ctx: NavContext) {
  if (ctx.vehicleId) return getVehicle(ctx.vehicleId);
  const code = primaryBattery(ctx);
  const b = getBattery(code);
  return getVehicle(b.vehicleIds[0] ?? "sorento-mq4");
}

function primarySymptom(ctx: NavContext) {
  if (ctx.symptomId) return getSymptom(ctx.symptomId);
  const v = primaryVehicle(ctx);
  return getSymptom(v.symptomIds[0] ?? "slow-engine-start");
}

export function buildContextFromVehicle(vehicleId: string, extras?: Partial<NavContext>): NavContext {
  const v = getVehicle(vehicleId);
  return {
    type: "vehicle",
    vehicleId,
    batteryCode: v.batteryCode,
    batteryIds: [v.batteryCode, ...v.upgradeCodes],
    fuelTypes: v.fuel.split(/[/·,]/).map((s) => s.trim()),
    tags: [v.brand, v.batteryCode.startsWith("AGM") ? "AGM" : "DIN", "ISG"],
    ...extras,
  };
}

export function buildContextFromBattery(batteryCode: string, extras?: Partial<NavContext>): NavContext {
  const b = getBattery(batteryCode);
  return {
    type: "battery",
    batteryCode: b.code,
    batteryIds: [b.code, ...b.compareWith.slice(0, 2)],
    vehicleId: b.vehicleIds[0],
    tags: [b.type, `${b.terminal}단자`, b.isgFit === "매우 적합" ? "ISG" : ""].filter(Boolean),
    ...extras,
  };
}

export function buildContextFromGuide(articleId: string): NavContext {
  const article = getArticleById(articleId);
  if (!article) {
    return { type: "guide", guideId: articleId, articleId };
  }
  return {
    type: "guide",
    articleId,
    vehicleId: article.vehicleIds[0],
    batteryCode: article.batteryIds[0],
    batteryIds: article.batteryIds,
    tags: article.tags,
  };
}

export function buildContextFromQuestion(questionId: string): NavContext {
  const q = questions.find((x) => x.id === questionId);
  if (!q) return { type: "question", questionId, query: questionId };
  return {
    type: "question",
    questionId,
    vehicleId: q.vehicleId,
    batteryCode: q.batteryCode,
    guideId: q.guideId,
    tags: q.tags,
    query: q.title,
  };
}

export function buildContextFromSymptom(symptomId: string, vehicleId?: string): NavContext {
  const s = getSymptom(symptomId);
  return {
    type: "symptom",
    symptomId,
    vehicleId: vehicleId ?? s.vehicleIds[0],
    batteryCode: s.batteryCodes[0],
    batteryIds: s.batteryCodes,
    tags: s.tags,
  };
}

export function buildContextFromSearch(query: string): NavContext {
  const intent = classifySearch(query);
  return {
    type: "search",
    query,
    vehicleId: intent.vehicle?.id,
    batteryCode: intent.battery?.code ?? intent.vehicle?.batteryCode,
    symptomId: intent.symptom?.id,
    questionId: intent.question?.id,
    tags: intent.battery?.type ? [intent.battery.type] : undefined,
  };
}

export function buildContextFromPage(
  page: string,
  ctx?: { vehicleId?: string; batteryCode?: string; symptomId?: string; guideId?: string; query?: string },
): NavContext {
  const typeMap: Record<string, NavContextType> = {
    search: "search",
    diagnosis: "symptom",
    photo: "photo",
    ai: "community",
    compare: "compare",
    trending: "trending",
    brands: "brand",
    guide: "guide",
    community: "community",
    service: "service",
    shop: "shop",
    home: "home",
  };
  return {
    type: typeMap[page] ?? "search",
    vehicleId: ctx?.vehicleId,
    batteryCode: ctx?.batteryCode,
    symptomId: ctx?.symptomId,
    guideId: ctx?.guideId,
    query: ctx?.query,
  };
}

export function getNextActions(context: NavContext, limit = MAX_ACTIONS): ActionLink[] {
  const v = context.vehicleId ? getVehicle(context.vehicleId) : primaryVehicle(context);
  const code = primaryBattery(context);
  const b = getBattery(code);
  const s = context.symptomId ? getSymptom(context.symptomId) : primarySymptom(context);
  const compareTarget = b.compareWith[0] ?? "DIN74L";

  const pool: ActionLink[] = [];

  switch (context.type) {
    case "vehicle":
      pool.push(
        { title: "배터리 비교", description: `${code} vs ${compareTarget}`, href: compareHref(code, compareTarget) },
        { title: "사진으로 규격 확인", description: `${code} 단자·라벨`, href: photoHref(code, v.id) },
        { title: "관련 가이드", description: v.displayName, href: guideArticleHref(v.id) },
        { title: "상품 확인", description: code, href: shopForBattery(code) },
        { title: "Q&A 보기", description: v.displayName, href: communityHref(v.displayName) },
        { title: "작업 가능점 찾기", description: "교체·BMS", href: serviceHref(v.id, code) },
      );
      break;
    case "battery":
      pool.push(
        { title: "적용 차량 보기", description: v.displayName, href: vehicleHref(v.id) },
        { title: "비슷한 규격 비교", description: `${code} vs ${compareTarget}`, href: compareHref(code, compareTarget) },
        { title: "오주문 방지 체크", description: "주문 전 확인", href: HUB_ORDER_CHECKLIST },
        { title: "사진 확인 안내", description: "라벨·단자", href: HUB_PHOTO_CHECK },
        { title: "Q&A 보기", description: code, href: communityHref(code) },
        { title: "매장·택배 안내", description: "이용 방법", href: HUB_SERVICE },
      );
      break;
    case "guide":
      pool.push(
        { title: "관련 차량 보기", description: v.displayName, href: vehicleHref(v.id) },
        { title: "관련 배터리", description: code, href: batteryDetailHref(code) },
        { title: "비교하기", description: `${code} vs ${compareTarget}`, href: compareHref(code, compareTarget) },
        { title: "질문 보기", description: "비슷한 Q&A", href: communityHref(v.displayName) },
        { title: "사진으로 규격 확인", description: code, href: photoHref(code, v.id) },
        { title: "상품 확인", description: code, href: shopForBattery(code) },
      );
      break;
    case "question":
    case "community":
      pool.push(
        { title: "배터리 규격 검색", description: code, href: searchHref(code) },
        { title: "배터리 비교", description: compareTarget, href: compareHref(code, compareTarget) },
        { title: "차량별 규격 확인", description: v.displayName, href: vehicleHref(v.id) },
        { title: "사진으로 규격 확인", description: code, href: photoHref(code, v.id) },
        { title: "관련 가이드", description: "오주문·규격", href: guideArticleHref(v.id) },
      );
      break;
    case "symptom":
      pool.push(
        { title: "증상별 안내", description: "전체 증상", href: HUB_SYMPTOMS },
        { title: "추천 배터리 확인", description: code, href: batteryDetailHref(code) },
        { title: "사진 확인 안내", description: "보조 검증", href: HUB_PHOTO_CHECK },
        { title: "오주문 방지", description: "체크리스트", href: HUB_ORDER_CHECKLIST },
        { title: "배터리 비교", description: compareTarget, href: compareHref(code, compareTarget) },
        { title: "매장·출장", description: v.displayName, href: HUB_SERVICE },
      );
      break;
    case "photo":
      pool.push(
        { title: "배터리 규격 검색", description: code, href: searchHref(code) },
        { title: "차량별 규격 확인", description: v.displayName, href: vehicleHref(v.id) },
        { title: "비교하기", description: compareTarget, href: compareHref(code, compareTarget) },
        { title: "오주문 방지 가이드", description: "AGM/DIN", href: guideHref("wrong-spec") },
        { title: "상품 확인", description: code, href: shopForBattery(code) },
      );
      break;
    case "compare":
      pool.push(
        { title: "배터리 상세", description: code, href: batteryDetailHref(code) },
        { title: "오주문 방지 체크", description: "단자·규격", href: HUB_ORDER_CHECKLIST },
        { title: "사진 확인 안내", description: "보조 검증", href: HUB_PHOTO_CHECK },
        { title: "차량별 규격 확인", description: v.displayName, href: vehicleHref(v.id) },
        { title: "증상 진단", description: "방전·시동", href: HUB_SYMPTOMS },
        { title: "Q&A 보기", description: code, href: communityHref(code) },
      );
      break;
    case "shop":
      pool.push(
        { title: "배터리 비교", description: `${code} vs ${compareTarget}`, href: compareHref(code, compareTarget) },
        { title: "사진으로 규격 확인", description: code, href: photoHref(code, v.id) },
        { title: "차량별 규격 확인", description: v.displayName, href: vehicleHref(v.id) },
        { title: "작업 가능점 찾기", description: "교체·문의", href: serviceHref(v.id, code) },
      );
      break;
    case "brand":
      pool.push(
        { title: "배터리 규격 검색", description: code, href: searchHref(code) },
        { title: "브랜드 비교", description: "로케트 vs 쏠라이트", href: compareHref("AGM80L", "CMF80L") },
        { title: "차량별 규격 확인", description: "차종별 배터리 안내", href: "/vehicles" },
        { title: "규격 문의", description: "Q&A", href: aiHref(code) },
      );
      break;
    case "service":
      pool.push(
        { title: "차량별 규격 확인", description: v.displayName, href: vehicleHref(v.id) },
        { title: "사진으로 규격 확인", description: code, href: photoHref(code, v.id) },
        { title: "증상 확인", description: s.title, href: diagnosisHref(s.id) },
        { title: "관련 가이드", description: "교체 전 확인", href: guideHref(v.guideIds[0]) },
      );
      break;
    case "trending":
      pool.push(
        { title: "배터리 규격 검색", description: "차량·규격", href: searchHref(context.query ?? code) },
        { title: "배터리 비교", description: compareTarget, href: compareHref(code, compareTarget) },
        { title: "사진으로 규격 확인", description: code, href: photoHref(code, v.id) },
        { title: "증상 확인", description: s.title, href: diagnosisHref(s.id) },
        { title: "작업 가능점 찾기", description: v.displayName, href: serviceHref(v.id, code) },
      );
      break;
    case "search":
      pool.push(
        { title: "차량별 규격 확인", description: v.displayName, href: vehicleHref(v.id) },
        { title: "배터리 비교", description: `${code} vs ${compareTarget}`, href: compareHref(code, compareTarget) },
        { title: "오주문 방지 체크", description: "주문 전", href: HUB_ORDER_CHECKLIST },
        { title: "증상별 안내", description: s.title, href: HUB_SYMPTOMS },
        { title: "사진 확인 안내", description: code, href: HUB_PHOTO_CHECK },
        { title: "매장·택배", description: v.displayName, href: HUB_SERVICE },
      );
      break;
    case "home":
      pool.push(
        { title: "차종 검색", description: "연식·연료", href: "/vehicles" },
        { title: "규격 비교", description: "헷갈리는 규격", href: "/compare" },
        { title: "증상 진단", description: "방전·시동", href: HUB_SYMPTOMS },
        { title: "오주문 방지", description: "체크리스트", href: HUB_ORDER_CHECKLIST },
        { title: "사진 확인", description: "보조 검증", href: HUB_PHOTO_CHECK },
        { title: "Q&A·가이드", description: "고객 질문", href: "/guides" },
      );
      break;
    default:
      pool.push(
        { title: "차량별 규격 확인", description: "차종별 배터리 안내", href: "/vehicles" },
        { title: "배터리 비교", description: "AGM70L vs AGM80L", href: compareHref("AGM70L", "AGM80L") },
        { title: "오주문 방지", description: "체크리스트", href: HUB_ORDER_CHECKLIST },
        { title: "증상 진단", description: "시동·방전", href: HUB_SYMPTOMS },
        { title: "사진 확인", description: "안내", href: HUB_PHOTO_CHECK },
        { title: "매장·택배", description: "이용 안내", href: HUB_SERVICE },
      );
  }

  return dedupeActions(pool).slice(0, limit);
}

function guideArticleHref(vehicleId: string): string {
  const articles = getArticlesByVehicleId(vehicleId);
  if (articles[0]) return `/guides/${articles[0].id}`;
  return "/guides";
}

export function getRelatedVehicles(context: NavContext, limit = 4): RelatedLink[] {
  const id = context.vehicleId ?? primaryVehicle(context).id;
  const v = getVehicle(id);
  const b = getBattery(primaryBattery(context));
  return vehicles
    .filter((x) => x.id !== id && (b.vehicleIds.includes(x.id) || x.brand === v.brand || x.batteryCode === v.batteryCode))
    .slice(0, limit)
    .map((x) => ({ label: x.displayName, meta: x.batteryCode, href: vehicleHref(x.id) }));
}

export function getRelatedBatteries(context: NavContext, limit = 4): RelatedLink[] {
  const b = getBattery(primaryBattery(context));
  const codes = [...new Set([b.code, ...b.compareWith, ...(context.batteryIds ?? [])])];
  return codes.slice(0, limit).map((c) => {
    const bat = getBattery(c);
    return { label: c, meta: `${bat.capacity} · ${bat.type}`, href: batteryDetailHref(c) };
  });
}

export function getRelatedGuides(context: NavContext, limit = 4): RelatedLink[] {
  const vid = context.vehicleId ?? primaryVehicle(context).id;
  const articles = getArticlesByVehicleId(vid);
  if (articles.length) {
    return articles.slice(0, limit).map((a) => ({
      label: a.title,
      meta: a.category,
      href: `/guides/${a.id}`,
    }));
  }
  const v = getVehicle(vid);
  return v.guideIds.slice(0, limit).map((id) => ({
    label: getGuide(id).title,
    meta: "가이드",
    href: guideHref(id),
  }));
}

export function getRelatedQuestions(context: NavContext, limit = 4): RelatedLink[] {
  const vid = context.vehicleId ?? primaryVehicle(context).id;
  const code = primaryBattery(context);
  const matched = questions.filter(
    (q) => q.vehicleId === vid || q.batteryCode === code || (context.query && q.title.includes(context.query)),
  );
  return (matched.length ? matched : questions).slice(0, limit).map((q) => ({
    label: q.title.length > 40 ? `${q.title.slice(0, 38)}…` : q.title,
    meta: "Q&A",
    href: aiHref(q.title),
  }));
}

export function getRelatedComparisons(context: NavContext, limit = 4): RelatedLink[] {
  const code = primaryBattery(context);
  const b = getBattery(code);
  const pairs: RelatedLink[] = b.compareWith.map((c) => ({
    label: `${code} vs ${c}`,
    meta: "비교",
    href: compareHref(code, c),
  }));
  if (b.type === "AGM") {
    pairs.push({ label: "AGM80L vs DIN74L", meta: "오주문", href: compareHref("AGM80L", "DIN74L") });
  }
  return pairs.slice(0, limit);
}

export function getRelatedShops(context: NavContext, limit = 3): RelatedLink[] {
  const code = primaryBattery(context);
  const products = shopProducts.filter((p) => p.batteryCode === code || code.includes(p.batteryCode));
  const list = products.length ? products : shopProducts.filter((p) => p.type === getBattery(code).type);
  return list.slice(0, limit).map((p) => ({
    label: p.batteryCode,
    meta: `${p.price.toLocaleString()}원`,
    href: shopForBattery(p.batteryCode),
  }));
}

export function getRelatedServiceCenters(context: NavContext, limit = 3): RelatedLink[] {
  const code = primaryBattery(context);
  const vid = context.vehicleId ?? primaryVehicle(context).id;
  const centers = getEnrichedServiceCenters().filter(
    (sc) => sc.vehicleIds.includes(vid) || sc.batteries.some((b) => b.includes(code)),
  );
  return (centers.length ? centers : getEnrichedServiceCenters())
    .slice(0, limit)
    .map((sc) => ({ label: sc.name, meta: sc.region, href: serviceHref(vid, code) }));
}

export type SearchResultGroup = {
  type: "vehicle" | "battery" | "guide" | "question" | "symptom" | "brand" | "service";
  label: string;
  items: (RelatedLink & { actions?: ActionLink[] })[];
};

export function getSearchResultGroups(query: string): SearchResultGroup[] {
  const q = query.trim();
  if (!q) return [];
  const ctx = buildContextFromSearch(q);
  const intent = classifySearch(q);
  const groups: SearchResultGroup[] = [];

  if (intent.vehicle) {
    const vehicle = intent.vehicle;
    groups.push({
      type: "vehicle",
      label: "차량",
      items: [{
        label: vehicle.displayName,
        meta: vehicle.batteryCode,
        href: vehicleHref(vehicle.id),
        actions: getNextActions(buildContextFromVehicle(vehicle.id), 4),
      }],
    });
  }

  if (intent.battery) {
    const bat = intent.battery;
    groups.push({
      type: "battery",
      label: "배터리",
      items: [{
        label: bat.code,
        meta: `${bat.capacity} · ${bat.type}`,
        href: batteryDetailHref(bat.code),
        actions: getNextActions(buildContextFromBattery(bat.code), 4),
      }],
    });
  }

  const guideArticles = getArticlesByVehicleId(ctx.vehicleId ?? "").filter(
    (a) => a.title.includes(q) || a.tags.some((t) => q.includes(t)),
  );
  if (guideArticles.length) {
    groups.push({
      type: "guide",
      label: "가이드",
      items: guideArticles.slice(0, 3).map((a) => ({
        label: a.title,
        meta: a.category,
        href: `/guides/${a.id}`,
      })),
    });
  }

  const matchedQuestions = questions.filter((x) => x.title.includes(q) || x.tags.some((t) => q.includes(t)));
  if (matchedQuestions.length) {
    groups.push({
      type: "question",
      label: "Q&A",
      items: matchedQuestions.slice(0, 3).map((x) => ({
        label: x.title,
        meta: x.category,
        href: aiHref(x.title),
      })),
    });
  }

  if (intent.symptom) {
    groups.push({
      type: "symptom",
      label: "증상",
      items: [{
        label: intent.symptom.title,
        meta: "증상 확인",
        href: diagnosisHref(intent.symptom.id),
        actions: getNextActions(buildContextFromSymptom(intent.symptom.id), 3),
      }],
    });
  }

  if (["rocket", "solite", "로케트", "쏠라이트"].some((b) => q.toLowerCase().includes(b))) {
    groups.push({
      type: "brand",
      label: "브랜드",
      items: [{ label: "브랜드 허브", meta: "규격·표기", href: "/brands" }],
    });
  }

  if (ctx.vehicleId || ctx.batteryCode) {
    groups.push({ type: "service", label: "작업 가능점", items: getRelatedServiceCenters(ctx, 2) });
  }

  return groups;
}

export function getRelatedBundle(context: NavContext) {
  return {
    vehicles: getRelatedVehicles(context),
    batteries: getRelatedBatteries(context),
    guides: getRelatedGuides(context),
    questions: getRelatedQuestions(context),
    comparisons: getRelatedComparisons(context),
    shops: getRelatedShops(context),
    serviceCenters: getRelatedServiceCenters(context),
    nextActions: getNextActions(context),
  };
}
