import "server-only";

import type { PutCommandOptions } from "@vercel/blob";

const BLOB_RW_TOKEN_PREFIX = "vercel_blob_rw_";

export type BlobStorageBackend = "oidc" | "readWrite" | "unconfigured";

export type BlobStorageStatus = {
  configured: boolean;
  backend: BlobStorageBackend;
  /** Safe internal code for logs — never expose token values. */
  reason?: string;
};

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value !== '""' && value !== "''" ? value : undefined;
}

export function parseStoreIdFromReadWriteToken(token: string): string | null {
  const parts = token.split("_");
  const storeId = parts[3];
  return storeId ? storeId : null;
}

export function isValidBlobReadWriteToken(token: string | undefined): token is string {
  if (!token) return false;
  if (token === '""' || token === "''") return false;
  return token.startsWith(BLOB_RW_TOKEN_PREFIX) && token.length > 32;
}

export function getBlobStorageStatus(): BlobStorageStatus {
  const storeId = readEnv("BLOB_STORE_ID");
  const oidcToken = readEnv("VERCEL_OIDC_TOKEN");
  const readWrite = readEnv("BLOB_READ_WRITE_TOKEN");

  if (oidcToken && storeId) {
    return { configured: true, backend: "oidc" };
  }

  if (isValidBlobReadWriteToken(readWrite)) {
    return { configured: true, backend: "readWrite" };
  }

  if (readWrite && !isValidBlobReadWriteToken(readWrite)) {
    return {
      configured: false,
      backend: "unconfigured",
      reason: "BLOB_READ_WRITE_TOKEN_INVALID",
    };
  }

  if (storeId && !oidcToken && !readWrite) {
    return {
      configured: false,
      backend: "unconfigured",
      reason: "BLOB_STORE_ID_WITHOUT_AUTH",
    };
  }

  return {
    configured: false,
    backend: "unconfigured",
    reason: "BLOB_STORAGE_NOT_CONFIGURED",
  };
}

export function isBlobStorageConfigured(): boolean {
  return getBlobStorageStatus().configured;
}

/** Resolve auth options for @vercel/blob put(). Prefers OIDC when store id is present. */
export function resolveBlobPutOptions(
  base: Pick<PutCommandOptions, "access" | "contentType" | "addRandomSuffix">,
): PutCommandOptions {
  const storeId = readEnv("BLOB_STORE_ID");
  const oidcToken = readEnv("VERCEL_OIDC_TOKEN");
  const readWrite = readEnv("BLOB_READ_WRITE_TOKEN");

  if (oidcToken && storeId) {
    const tokenStoreId = isValidBlobReadWriteToken(readWrite)
      ? parseStoreIdFromReadWriteToken(readWrite)
      : null;
    const normalizedStore = storeId.startsWith("store_") ? storeId.slice("store_".length) : storeId;
    if (tokenStoreId && tokenStoreId !== normalizedStore) {
      console.warn("[blob-auth] BLOB_STORE_ID mismatches token store; using read-write token");
      return { ...base, token: readWrite };
    }
    return { ...base, oidcToken, storeId };
  }

  if (isValidBlobReadWriteToken(readWrite)) {
    return { ...base, token: readWrite };
  }

  return base;
}

export function blobStorageMisconfiguredMessage(): string {
  const status = getBlobStorageStatus();
  if (status.reason === "BLOB_READ_WRITE_TOKEN_INVALID") {
    return "배너 이미지 저장소 설정이 완료되지 않았습니다. 관리자에게 문의해 주세요.";
  }
  return "배너 이미지 저장소 설정이 완료되지 않았습니다. 관리자에게 문의해 주세요.";
}

export type BlobUploadErrorKind =
  | "storage_misconfigured"
  | "access_denied"
  | "content_type"
  | "file_too_large"
  | "rate_limited"
  | "unknown";

export function classifyBlobUploadError(error: unknown): {
  kind: BlobUploadErrorKind;
  logCode: string;
  clientMessage: string;
  status: number;
} {
  const name = error instanceof Error ? error.constructor.name : "UnknownError";
  const message = error instanceof Error ? error.message : String(error);

  if (name === "BlobContentTypeNotAllowedError") {
    return {
      kind: "content_type",
      logCode: "BLOB_CONTENT_TYPE",
      clientMessage: "JPG, PNG, WEBP 파일만 업로드할 수 있습니다.",
      status: 415,
    };
  }
  if (name === "BlobFileTooLargeError") {
    return {
      kind: "file_too_large",
      logCode: "BLOB_FILE_TOO_LARGE",
      clientMessage: "파일 용량이 5MB를 초과했습니다.",
      status: 413,
    };
  }
  if (name === "BlobAccessError" || name === "BlobClientTokenExpiredError") {
    return {
      kind: "access_denied",
      logCode: "BLOB_ACCESS_DENIED",
      clientMessage: "배너 이미지 저장소 설정이 완료되지 않았습니다. 관리자에게 문의해 주세요.",
      status: 503,
    };
  }
  if (name === "BlobServiceRateLimited") {
    return {
      kind: "rate_limited",
      logCode: "BLOB_RATE_LIMITED",
      clientMessage: "업로드 요청이 많습니다. 잠시 후 다시 시도해 주세요.",
      status: 429,
    };
  }

  return {
    kind: "unknown",
    logCode: `BLOB_${name}`,
    clientMessage: "이미지 업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    status: 500,
  };
}

export function isFormDataFile(entry: FormDataEntryValue | null): entry is File {
  if (typeof entry === "string") return false;
  if (!entry || typeof entry !== "object") return false;
  if (typeof entry.size !== "number" || entry.size <= 0) return false;
  return typeof entry.arrayBuffer === "function";
}

export async function readUploadFile(entry: FormDataEntryValue): Promise<{
  buffer: Buffer;
  mime: string;
  name: string;
}> {
  const file = entry as File;
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "application/octet-stream";
  const name = "name" in file && typeof file.name === "string" ? file.name : "upload.bin";
  return { buffer, mime, name };
}
