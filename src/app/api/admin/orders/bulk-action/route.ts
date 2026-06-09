import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { executeBulkOrderAction, type BulkOrderTarget } from "@/lib/admin/order-bulk-service";
import type { OrderBulkAction } from "@/lib/admin/order-workbench";

export const dynamic = "force-dynamic";

const ACTIONS: OrderBulkAction[] = [
  "confirm_order",
  "mark_preparing",
  "ship_order",
  "mark_delivered",
  "mark_work_completed",
  "mark_pickup_completed",
  "cancel_order",
  "save_admin_memo",
];

export async function POST(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  let body: {
    action?: OrderBulkAction;
    targets?: BulkOrderTarget[];
    shippingCarrier?: string;
    shippingTrackingNumber?: string;
    adminMemo?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const action = body.action;
  if (!action || !ACTIONS.includes(action)) {
    return NextResponse.json({ ok: false, message: "유효하지 않은 처리 유형입니다." }, { status: 400 });
  }

  const targets = body.targets?.filter((t) => t?.orderId && t?.channel) ?? [];
  if (targets.length === 0) {
    return NextResponse.json({ ok: false, message: "처리할 주문을 선택해 주세요." }, { status: 400 });
  }

  try {
    const { results } = await executeBulkOrderAction({
      action,
      targets,
      shippingCarrier: body.shippingCarrier,
      shippingTrackingNumber: body.shippingTrackingNumber,
      adminMemo: body.adminMemo,
    });

    const succeeded = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok);

    return NextResponse.json({
      ok: succeeded > 0,
      succeeded,
      failed: failed.length,
      results,
      message:
        failed.length > 0
          ? `${succeeded}건 처리, ${failed.length}건 실패`
          : `${succeeded}건 처리 완료`,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "일괄 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
