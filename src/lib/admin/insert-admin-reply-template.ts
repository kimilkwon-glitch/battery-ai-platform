/** 답변 textarea에 템플릿 본문을 안전하게 삽입 */
export function insertAdminReplyTemplate(current: string, templateBody: string): string {
  const trimmed = current.trim();
  if (!trimmed) return templateBody;

  const replace = window.confirm(
    "작성 중인 내용이 있습니다.\n\n[확인] 템플릿으로 교체\n[취소] 아래에 추가",
  );
  if (replace) return templateBody;
  return `${trimmed}\n\n${templateBody}`;
}

export function previewAdminReplyTemplate(body: string, maxLen = 72): string {
  const oneLine = body.replace(/\s+/g, " ").trim();
  if (oneLine.length <= maxLen) return oneLine;
  return `${oneLine.slice(0, maxLen)}…`;
}
