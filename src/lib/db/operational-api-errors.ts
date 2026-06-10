import { NextResponse } from "next/server";
import {
  getOperationalStoreStatus,
  isOperationalStoreError,
  type OperationalStoreDomain,
} from "@/lib/db/operational-store-config";

export function operationalStoreStatusPayload() {
  return { store: getOperationalStoreStatus() };
}

export function operationalErrorResponse(
  err: unknown,
  fallbackMessage: string,
  domain?: OperationalStoreDomain,
): NextResponse {
  if (isOperationalStoreError(err) && err.code === "OPERATIONAL_DB_UNAVAILABLE") {
    return NextResponse.json(
      {
        ok: false,
        error: "OPERATIONAL_DB_UNAVAILABLE",
        domain: err.domain ?? domain,
        message: "운영 데이터 DB가 연결되지 않았습니다. DATABASE_URL을 설정해 주세요.",
        ...operationalStoreStatusPayload(),
      },
      { status: 503 },
    );
  }
  if (isOperationalStoreError(err)) {
    return NextResponse.json(
      {
        ok: false,
        error: err.code,
        message: err.message,
        ...operationalStoreStatusPayload(),
      },
      { status: 500 },
    );
  }
  return NextResponse.json(
    { ok: false, message: fallbackMessage, ...operationalStoreStatusPayload() },
    { status: 500 },
  );
}
