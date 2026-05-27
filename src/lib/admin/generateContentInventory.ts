import type { AdminContentItem, AdminContentType } from "@/data/admin/adminContent.schema";
import {
  ADMIN_CONTENT_STATUS_LABELS,
  ADMIN_CONTENT_TYPE_LABELS,
} from "@/data/admin/adminContent.schema";
import { getAdminContentStats, isConnectionMissing } from "./collectAllContent";

function joinList(values: string[]) {
  return values.length ? values.join(", ") : "—";
}

function sectionForType(type: AdminContentType, items: AdminContentItem[]): string {
  const label = ADMIN_CONTENT_TYPE_LABELS[type];
  const filtered = items.filter((i) => i.type === type);
  if (!filtered.length) return `## ${label}\n\n_(해당 유형 콘텐츠 없음)_\n`;

  return `## ${label}\n\n${filtered
    .map((item) => {
      const isQa = item.type === "qa";
      const lines = [
        `### ${item.id}`,
        `- 제목: ${item.title}`,
        `- 상태: ${ADMIN_CONTENT_STATUS_LABELS[item.status]}`,
        `- 카테고리: ${item.category || "—"}`,
        `- 태그: ${joinList(item.tags)}`,
        `- 관련 차량: ${joinList(item.relatedVehicleIds)}`,
        `- 관련 배터리: ${joinList(item.relatedBatteryIds)}`,
        `- 관련 규격: ${joinList(item.relatedSpecIds)}`,
        `- 요약: ${item.summary || "—"}`,
        isQa ? `- 짧은 답변: ${item.summary || "—"}` : null,
        `- 본문:`,
        "",
        item.body ? item.body.slice(0, 800) + (item.body.length > 800 ? "…" : "") : "—",
        "",
        isQa ? `- 상세 답변: ${item.body || "—"}` : null,
        `- thumbnailType: ${item.thumbnailType}`,
        `- 원본 파일: ${item.sourceFile || "—"}`,
        `- 공개 경로: ${item.publicPath || "—"}`,
        `- 메모: ${item.memo || "—"}`,
        "",
        "---",
        "",
      ];
      return lines.filter((l) => l !== null).join("\n");
    })
    .join("\n")}\n`;
}

export function generateContentInventoryMarkdown(items: AdminContentItem[]): string {
  const stats = getAdminContentStats(items);
  const missing = items.filter(isConnectionMissing);
  const needsReview = items.filter((i) => i.status === "needs_review");

  const typeLines = Object.entries(ADMIN_CONTENT_TYPE_LABELS)
    .map(([key, label]) => `- ${label}: ${stats.byType[key as AdminContentType] ?? 0}`)
    .join("\n");

  const missingList =
    missing.length === 0
      ? "_(없음)_"
      : missing.map((m) => `- \`${m.id}\` · ${m.title} · ${m.sourceFile}`).join("\n");

  const needsReviewList =
    needsReview.length === 0
      ? "_(없음)_"
      : needsReview.map((m) => `- \`${m.id}\` · ${m.title}`).join("\n");

  const sections = (
    ["guide", "qa", "symptom", "photo_analysis", "caution", "spec_inquiry", "shopping_notice", "brand_guide"] as AdminContentType[]
  )
    .map((t) => sectionForType(t, items))
    .join("\n");

  return `# Battery Manager 콘텐츠 인벤토리

> 자동 생성 문서 — \`npm run generate:content-workbench\` 로 갱신

## 요약

- 전체 콘텐츠: **${stats.total}**
${typeLines}
- published: **${stats.published}**
- draft: **${stats.draft}**
- needs_review: **${stats.needsReview}**
- hidden: **${stats.hidden}**
- 연결 누락: **${stats.missingLinks}**

## 연결 누락 콘텐츠

${missingList}

## 수정 필요 (needs_review)

${needsReviewList}

${sections}
`;
}

export function workbenchMeta(items: AdminContentItem[]) {
  return {
    generatedAt: new Date().toISOString(),
    itemCount: items.length,
    note: "수정 후 adminContent.real.json 또는 개별 원본 파일로 분배 import 예정",
  };
}
