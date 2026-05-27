import type { Article } from "./content";

export type ArticleDraft = Omit<Article, "status"> & { status: "draft" };

/**
 * OpenAI API 연동 예정 — 현재는 mock 초안만 반환합니다.
 * 발행은 관리자가 status를 published로 변경한 뒤에만 이루어집니다.
 */
export async function generateArticleDraft(
  vehicleId: string,
  batteryId: string,
): Promise<ArticleDraft> {
  // TODO: OpenAI Chat Completions API로 제목·본문·태그 초안 생성
  const id = `${vehicleId}-${batteryId}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  return {
    id,
    title: `${vehicleId} ${batteryId} 배터리 확인 가이드 (초안)`,
    description: `${vehicleId} 차량의 ${batteryId} 규격 확인 시 주의할 점을 정리한 초안입니다.`,
    category: "차종별 규격",
    vehicleIds: [vehicleId],
    batteryIds: [batteryId],
    tags: [vehicleId, batteryId],
    status: "draft",
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    heroImagePrompt: "",
    imagePrompts: [],
    sections: [{ heading: "초안", body: "OpenAI API 연동 후 자동 생성됩니다." }],
    cta: { label: "내 차량 배터리 확인하기", href: `/vehicle/${vehicleId}` },
  };
}

export async function generateImagePromptsForArticle(article: Article | ArticleDraft): Promise<string[]> {
  // TODO: OpenAI API로 heroImagePrompt + imagePrompts 배열 생성
  const base = article.heroImagePrompt || `Clean battery guide image for ${article.title}, no text, blue white background`;
  return [
    base,
    `Product card style battery image for ${article.batteryIds.join(", ")}, professional ecommerce`,
    `Vehicle silhouette with battery specification cards, Korean automotive service style, no logos`,
    `Maintenance scene checking battery terminal direction, realistic clean photo style`,
    `Comparison layout showing fuel types and battery options, minimal UI background`,
  ];
}

export function validateArticleDraft(article: Partial<ArticleDraft>): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!article.id?.trim()) errors.push("id가 필요합니다.");
  if (!article.title?.trim()) errors.push("title이 필요합니다.");
  if (!article.description?.trim()) errors.push("description이 필요합니다.");
  if (!article.sections?.length) errors.push("sections가 최소 1개 필요합니다.");
  if (article.status !== "draft") errors.push("초안은 status: draft 여야 합니다.");
  return { ok: errors.length === 0, errors };
}

export async function saveArticleDraft(article: ArticleDraft): Promise<{ saved: boolean; path: string }> {
  const validation = validateArticleDraft(article);
  if (!validation.ok) {
    throw new Error(validation.errors.join(" "));
  }
  // TODO: 파일 시스템 또는 CMS API에 draft JSON 저장
  // 현재는 클라이언트/서버 파일 쓰기 없이 mock 응답
  const path = `/src/data/content/articles/${article.id}.json`;
  console.info("[aiContentDraft] draft ready (not persisted):", path);
  return { saved: false, path };
}
