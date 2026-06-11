import "server-only";

import { put } from "@vercel/blob";
import { isProductionRuntime } from "@/lib/db/operational-store-config";

export type ReviewImageStorageKind = "blob" | "filesystem" | "inline";

export function isReviewBlobStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function getReviewImageStorageStatus(): {
  configured: boolean;
  backend: ReviewImageStorageKind | "unconfigured";
  message: string;
} {
  if (isReviewBlobStorageConfigured()) {
    return {
      configured: true,
      backend: "blob",
      message: "Vercel Blob",
    };
  }
  if (!isProductionRuntime()) {
    return {
      configured: true,
      backend: "filesystem",
      message: "로컬 개발 저장 (data/review-uploads)",
    };
  }
  return {
    configured: false,
    backend: "unconfigured",
    message:
      "리뷰 사진 저장소(BLOB_READ_WRITE_TOKEN)가 설정되지 않았습니다. Vercel 대시보드에서 Blob 스토어를 연결해 주세요.",
  };
}

export async function saveReviewImageToBlob(
  buffer: Buffer,
  mime: string,
  filename: string,
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  if (!isReviewBlobStorageConfigured()) {
    return {
      ok: false,
      message: getReviewImageStorageStatus().message,
    };
  }

  try {
    const blob = await put(`reviews/${filename}`, buffer, {
      access: "public",
      contentType: mime,
      addRandomSuffix: false,
    });
    return { ok: true, url: blob.url };
  } catch {
    return {
      ok: false,
      message: "사진을 클라우드 저장소에 업로드하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}
