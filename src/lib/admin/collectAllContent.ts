/**
 * 사이트 콘텐츠 원본 수집 — 모든 JSON/아티클 소스를 AdminContentItem으로 normalize
 */
import adminRealJson from "@/data/admin/adminContent.real.json";
import adminSampleJson from "@/data/admin/adminContent.sample.json";
import qnaJson from "@/data/qna/questions.json";
import symptomRulesJson from "@/data/diagnosis/symptom-rules.json";
import hubGuidesJson from "@/data/content/hub-guides.json";
import sorentoMq4 from "@/data/content/articles/sorento-mq4-hybrid-agm60l.json";
import porter2Guide from "@/data/content/articles/porter2-year-battery-guide.json";
import stariaGuide from "@/data/content/articles/staria-agm80r-guide.json";
import grandeurGuide from "@/data/content/articles/grandeur-ig-fuel-battery-guide.json";
import g80Guide from "@/data/content/articles/g80-rg3-agm95r-guide.json";
import { FALLBACK_MESSAGES } from "@/data/common/fallback";
import type {
  AdminContentItem,
  AdminContentStatus,
  AdminContentType,
} from "@/data/admin/adminContent.schema";
import {
  defaultAdminContentItem,
  thumbnailTypeForContentType,
} from "@/data/admin/adminContent.schema";
import type { Article } from "@/lib/content";

const SOURCE = {
  adminReal: "src/data/admin/adminContent.real.json",
  adminSample: "src/data/admin/adminContent.sample.json",
  workbench: "src/data/admin/contentWorkbench.json",
  qna: "src/data/qna/questions.json",
  symptoms: "src/data/diagnosis/symptom-rules.json",
  hubGuides: "src/data/content/hub-guides.json",
  articles: "src/data/content/articles",
  photoFallback: "src/data/common/fallback.ts",
} as const;

const ARTICLE_FILES: { file: string; data: Article }[] = [
  { file: "sorento-mq4-hybrid-agm60l.json", data: sorentoMq4 as Article },
  { file: "porter2-year-battery-guide.json", data: porter2Guide as Article },
  { file: "staria-agm80r-guide.json", data: stariaGuide as Article },
  { file: "grandeur-ig-fuel-battery-guide.json", data: grandeurGuide as Article },
  { file: "g80-rg3-agm95r-guide.json", data: g80Guide as Article },
];

function ensureItem(raw: Partial<AdminContentItem>): AdminContentItem {
  return defaultAdminContentItem({
    ...raw,
    relatedVehicleIds: raw.relatedVehicleIds ?? [],
    relatedBatteryIds: raw.relatedBatteryIds ?? [],
    relatedSpecIds: raw.relatedSpecIds ?? [],
    relatedGuideIds: raw.relatedGuideIds ?? [],
    relatedQaIds: raw.relatedQaIds ?? [],
    tags: raw.tags ?? [],
    sourceFile: raw.sourceFile ?? "",
  });
}

function mapArticleStatus(status: string): AdminContentStatus {
  if (status === "published") return "published";
  if (status === "draft") return "draft";
  return "needs_review";
}

function mapQnaStatus(status: string): AdminContentStatus {
  if (status === "답변완료" || status === "전문가답변") return "published";
  if (status === "답변중") return "draft";
  return "needs_review";
}

function articleToItem(article: Article, fileName: string): AdminContentItem {
  const isCaution = article.category === "오주문 방지";
  const type: AdminContentType = isCaution ? "caution" : "guide";
  const body = article.sections.map((s) => `${s.heading}\n${s.body}`).join("\n\n");
  return ensureItem({
    id: article.id,
    type,
    title: article.title,
    summary: article.description,
    body,
    category: article.category,
    tags: article.tags,
    status: mapArticleStatus(article.status),
    relatedVehicleIds: article.vehicleIds,
    relatedBatteryIds: article.batteryIds,
    relatedSpecIds: article.batteryIds,
    relatedGuideIds: [article.id],
    relatedQaIds: [],
    thumbnailType: thumbnailTypeForContentType(type),
    priority: isCaution ? 15 : 10,
    updatedAt: article.updatedAt,
    createdAt: article.createdAt,
    memo: "",
    sourceFile: `${SOURCE.articles}/${fileName}`,
    slug: article.id,
    publicPath: `/guides/${article.id}`,
  });
}

function normalizeArticles(): AdminContentItem[] {
  return ARTICLE_FILES.map(({ file, data }) => articleToItem(data, file));
}

type HubGuide = {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  tags: string[];
  batteryCodes: string[];
  vehicleIds: string[];
  status: string;
};

