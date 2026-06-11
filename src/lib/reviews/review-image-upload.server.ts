import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { isProductionRuntime } from "@/lib/db/operational-store-config";
import {
  isAllowedReviewImageMime,
  REVIEW_IMAGE_MAX_BYTES,
} from "@/lib/reviews/review-image-policy";
import {
  getReviewImageStorageStatus,
  saveReviewImageToBlob,
  type ReviewImageStorageKind,
} from "@/lib/reviews/review-image-storage.server";

const UPLOAD_DIR = path.join(process.cwd(), "data", "review-uploads");

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type ReviewImageSaveResult =
  | { ok: true; url: string; storage: ReviewImageStorageKind }
  | { ok: true; dataUrl: string; storage: "inline" }
  | { ok: false; message: string; storageStatus?: string };

export async function saveReviewUploadFile(
  buffer: Buffer,
  mime: string,
): Promise<ReviewImageSaveResult> {
  if (!isAllowedReviewImageMime(mime)) {
    return { ok: false, message: "JPG, PNG, WEBP 파일만 등록할 수 있습니다." };
  }
  if (buffer.byteLength > REVIEW_IMAGE_MAX_BYTES) {
    return { ok: false, message: "파일 용량은 10MB 이하여야 합니다." };
  }

  const ext = EXT_BY_MIME[mime.toLowerCase()] ?? "jpg";
  const id = `${Date.now()}_${randomBytes(6).toString("hex")}`;
  const filename = `${id}.${ext}`;

  const blobSaved = await saveReviewImageToBlob(buffer, mime, filename);
  if (blobSaved.ok) {
    return { ok: true, url: blobSaved.url, storage: "blob" };
  }

  if (isProductionRuntime()) {
    return {
      ok: false,
      message: blobSaved.message,
      storageStatus: getReviewImageStorageStatus().message,
    };
  }

  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(filePath, buffer);
    return {
      ok: true,
      url: `/api/reviews/media/${filename}`,
      storage: "filesystem",
    };
  } catch {
    const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    if (dataUrl.length > REVIEW_IMAGE_MAX_BYTES * 1.4) {
      return { ok: false, message: "파일을 저장하지 못했습니다. 더 작은 사진을 사용해 주세요." };
    }
    return { ok: true, dataUrl, storage: "inline" };
  }
}

export function resolveReviewUploadPath(filename: string): string | null {
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return null;
  if (filename.includes("..")) return null;
  return path.join(UPLOAD_DIR, filename);
}
