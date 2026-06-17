import sanitizeHtml from "sanitize-html";

const QNA_ANSWER_TAGS = ["p", "br", "strong", "b", "em", "i", "ul", "ol", "li", "a"] as const;

function decodeForProtocolCheck(value: string): string {
  let decoded = value.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    /* keep */
  }
  return decoded.replace(/\u0000/g, "").replace(/\s+/g, "").toLowerCase();
}

function isBlockedUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("//")) return true;
  const lower = decodeForProtocolCheck(trimmed);
  return (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("blob:") ||
    lower.startsWith("file:")
  );
}

function transformAnchor(tagName: string, attribs: Record<string, string>) {
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(attribs)) {
    const lower = key.toLowerCase();
    if (lower.startsWith("on") || lower === "style" || lower === "class" || lower === "id") continue;
    if (lower.startsWith("data-")) continue;
    next[key] = value;
  }
  const href = next.href?.trim();
  if (href && !isBlockedUrl(href)) {
    next.href = href;
    if (next.target === "_blank" || /^https?:\/\//i.test(href)) {
      next.rel = "noopener noreferrer";
    }
  } else {
    delete next.href;
  }
  return { tagName, attribs: next };
}

/** Q&A 답변 HTML sanitize — img·iframe·script 등 차단 */
export function sanitizeQnaAnswerHtml(html: string): string {
  return sanitizeHtml(html ?? "", {
    allowedTags: [...QNA_ANSWER_TAGS],
    allowedAttributes: { a: ["href", "title", "target", "rel"] },
    allowProtocolRelative: false,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: { a: transformAnchor },
  }).trim();
}

export function isQnaAnswerEffectivelyEmpty(html: string): boolean {
  const safe = sanitizeQnaAnswerHtml(html);
  if (!safe) return true;
  const text = safe
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length === 0;
}

export function sanitizeQnaAnswerForStorage(html: string): string | null {
  const safe = sanitizeQnaAnswerHtml(html);
  if (isQnaAnswerEffectivelyEmpty(safe)) return null;
  return safe;
}
