import type {
  DeliveryTrackResult,
  SweetTrackerTrackingInfoResponse,
} from "@/lib/delivery/sweettracker-types";

function kindLooksDelivered(kind: string | undefined): boolean {
  const k = kind?.trim() ?? "";
  return k.includes("배송완료");
}

/** 스윗트래커 원본 응답 — 보수적 배송완료 판정 */
export function isRawSweetTrackerDelivered(raw: SweetTrackerTrackingInfoResponse): boolean {
  if (raw.complete === true || raw.completeYN === "Y") return true;
  const details = raw.trackingDetails ?? [];
  const last = details[details.length - 1] ?? raw.lastDetail ?? raw.lastStateDetail;
  return kindLooksDelivered(last?.kind);
}

/** 정규화된 조회 결과 — 보수적 배송완료 판정 */
export function isDeliveryTrackDelivered(result: DeliveryTrackResult): boolean {
  if (result.status.includes("배송완료")) return true;
  const last = result.progresses[result.progresses.length - 1];
  return kindLooksDelivered(last?.status);
}
