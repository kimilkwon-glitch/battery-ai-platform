import "server-only";

import DOMPurify from "isomorphic-dompurify";

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

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [...ALLOWED_TAGS],
  ALLOWED_ATTR: [...ALLOWED_ATTR],
  ADD_ATTR: ["target"],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  ALLOWED_URI_REGEXP:
    /^(?:(?:https?):\/\/[^\s"'<>]+|mailto:[^\s"'<>]+|tel:[^\s"'<>]+|\/[^\s"'<>]*|#[\w\-./?=&%]*)$/i,
};

let hooksReady = false;

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

function ensureDomPurifyHooks(): void {
  if (hooksReady) return;
  hooksReady = true;

  DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
    const name = data.attrName.toLowerCase();
    if (name.startsWith("on")) {
      data.keepAttr = false;
      return;
    }
    if (name === "style" || name === "class" || name === "id" || name.startsWith("data-")) {
      data.keepAttr = false;
      return;
    }
    if (name === "href" || name === "src") {
      if (isBlockedUrl(data.attrValue)) {
        data.keepAttr = false;
      }
    }
  });

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      const href = node.getAttribute("href");
      const target = node.getAttribute("target");
      if (target === "_blank" || (href && /^https?:\/\//i.test(href))) {
        node.setAttribute("rel", "noopener noreferrer");
      }
    }
    if (node.tagName === "IMG") {
      const src = node.getAttribute("src");
      if (src && isBlockedUrl(src)) {
        node.removeAttribute("src");
      }
    }
  });
}

/** 공지 본문 HTML sanitize — 저장·출력 공통 */
export function sanitizeNoticeHtml(html: string): string {
  ensureDomPurifyHooks();
  return DOMPurify.sanitize(html ?? "", SANITIZE_CONFIG).trim();
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
