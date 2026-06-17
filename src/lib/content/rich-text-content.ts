/** Rich text / plain text 호환 유틸 (client·server 공용) */

const HTML_TAG_RE = /<\/?[a-z][\s\S]*>/i;

export function looksLikeHtml(value: string): boolean {
  return HTML_TAG_RE.test((value ?? "").trim());
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** plain text adminMemo → 에디터 표시용 HTML (DB 저장값은 변경하지 않음) */
export function plainTextToEditorHtml(text: string): string {
  const raw = text ?? "";
  if (!raw.trim()) return "<p></p>";
  if (looksLikeHtml(raw)) return raw;

  return raw
    .split(/\n{2,}/)
    .map((block) => {
      const inner = escapeHtml(block).replace(/\n/g, "<br>");
      return `<p>${inner}</p>`;
    })
    .join("");
}

/** TipTap HTML → 저장용 비교 (공백·빈 문단 정규화) */
export function normalizeRichTextForCompare(html: string): string {
  return (html ?? "")
    .replace(/\s+/g, " ")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<br\s*\/?>/gi, "<br>")
    .trim()
    .toLowerCase();
}

/** plain text vs editor html 의미적 동일 여부 (무변경 저장 판단) */
export function isStoredContentUnchanged(stored: string, editorHtml: string): boolean {
  const raw = stored ?? "";
  if (raw === editorHtml) return true;

  const prepared = plainTextToEditorHtml(raw);
  if (normalizeRichTextForCompare(prepared) === normalizeRichTextForCompare(editorHtml)) {
    return true;
  }

  return false;
}
