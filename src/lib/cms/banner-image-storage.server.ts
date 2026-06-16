import "server-only";

import { put } from "@vercel/blob";
import { isProductionRuntime } from "@/lib/db/operational-store-config";
import {
  blobStorageMisconfiguredMessage,
  classifyBlobUploadError,
  getBlobStorageStatus,
  isBlobStorageConfigured,
  isValidBlobReadWriteToken,
  resolveBlobPutOptions,
} from "@/lib/cms/blob-storage-auth.server";

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
  return isBlobStorageConfigured();
}

export function getBannerBlobStorageStatus() {
  return getBlobStorageStatus();
}

export async function saveBannerImageToBlob(
  buffer: Buffer,
  mime: string,
  filename: string,
): Promise<
  | { ok: true; url: string; pathname: string }
  | { ok: false; message: string; status: number; logCode: string }
> {
  if (!isBannerBlobStorageConfigured()) {
    const status = getBlobStorageStatus();
    console.warn("[banner-upload] storage misconfigured", status.reason ?? "unknown");
    return {
      ok: false,
      message: isProductionRuntime()
        ? blobStorageMisconfiguredMessage()
        : "로컬에서는 Blob 토큰을 설정하거나 고급 옵션 URL 입력을 사용해 주세요.",
      status: 503,
      logCode: status.reason ?? "BLOB_STORAGE_NOT_CONFIGURED",
    };
  }

  try {
    const blob = await put(`main-banners/${filename}`, buffer, {
      ...resolveBlobPutOptions({
        access: "public",
        contentType: mime,
        addRandomSuffix: false,
      }),
    });
    return { ok: true, url: blob.url, pathname: blob.pathname };
  } catch (error) {
    const classified = classifyBlobUploadError(error);
    console.error("[banner-upload] blob put failed", classified.logCode, classified.kind);
    return {
      ok: false,
      message: classified.clientMessage,
      status: classified.status,
      logCode: classified.logCode,
    };
  }
}

export async function saveBannerUploadFile(
  buffer: Buffer,
  mime: string,
): Promise<
  | { ok: true; url: string; pathname: string }
  | { ok: false; message: string; status: number; logCode: string }
> {
  if (!isBannerImageMime(mime)) {
    return {
      ok: false,
      message: "JPG, PNG, WEBP 파일만 등록할 수 있습니다. SVG는 지원하지 않습니다.",
      status: 415,
      logCode: "BANNER_MIME_REJECTED",
    };
  }
  if (buffer.byteLength > BANNER_IMAGE_MAX_BYTES) {
    return {
      ok: false,
      message: "파일 용량은 5MB 이하여야 합니다.",
      status: 413,
      logCode: "BANNER_FILE_TOO_LARGE",
    };
  }

  const ext = EXT_BY_MIME[mime.toLowerCase()] ?? "jpg";
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return saveBannerImageToBlob(buffer, mime, `${id}.${ext}`);
}

export function isLikelyInvalidLegacyBlobToken(): boolean {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return Boolean(token && !isValidBlobReadWriteToken(token));
}
