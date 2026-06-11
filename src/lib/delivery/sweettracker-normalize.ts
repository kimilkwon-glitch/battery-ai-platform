import { deliveryCarrierName } from "@/lib/delivery/delivery-carriers";
import type {
  DeliveryTrackError,
  DeliveryTrackProgress,
  DeliveryTrackResult,
  SweetTrackerTrackingDetail,
  SweetTrackerTrackingInfoResponse,
} from "@/lib/delivery/sweettracker-types";

function detailToProgress(d: SweetTrackerTrackingDetail): DeliveryTrackProgress {
  return {
    time: d.timeString?.trim() || "—",
    location: d.where?.trim() || "—",
    status: d.kind?.trim() || "—",
    description: [d.kind, d.remark].filter(Boolean).join(" · ") || d.kind?.trim() || "—",
  };
}

export function normalizeSweetTrackerResponse(
  courierCode: string,
  invoiceNumber: string,
  raw: SweetTrackerTrackingInfoResponse,
): DeliveryTrackResult | DeliveryTrackError {
  if (raw.status === false) {
    const msg = raw.msg?.trim();
    return {
      ok: false,
      message:
        msg ||
        "택배사 집화 전이거나 운송장 정보가 아직 반영되지 않았습니다. 잠시 후 다시 조회해 주세요.",
    };
  }

  const details = raw.trackingDetails ?? [];
  const progresses = details.length
    ? details.map(detailToProgress)
    : raw.lastDetail
      ? [detailToProgress(raw.lastDetail)]
      : raw.lastStateDetail
        ? [detailToProgress(raw.lastStateDetail)]
        : [];

  const lastDetail = details[details.length - 1] ?? raw.lastDetail ?? raw.lastStateDetail;
  const statusFromDetail = lastDetail?.kind?.trim();
  const status =
    raw.complete === true || raw.completeYN === "Y"
      ? statusFromDetail
        ? `배송완료 · ${statusFromDetail}`
        : "배송완료"
      : statusFromDetail || "배송 조회됨";

  return {
    ok: true,
    carrier: {
      code: courierCode,
      name: deliveryCarrierName(courierCode) ?? courierCode,
    },
    invoiceNumber,
    status,
    lastUpdatedAt: lastDetail?.timeString?.trim() || null,
    progresses,
  };
}

/** UI·단위 테스트용 mock (외부 API 호출 없음) */
export function mockDeliveryTrackResult(
  courierCode: string,
  invoiceNumber: string,
  phase: "in_transit" | "delivered" = "in_transit",
): DeliveryTrackResult {
  const now = new Date();
  const fmt = (d: Date) =>
    d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const base: DeliveryTrackProgress[] = [
    {
      time: fmt(new Date(now.getTime() - 48 * 3600_000)),
      location: "부산터미널",
      status: "집화",
      description: "상품이 접수되었습니다.",
    },
    {
      time: fmt(new Date(now.getTime() - 24 * 3600_000)),
      location: "대구허브",
      status: "간선상차",
      description: "간선 구간으로 이동 중입니다.",
    },
  ];

  if (phase === "delivered") {
    base.push({
      time: fmt(now),
      location: "부산 사상구",
      status: "배송완료",
      description: "고객님께 상품이 전달되었습니다.",
    });
  } else {
    base.push({
      time: fmt(now),
      location: "부산 사상구",
      status: "배송중",
      description: "배송 기사님이 배송 중입니다.",
    });
  }

  return {
    ok: true,
    carrier: {
      code: courierCode,
      name: deliveryCarrierName(courierCode) ?? courierCode,
    },
    invoiceNumber,
    status: phase === "delivered" ? "배송완료 · 고객님께 전달" : "배송중 · 배송 기사님 이동 중",
    lastUpdatedAt: base[base.length - 1]!.time,
    progresses: base,
  };
}
