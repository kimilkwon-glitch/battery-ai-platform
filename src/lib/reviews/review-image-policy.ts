export const REVIEW_IMAGE_MAX_COUNT = 5;
export const REVIEW_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const REVIEW_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const REVIEW_IMAGE_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";

const DATA_URL_RE =
  /^data:image\/(jpeg|jpg|png|webp);base64,[a-zA-Z0-9+/=]+$/;

export function isAllowedReviewImageMime(mime: string): boolean {
  return REVIEW_IMAGE_MIME_TYPES.includes(
    mime.toLowerCase() as (typeof REVIEW_IMAGE_MIME_TYPES)[number],
  );
}

export function isReviewImageRef(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (DATA_URL_RE.test(v)) {
    const approxBytes = Math.ceil((v.length * 3) / 4);
    return approxBytes <= REVIEW_IMAGE_MAX_BYTES;
  }
  if (v.startsWith("/api/reviews/media/")) return true;
  try {
    const url = new URL(v);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function normalizeReviewImages(urls: unknown): string[] {
  if (!Array.isArray(urls)) return [];
  const out: string[] = [];
  for (const raw of urls) {
    if (typeof raw !== "string") continue;
    const v = raw.trim();
    if (!v || !isReviewImageRef(v)) continue;
    if (out.includes(v)) continue;
    out.push(v);
    if (out.length >= REVIEW_IMAGE_MAX_COUNT) break;
  }
  return out;
}

export function reviewPrimaryImageUrl(images: string[]): string | null {
  const firstHttp = images.find((u) => !u.startsWith("data:"));
  return firstHttp ?? images[0] ?? null;
}
