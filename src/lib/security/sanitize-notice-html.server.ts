import "server-only";

import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "blockquote",
  "h2",
  "h3",
  "h4",
  "a",
  "img",
  "hr",
  "span",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
] as const;

const ALLOWED_ATTR = ["href", "title", "target", "rel", "src", "alt", "width", "height", "loading"] as const;

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height", "loading"],
};

function decodeForProtocolCheck(value: string): string {
  let decoded = value.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    /* keep original */
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
    lower.startsWith("file:") ||
    lower.includes("javascript:")
  );
}

function normalizeUrl(value?: string): string | undefined {
  if (!value) return undefined;
  if (isBlockedUrl(value)) return undefined;
  return value.trim();
}

function stripUnsafeAttribs(attribs: Record<string, string>): Record<string, string> {
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(attribs)) {
    const lower = key.toLowerCase();
    if (lower.startsWith("on") || lower === "style" || lower === "class" || lower === "id") continue;
    if (lower.startsWith("data-")) continue;
    next[key] = value;
  }
  return next;
}

function transformAnchor(tagName: string, attribs: Record<string, string>) {
  const next = stripUnsafeAttribs(attribs);
  const href = normalizeUrl(next.href);
  if (href) next.href = href;
  else delete next.href;

  if (next.target === "_blank" || (next.href && /^https?:\/\//i.test(next.href))) {
    next.rel = "noopener noreferrer";
  }

  return { tagName, attribs: next };
}

function transformImage(tagName: string, attribs: Record<string, string>) {
  const next = stripUnsafeAttribs(attribs);
  const src = normalizeUrl(next.src);
  if (src) next.src = src;
  else delete next.src;
  return { tagName, attribs: next };
}

/** 공지 본문 HTML sanitize — 저장·출력 공통 */
export function sanitizeNoticeHtml(html: string): string {
  return sanitizeHtml(html ?? "", {
    allowedTags: [...ALLOWED_TAGS],
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowProtocolRelative: false,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    transformTags: {
      a: transformAnchor,
      img: transformImage,
    },
  }).trim();
}

/** sanitize 후 텍스트가 남는지 (저장 거부용) */
export function isNoticeHtmlEffectivelyEmpty(html: string): boolean {
  const safe = sanitizeNoticeHtml(html);
  if (!safe) return true;
  const text = safe
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length === 0;
}

/** 저장용 — sanitize 후 빈 본문이면 null */
export function sanitizeNoticeHtmlForStorage(html: string): string | null {
  const safe = sanitizeNoticeHtml(html);
  if (isNoticeHtmlEffectivelyEmpty(safe)) return null;
  return safe;
}

export { ALLOWED_TAGS, ALLOWED_ATTR };
