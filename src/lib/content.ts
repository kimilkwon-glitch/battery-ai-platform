export type ArticleSection = {
  heading: string;
  body: string;
};

export type ArticleCta = {
  label: string;
  href: string;
};

/** 가이드 허브 분류 — primary category */
export type GuideCategory =
  | "차종별 규격"
  | "연식·연료별 주의"
  | "배터리 규격 이해"
  | "오주문 방지"
  | "점검·관리 팁";

export type Article = {
  id: string;
  title: string;
  description: string;
  category: GuideCategory;
  secondaryCategories?: GuideCategory[];
  vehicleIds: string[];
  batteryIds: string[];
  tags: string[];
  status: "published" | "draft";
  createdAt: string;
  updatedAt: string;
  heroImagePrompt: string;
  imagePrompts: string[];
  sections: ArticleSection[];
  cta: ArticleCta;
  heroImage?: string;
  sectionImages?: string[];
  primaryBatteryImage?: string;
  fallbackVehicleImage?: string;
  generatedImages?: { hero?: string; sections?: string[] };
};

import sorentoMq4 from "@/data/content/articles/sorento-mq4-hybrid-agm60l.json";
import porter2Guide from "@/data/content/articles/porter2-year-battery-guide.json";
import stariaGuide from "@/data/content/articles/staria-agm80r-guide.json";
import grandeurGuide from "@/data/content/articles/grandeur-ig-fuel-battery-guide.json";
import g80Guide from "@/data/content/articles/g80-rg3-agm95r-guide.json";

const ALL_ARTICLES: Article[] = [
  sorentoMq4,
  porter2Guide,
  stariaGuide,
  grandeurGuide,
  g80Guide,
] as Article[];

/** @deprecated — GUIDE_FILTER_CATEGORIES 사용 */
export const ARTICLE_CATEGORIES = [
  "차종별 규격",
  "연식·연료별 주의",
  "배터리 규격 이해",
  "오주문 방지",
  "점검·관리 팁",
] as const;

export const GUIDE_FILTER_CATEGORIES = [
  { key: "all", label: "전체 가이드" },
  { key: "차종별 규격", label: "차종별 규격" },
  { key: "연식·연료별 주의", label: "연식·연료별 주의" },
  { key: "배터리 규격 이해", label: "배터리 규격 이해" },
  { key: "오주문 방지", label: "오주문 방지" },
  { key: "점검·관리 팁", label: "점검·관리 팁" },
] as const;

export type GuideFilterKey = (typeof GUIDE_FILTER_CATEGORIES)[number]["key"];

export const FEATURED_GUIDE_IDS = [
  "porter2-year-battery-guide",
  "staria-agm80r-guide",
  "sorento-mq4-hybrid-agm60l",
  "g80-rg3-agm95r-guide",
] as const;

export const RECENT_GUIDE_LIMIT = 4;
export const CATEGORY_PREVIEW_LIMIT = 2;

export function getAllArticles(includeDraft = false): Article[] {
  return ALL_ARTICLES.filter((a) => includeDraft || a.status === "published").sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getArticleById(id: string): Article | undefined {
  return ALL_ARTICLES.find((a) => a.id === id);
}

export function articleMatchesCategory(article: Article, category: GuideCategory): boolean {
  return article.category === category || (article.secondaryCategories?.includes(category) ?? false);
}

export function getArticlesByCategory(category: GuideCategory | string): Article[] {
  return getAllArticles().filter((a) => articleMatchesCategory(a, category as GuideCategory));
}

export function getGuideCategoryCount(category: GuideCategory): number {
  return getArticlesByCategory(category).length;
}

export function getGuideCategoryShortLabel(category: GuideCategory): string {
  if (category === "배터리 규격 이해") return "규격 이해";
  if (category === "점검·관리 팁") return "점검·관리";
  return category;
}

export function parseGuideFilterKey(value?: string | null): GuideFilterKey {
  if (!value || value === "all") return "all";
  const found = GUIDE_FILTER_CATEGORIES.find((c) => c.key === value);
  return found?.key ?? "all";
}

export function getRecentGuides(limit = RECENT_GUIDE_LIMIT): Article[] {
  return getAllArticles().slice(0, limit);
}

export function getFeaturedGuides(excludeIds: Set<string> = new Set()): Article[] {
  const articles = getAllArticles();
  const byId = new Map(articles.map((a) => [a.id, a]));
  const featured = FEATURED_GUIDE_IDS.map((id) => byId.get(id)).filter(Boolean) as Article[];
  const filtered = featured.filter((a) => !excludeIds.has(a.id));
  if (filtered.length >= FEATURED_GUIDE_IDS.length) return filtered.slice(0, FEATURED_GUIDE_IDS.length);
  const rest = articles.filter((a) => !excludeIds.has(a.id) && !filtered.some((f) => f.id === a.id));
  return [...filtered, ...rest].slice(0, FEATURED_GUIDE_IDS.length);
}

export function getCategoryPreviewSections(excludeIds: Set<string>): { category: GuideCategory; items: Article[] }[] {
  const categories = GUIDE_FILTER_CATEGORIES.filter((c) => c.key !== "all").map((c) => c.key as GuideCategory);
  return categories
    .map((category) => ({
      category,
      items: getArticlesByCategory(category)
        .filter((a) => !excludeIds.has(a.id))
        .slice(0, CATEGORY_PREVIEW_LIMIT),
    }))
    .filter((g) => g.items.length > 0);
}

export function getArticlesByVehicleId(vehicleId: string): Article[] {
  return getAllArticles().filter((a) => a.vehicleIds.includes(vehicleId));
}

export function getArticlesByBatteryId(batteryId: string): Article[] {
  return getAllArticles().filter((a) => a.batteryIds.includes(batteryId));
}

export function getVehicleHref(vehicleId: string): string {
  const knownSlugs = new Set([
    "sorento-mq4",
    "grandeur-ig",
    "porter2-new",
    "porter2-old",
    "staria-us4",
    "bmw-g30",
    "g80-rg3",
  ]);
  if (knownSlugs.has(vehicleId)) return `/vehicle/${vehicleId}`;
  return `/search?q=${encodeURIComponent(vehicleId.replace(/-/g, " "))}`;
}

export function getBatteryHref(batteryId: string): string {
  return `/batteries/${encodeURIComponent(batteryId)}`;
}

export function formatArticleDate(iso: string): string {
  const d = iso.slice(0, 10);
  const [y, m, day] = d.split("-");
  return `${y}.${m}.${day}`;
}
