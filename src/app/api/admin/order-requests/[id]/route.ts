import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import {
  getOrderRequestById,
  updateOrderRequest,
} from "@/lib/order-request/order-request-service";
import type {
  OrderRequestReviewFlag,
  OrderRequestWorkflowStatus,
  UpdateOrderRequestInput,
} from "@/types/order-request";

export const dynamic = "force-dynamic";

const WORKFLOW_STATUSES: OrderRequestWorkflowStatus[] = [
  "pending_review",
  "contacted",
  "waiting_customer",
  "quoted",
  "closed",
  "canceled",
];

const REVIEW_FLAGS: OrderRequestReviewFlag[] = [
  "vehicle_info_missing",
  "terminal_direction_unknown",
  "battery_spec_unknown",
  "used_battery_return_undecided",
  "visit_region_check_needed",
  "photo_check_needed",
  "phone_check_needed",
];

type Props = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Props) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { id } = await params;
  const record = await getOrderRequestById(id);
  if (!record) {
    return NextResponse.json({ ok: false, message: "요청을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, record });
}

export async function PATCH(request: Request, { params }: Props) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "JSON body required" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const patch: UpdateOrderRequestInput = {};

  if (b.status !== undefined) {
    const status = String(b.status);
    if (!WORKFLOW_STATUSES.includes(status as OrderRequestWorkflowStatus)) {
      return NextResponse.json({ ok: false, message: "잘못된 상태값입니다." }, { status: 422 });
    }
    patch.status = status as OrderRequestWorkflowStatus;
  }
  if (b.internalMemo !== undefined) {
    patch.internalMemo = String(b.internalMemo);
  }
  if (Array.isArray(b.reviewFlags)) {
    patch.reviewFlags = b.reviewFlags.filter((f) =>
      REVIEW_FLAGS.includes(f as OrderRequestReviewFlag),
    ) as OrderRequestReviewFlag[];
  }
  if (b.contactedAt !== undefined) {
    patch.contactedAt = b.contactedAt === null ? null : String(b.contactedAt);
  }
  if (b.closedAt !== undefined) {
    patch.closedAt = b.closedAt === null ? null : String(b.closedAt);
  }

  const record = await updateOrderRequest(id, patch);
  if (!record) {
    return NextResponse.json({ ok: false, message: "요청을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, record });
}