function normalizeHubGuides(): AdminContentItem[] {
  const root = hubGuidesJson as { guides: HubGuide[] };
  return (root.guides ?? []).map((g) => {
    const isCaution = g.category === "오주문 방지" || g.id === "wrong-spec" || g.id === "terminal-lr";
    const type: AdminContentType = isCaution ? "caution" : "guide";
    return ensureItem({
      id: g.id,
      type,
      title: g.title,
      summary: g.summary,
      body: g.body,
      category: g.category,
      tags: g.tags,
      status: mapArticleStatus(g.status),
      relatedVehicleIds: g.vehicleIds,
      relatedBatteryIds: g.batteryCodes,
      relatedSpecIds: g.batteryCodes,
      relatedGuideIds: [g.id],
      relatedQaIds: [],
      thumbnailType: thumbnailTypeForContentType(type),
      priority: isCaution ? 14 : 8,
      updatedAt: "2026-05-25",
      createdAt: "2026-05-01",
      memo: "",
      sourceFile: SOURCE.hubGuides,
      slug: g.id,
      publicPath: `/guide/spec?guide=${g.id}`,
    });
  });
}

function normalizeQnaItems(): AdminContentItem[] {
  const root = qnaJson as {
    questions: Array<{
      questionId: string;
      title: string;
      shortAnswer: string;
      detailAnswer: string;
      category: string;
      tags: string[];
      relatedVehicleIds?: string[];
      relatedBatteryIds?: string[];
      relatedGuideIds?: string[];
      status: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
  return (root.questions ?? []).map((q) =>
    ensureItem({
      id: q.questionId,
      type: "qa",
      title: q.title,
      summary: q.shortAnswer,
      body: q.detailAnswer,
      category: q.category,
      tags: q.tags,
      status: mapQnaStatus(q.status),
      relatedVehicleIds: q.relatedVehicleIds ?? [],
      relatedBatteryIds: q.relatedBatteryIds ?? [],
      relatedSpecIds: q.relatedBatteryIds ?? [],
      relatedGuideIds: q.relatedGuideIds ?? [],
      relatedQaIds: [q.questionId],
      thumbnailType: "qa",
      priority: 8,
      updatedAt: q.updatedAt,
      createdAt: q.createdAt,
      memo: "",
      sourceFile: SOURCE.qna,
      slug: q.questionId,
      publicPath: `/community?q=${encodeURIComponent(q.title)}`,
    }),
  );
}

function normalizeSymptomItems(): AdminContentItem[] {
  const root = symptomRulesJson as {
    rules: Array<{
      symptomId: string;
      symptomName: string;
      description: string;
      relatedBatteries?: string[];
      relatedGuides?: string[];
      urgencyLevel?: string;
      warningText?: string;
    }>;
  };
  return (root.rules ?? []).map((r) =>
    ensureItem({
      id: `symptom-${r.symptomId}`,
      type: "symptom",
      title: r.symptomName,
      summary: r.description,
      body: [r.description, r.warningText].filter(Boolean).join("\n"),
      category: "증상진단",
      tags: [r.symptomId, r.urgencyLevel ?? "점검"].filter(Boolean),
      status: "published",
      relatedVehicleIds: [],
      relatedBatteryIds: r.relatedBatteries ?? [],
      relatedSpecIds: r.relatedBatteries ?? [],
      relatedGuideIds: r.relatedGuides ?? [],
      relatedQaIds: [],
      thumbnailType: "symptom",
      priority: 12,
      updatedAt: "2026-05-25",
      createdAt: "2026-05-01",
      memo: "",
      sourceFile: SOURCE.symptoms,
      slug: r.symptomId,
      publicPath: `/diagnosis/${r.symptomId}`,
    }),
  );
}

function normalizePhotoAnalysisItems(): AdminContentItem[] {
  const photo = FALLBACK_MESSAGES.photoAnalysis;
  return [
    ensureItem({
      id: "photo-analysis-disclaimer",
      type: "photo_analysis",
      title: photo.title,
      summary: photo.body.slice(0, 120),
      body: photo.body,
      category: "사진분석",
      tags: ["사진", "라벨", "단자", "보조안내"],
      status: "published",
      relatedVehicleIds: [],
      relatedBatteryIds: [],
      relatedSpecIds: [],
      relatedGuideIds: ["terminal-lr"],
      relatedQaIds: [],
      thumbnailType: "photo_analysis",
      priority: 10,
      updatedAt: "2026-05-25",
      createdAt: "2026-05-20",
      memo: "사진분석 페이지 보조 안내",
      sourceFile: SOURCE.photoFallback,
      slug: "photo-analysis",
      publicPath: "/analysis/photo",
    }),
  ];
}

function normalizeAdminJsonItems(json: AdminContentItem[], sourceFile: string): AdminContentItem[] {
  return json
    .filter((x) => x?.id)
    .map((x) =>
      ensureItem({
        ...x,
        sourceFile: x.sourceFile || sourceFile,
        thumbnailType: x.thumbnailType ?? thumbnailTypeForContentType(x.type),
      }),
    );
}

/** 모든 원본 소스에서 콘텐츠 수집 (중복 id는 먼저 등장한 항목 유지) */
export function collectAllAdminContentItems(): AdminContentItem[] {
  const batches: AdminContentItem[][] = [
    normalizeAdminJsonItems(adminRealJson as AdminContentItem[], SOURCE.adminReal),
    normalizeArticles(),
    normalizeHubGuides(),
    normalizeQnaItems(),
    normalizeSymptomItems(),
    normalizePhotoAnalysisItems(),
    normalizeAdminJsonItems(adminSampleJson as AdminContentItem[], SOURCE.adminSample),
  ];

  const seen = new Set<string>();
  const out: AdminContentItem[] = [];
  for (const batch of batches) {
    for (const item of batch) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
  }
  return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.title.localeCompare(b.title, "ko"));
}

/** 발견된 콘텐츠 원본 파일 목록 */
export const CONTENT_SOURCE_FILES = [
  SOURCE.adminReal,
  SOURCE.adminSample,
  SOURCE.workbench,
  SOURCE.qna,
  SOURCE.symptoms,
  SOURCE.hubGuides,
  `${SOURCE.articles}/sorento-mq4-hybrid-agm60l.json`,
  `${SOURCE.articles}/porter2-year-battery-guide.json`,
  `${SOURCE.articles}/staria-agm80r-guide.json`,
  `${SOURCE.articles}/grandeur-ig-fuel-battery-guide.json`,
  `${SOURCE.articles}/g80-rg3-agm95r-guide.json`,
  SOURCE.photoFallback,
  "src/lib/platform-data.ts (guides/questions 인라인 — hub-guides.json으로 스냅샷)",
  "src/lib/inquiry-hub-data.ts (규격 문의 UI 칩)",
  "src/lib/diagnosis-data.ts (증상 상세 UI)",
] as const;

export function isConnectionMissing(item: AdminContentItem): boolean {
  const hasTitle = item.title.trim().length > 0;
  const hasBody = item.body.trim().length > 0;
  const hasLinks =
    item.relatedVehicleIds.length > 0 ||
    item.relatedBatteryIds.length > 0 ||
    item.relatedSpecIds.length > 0;
  if (hasTitle && hasBody && !hasLinks) return true;
  return !hasLinks && (hasTitle || hasBody);
}

export type AdminContentStats = {
  total: number;
  published: number;
  draft: number;
  needsReview: number;
  hidden: number;
  missingLinks: number;
  byType: Record<AdminContentType, number>;
};

export function getAdminContentStats(items: AdminContentItem[]): AdminContentStats {
  const byType = {} as Record<AdminContentType, number>;
  for (const item of items) {
    byType[item.type] = (byType[item.type] ?? 0) + 1;
  }
  return {
    total: items.length,
    published: items.filter((i) => i.status === "published").length,
    draft: items.filter((i) => i.status === "draft").length,
    needsReview: items.filter((i) => i.status === "needs_review").length,
    hidden: items.filter((i) => i.status === "hidden").length,
    missingLinks: items.filter(isConnectionMissing).length,
    byType,
  };
}

export function filterAdminContentItems(
  items: AdminContentItem[],
  opts: {
    query?: string;
    type?: AdminContentType | "all";
    status?: AdminContentStatus | "all";
    category?: string;
  },
): AdminContentItem[] {
  const q = (opts.query ?? "").trim().toLowerCase();
  return items.filter((item) => {
    if (opts.type && opts.type !== "all" && item.type !== opts.type) return false;
    if (opts.status && opts.status !== "all" && item.status !== opts.status) return false;
    if (opts.category && opts.category !== "all" && item.category !== opts.category) return false;
    if (!q) return true;
    const hay = `${item.title} ${item.summary} ${item.category} ${item.tags.join(" ")} ${item.id}`.toLowerCase();
    return hay.includes(q);
  });
}

export function getAdminCategories(items: AdminContentItem[]): string[] {
  return [...new Set(items.map((i) => i.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ko"));
}

export { thumbnailTypeForContentType };
