import "server-only";

import { put } from "@vercel/blob";
import { isProductionRuntime } from "@/lib/db/operational-store-config";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const BANNER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(Object.keys(EXT_BY_MIME));

export function isBannerImageMime(mime: string): boolean {
  const lower = mime.toLowerCase();
  if (lower === "image/svg+xml" || lower.includes("svg")) return false;
  return ALLOWED.has(lower);
}

export function isBannerBlobStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export async function saveBannerImageToBlob(
  buffer: Buffer,
  mime: string,
  filename: string,
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  if (!isBannerBlobStorageConfigured()) {
    return {
      ok: false,
      message: isProductionRuntime()
        ? "이미지 저장소가 설정되지 않았습니다. BLOB_READ_WRITE_TOKEN을 확인해 주세요."
        : "로컬에서는 Blob 토큰을 설정하거나 고급 옵션 URL 입력을 사용해 주세요.",
    };
  }

  try {
    const blob = await put(`main-banners/${filename}`, buffer, {
      access: "public",
      contentType: mime,
      addRandomSuffix: false,
    });
    return { ok: true, url: blob.url };
  } catch {
    return {
      ok: false,
      message: "배너 이미지를 업로드하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export async function saveBannerUploadFile(
  buffer: Buffer,
  mime: string,
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  if (!isBannerImageMime(mime)) {
    return { ok: false, message: "JPG, PNG, WEBP 파일만 등록할 수 있습니다. SVG는 지원하지 않습니다." };
  }
  if (buffer.byteLength > BANNER_IMAGE_MAX_BYTES) {
    return { ok: false, message: "파일 용량은 5MB 이하여야 합니다." };
  }

  const ext = EXT_BY_MIME[mime.toLowerCase()] ?? "jpg";
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return saveBannerImageToBlob(buffer, mime, `${id}.${ext}`);
}
