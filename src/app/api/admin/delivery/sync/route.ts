import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import {
  DELIVERY_SYNC_DEFAULT_LIMIT,
  DELIVERY_SYNC_MAX_LIMIT,
} from "@/lib/delivery/delivery-sync-policy";
import { runDeliveryStatusSync, type DeliverySyncRequest } from "@/lib/delivery/delivery-sync.server";
import { isSweetTrackerConfigured } from "@/lib/delivery/sweettracker-fetch";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  if (!isSweetTrackerConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message: "배송조회 API 설정이 아직 완료되지 않았습니다.",
      },
      { status: 503 },
    );
  }

  let body: DeliverySyncRequest;
  try {
    body = (await request.json()) as DeliverySyncRequest;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (body.mode !== "selected" && body.mode !== "inTransit") {
    return NextResponse.json({ ok: false, message: "mode가 올바르지 않습니다." }, { status: 422 });
  }

  if (body.mode === "selected") {
    const ids = body.orderIds?.filter(Boolean) ?? [];
    if (ids.length === 0) {
      return NextResponse.json({ ok: false, message: "동기화할 주문을 선택해 주세요." }, { status: 422 });
    }
    if (ids.length > DELIVERY_SYNC_MAX_LIMIT) {
      return NextResponse.json(
        { ok: false, message: `한 번에 최대 ${DELIVERY_SYNC_MAX_LIMIT}건까지 확인할 수 있습니다.` },
        { status: 422 },
      );
    }
  }

  const limit =
    body.mode === "inTransit"
      ? Math.min(DELIVERY_SYNC_MAX_LIMIT, Math.max(1, body.limit ?? DELIVERY_SYNC_DEFAULT_LIMIT))
      : undefined;

  try {
    const result = await runDeliveryStatusSync({
      mode: body.mode,
      orderIds: body.orderIds,
      limit,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { ok: false, message: "배송상태 동기화 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
