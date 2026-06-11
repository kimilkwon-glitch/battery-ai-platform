import "server-only";

import { normalizeSweetTrackerResponse } from "@/lib/delivery/sweettracker-normalize";
import type { SweetTrackerTrackingInfoResponse } from "@/lib/delivery/sweettracker-types";

const SWEETTRACKER_TRACKING_URL = "https://info.sweettracker.co.kr/api/v1/trackingInfo";

export function isSweetTrackerConfigured(): boolean {
  return Boolean(process.env.SWEETTRACKER_API_KEY?.trim());
}

/** 스윗트래커 REST API 호출 — t_code·t_invoice만 전송 */
export async function fetchSweetTrackerTracking(
  courierCode: string,
  invoiceNumber: string,
) {
  const apiKey = process.env.SWEETTRACKER_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false as const,
      message: "배송조회 API 설정이 아직 완료되지 않았습니다.",
    };
  }

  const url = new URL(SWEETTRACKER_TRACKING_URL);
  url.searchParams.set("t_key", apiKey);
  url.searchParams.set("t_code", courierCode);
  url.searchParams.set("t_invoice", invoiceNumber);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      next: { revalidate: 0 },
    });
  } catch {
    return {
      ok: false as const,
      message: "배송조회 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  if (!res.ok) {
    return {
      ok: false as const,
      message: "배송조회 서비스 응답 오류입니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  let raw: SweetTrackerTrackingInfoResponse;
  try {
    raw = (await res.json()) as SweetTrackerTrackingInfoResponse;
  } catch {
    return {
      ok: false as const,
      message: "배송조회 결과를 해석하지 못했습니다.",
    };
  }

  return normalizeSweetTrackerResponse(courierCode, invoiceNumber, raw);
}
