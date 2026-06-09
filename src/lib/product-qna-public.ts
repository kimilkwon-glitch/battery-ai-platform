import type { CustomerInquiryRecord, InquiryStatus } from "@/types/customer-inquiry";

export type ProductQnaPublicItem = {
  id: string;
  title: string;
  summary: string;
  authorMasked: string;
  createdAt: string;
  statusLabel: "답변대기" | "답변완료";
  isSecret: boolean;
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

export function toProductQnaPublicItem(record: CustomerInquiryRecord): ProductQnaPublicItem {
  const isSecret = record.isSecret === true;
  const title = record.title?.trim() || "상품 문의";
  const question = extractQuestionBody(record.message, record.title);
  const answered = record.status === "done" || Boolean(record.adminMemo?.trim());
  const displayTitle = isSecret ? "비밀글입니다" : title;
  const displayQuestion = isSecret
    ? "작성자와 관리자만 확인할 수 있습니다."
    : question;
  return {
    id: record.id,
    title: displayTitle,
    summary: isSecret ? displayTitle : extractSummary(title || question),
    authorMasked: maskInquiryAuthor(record.name),
    createdAt: record.createdAt,
    statusLabel: answered ? "답변완료" : "답변대기",
    isSecret,
    question: displayQuestion,
    answer: isSecret ? undefined : record.adminMemo?.trim() || undefined,
  };
}

export function inquiryStatusForPublic(status: InquiryStatus): ProductQnaPublicItem["statusLabel"] {
  return status === "done" ? "답변완료" : "답변대기";
}
