import type { CustomerInquiryRecord } from "@/types/customer-inquiry";
import {
  canViewSecretProductQna,
  type ProductQnaViewerContext,
} from "@/lib/inquiry/product-qna-viewer.server";

export type ProductQnaPublicItem = {
  id: string;
  title: string;
  summary: string;
  authorMasked: string;
  createdAt: string;
  statusLabel: "답변대기" | "답변완료";
  isSecret: boolean;
  /** 작성자·관리자만 true — 비밀글 본문 열람 가능 */
  canViewContent: boolean;
  question: string;
  answer?: string;
};

export function maskInquiryAuthor(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "고객";
  if (trimmed.length === 1) return `${trimmed}*`;
  if (trimmed.length === 2) return `${trimmed[0]}*`;
  return `${trimmed[0]}${"*".repeat(Math.min(trimmed.length - 2, 2))}${trimmed.slice(-1)}`;
}

function extractQuestionBody(message: string, title?: string): string {
  if (title?.trim()) return message.trim();
  const lines = message
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("[상품문의]") && !l.startsWith("문의 유형:"));
  const contentLine = lines.find((l) => l.startsWith("내용:"));
  if (contentLine) return contentLine.replace(/^내용:\s*/, "");
  return lines.join(" ").trim() || message.trim();
}

function extractSummary(question: string): string {
  const oneLine = question.replace(/\s+/g, " ").trim();
  if (oneLine.length <= 48) return oneLine;
  return `${oneLine.slice(0, 48)}…`;
}

export function toProductQnaPublicItem(
  record: CustomerInquiryRecord,
  viewer?: ProductQnaViewerContext,
): ProductQnaPublicItem {
  const isSecret = record.isSecret === true;
  const canViewContent = !isSecret || (viewer ? canViewSecretProductQna(record, viewer) : false);
  const title = record.title?.trim() || "상품 문의";
  const question = extractQuestionBody(record.message, record.title);
  const answered = record.status === "done" || Boolean(record.adminMemo?.trim());
  const displayTitle = canViewContent ? title : "비밀글입니다";
  const displayQuestion = canViewContent
    ? question
    : "작성자와 관리자만 확인할 수 있습니다.";
  const answer = record.adminMemo?.trim() || undefined;
  return {
    id: record.id,
    title: displayTitle,
    summary: canViewContent ? extractSummary(title || question) : "비밀글입니다",
    authorMasked: maskInquiryAuthor(record.name),
    createdAt: record.createdAt,
    statusLabel: answered ? "답변완료" : "답변대기",
    isSecret,
    canViewContent,
    question: displayQuestion,
    answer: canViewContent ? answer : undefined,
  };
}

export function inquiryStatusForPublic(status: CustomerInquiryRecord["status"]): ProductQnaPublicItem["statusLabel"] {
  return status === "done" ? "답변완료" : "답변대기";
}
