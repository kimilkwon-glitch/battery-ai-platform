import "server-only";

import { ensureOperationalSchema } from "@/lib/db/ensure-operational-schema";
import { getSql } from "@/lib/db/postgres";
import type {
  ClaimHistoryRecord,
  ClaimReasonCode,
  ClaimStatus,
  ClaimType,
  CommerceClaimRecord,
  CommerceClaimSummary,
} from "@/types/commerce-claim";
import type { CommerceOrderRecord } from "@/types/commerce-payment";

type ClaimRow = {
  id: string;
  order_id: string;
  order_number: string;
  claim_type: string;
  claim_status: string;
  reason_code: string;
  reason_text: string | null;
  customer_message: string;
  customer_name: string;
  customer_phone: string;
  attachment_urls: string[];
  admin_memo: string | null;
  customer_reply: string | null;
  needs_customer_notice: boolean;
  assigned_to: string | null;
  order_status: string;
  payment_status: string;
  product_name: string;
  battery_code: string;
  fulfillment_type: string;
  return_battery_option: string;
  final_amount: number | null;
  delivery_fee: number;
  promotion_discount_total: number | null;
  estimated_refund_amount: number | null;
  requested_at: string;
  reviewed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type HistoryRow = {
  id: string;
  claim_id: string;
  previous_status: string | null;
  next_status: string;
  memo: string | null;
  actor_type: string;
  actor_name: string | null;
  created_at: string;
};

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function rowToClaim(row: ClaimRow): CommerceClaimRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    orderNumber: row.order_number,
    claimType: row.claim_type as ClaimType,
    claimStatus: row.claim_status as ClaimStatus,
    reasonCode: row.reason_code as ClaimReasonCode,
    reasonText: row.reason_text ?? undefined,
    customerMessage: row.customer_message,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    attachmentUrls: Array.isArray(row.attachment_urls) ? row.attachment_urls : [],
    adminMemo: row.admin_memo ?? "",
    customerReply: row.customer_reply ?? undefined,
    needsCustomerNotice: row.needs_customer_notice,
    assignedTo: row.assigned_to ?? undefined,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status,
    productName: row.product_name,
    batteryCode: row.battery_code,
    fulfillmentType: row.fulfillment_type,
    returnBatteryOption: row.return_battery_option,
    finalAmount: row.final_amount,
    deliveryFee: row.delivery_fee,
    promotionDiscountTotal: row.promotion_discount_total ?? undefined,
    estimatedRefundAmount: row.estimated_refund_amount,
    requestedAt: row.requested_at,
    reviewedAt: row.reviewed_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSummary(row: CommerceClaimRecord): CommerceClaimSummary {
  return {
    id: row.id,
    orderId: row.orderId,
    orderNumber: row.orderNumber,
    claimType: row.claimType,
    claimStatus: row.claimStatus,
    reasonCode: row.reasonCode,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    productName: row.productName,
    fulfillmentType: row.fulfillmentType,
    orderStatus: row.orderStatus,
    paymentStatus: row.paymentStatus,
    assignedTo: row.assignedTo,
    requestedAt: row.requestedAt,
    updatedAt: row.updatedAt,
  };
}

function rowToHistory(row: HistoryRow): ClaimHistoryRecord {
  return {
    id: row.id,
    claimId: row.claim_id,
    previousStatus: (row.previous_status as ClaimStatus | null) ?? null,
    nextStatus: row.next_status as ClaimStatus,
    memo: row.memo ?? undefined,
    actorType: row.actor_type as ClaimHistoryRecord["actorType"],
    actorName: row.actor_name ?? undefined,
    createdAt: row.created_at,
  };
}

export type ClaimCreateInput = {
  order: CommerceOrderRecord;
  claimType: ClaimType;
  reasonCode: ClaimReasonCode;
  reasonText?: string;
  customerMessage: string;
  customerName: string;
  customerPhone: string;
  attachmentUrls?: string[];
  estimatedRefundAmount?: number | null;
};

export type ClaimListFilters = {
  claimType?: ClaimType | "all" | null;
  claimStatus?: ClaimStatus | "all" | null;
  q?: string | null;
  orderId?: string | null;
  limit?: number;
};

export async function claimCreate(input: ClaimCreateInput): Promise<CommerceClaimRecord> {
  await ensureOperationalSchema();
  const sql = getSql();
  const now = new Date().toISOString();
  const order = input.order;
  const id = newId("clm");
  const row: CommerceClaimRecord = {
    id,
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    claimType: input.claimType,
    claimStatus: "REQUESTED",
    reasonCode: input.reasonCode,
    reasonText: input.reasonText?.trim() || undefined,
    customerMessage: input.customerMessage.trim(),
    customerName: input.customerName.trim() || order.customerName,
    customerPhone: input.customerPhone.trim() || order.customerPhone,
    attachmentUrls: input.attachmentUrls?.filter(Boolean) ?? [],
    adminMemo: "",
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    productName: order.productName,
    batteryCode: order.batteryCode,
    fulfillmentType: order.fulfillmentType,
    returnBatteryOption: order.returnBatteryOption,
    finalAmount: order.finalAmount,
    deliveryFee: order.deliveryFee,
    promotionDiscountTotal: order.promotionDiscountTotal,
    estimatedRefundAmount: input.estimatedRefundAmount ?? order.finalAmount,
    requestedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await sql`
    INSERT INTO commerce_claims (
      id, order_id, order_number, claim_type, claim_status, reason_code, reason_text,
      customer_message, customer_name, customer_phone, attachment_urls, admin_memo,
      order_status, payment_status, product_name, battery_code, fulfillment_type,
      return_battery_option, final_amount, delivery_fee, promotion_discount_total,
      estimated_refund_amount, requested_at, created_at, updated_at
    ) VALUES (
      ${row.id}, ${row.orderId}, ${row.orderNumber}, ${row.claimType}, ${row.claimStatus},
      ${row.reasonCode}, ${row.reasonText ?? null}, ${row.customerMessage}, ${row.customerName},
      ${row.customerPhone}, ${JSON.stringify(row.attachmentUrls)}, ${row.adminMemo},
      ${row.orderStatus}, ${row.paymentStatus}, ${row.productName}, ${row.batteryCode},
      ${row.fulfillmentType}, ${row.returnBatteryOption}, ${row.finalAmount}, ${row.deliveryFee},
      ${row.promotionDiscountTotal ?? 0}, ${row.estimatedRefundAmount ?? null},
      ${row.requestedAt}, ${row.createdAt}, ${row.updatedAt}
    )
  `;

  await sql`
    INSERT INTO commerce_claim_histories (
      id, claim_id, previous_status, next_status, memo, actor_type, actor_name, created_at
    ) VALUES (
      ${newId("clh")}, ${id}, ${null}, ${"REQUESTED"}, ${"고객 요청 접수"},
      ${"customer"}, ${row.customerName}, ${now}
    )
  `;

  return row;
}

export async function claimList(filters: ClaimListFilters = {}): Promise<CommerceClaimSummary[]> {
  await ensureOperationalSchema();
  const sql = getSql();
  const limit = filters.limit ?? 500;
  let rows: ClaimRow[];

  if (filters.orderId) {
    rows = (await sql`
      SELECT * FROM commerce_claims WHERE order_id = ${filters.orderId}
      ORDER BY updated_at DESC LIMIT ${limit}
    `) as ClaimRow[];
  } else if (filters.claimStatus && filters.claimStatus !== "all") {
    rows = (await sql`
      SELECT * FROM commerce_claims WHERE claim_status = ${filters.claimStatus}
      ORDER BY updated_at DESC LIMIT ${limit}
    `) as ClaimRow[];
  } else if (filters.claimType && filters.claimType !== "all") {
    rows = (await sql`
      SELECT * FROM commerce_claims WHERE claim_type = ${filters.claimType}
      ORDER BY updated_at DESC LIMIT ${limit}
    `) as ClaimRow[];
  } else {
    rows = (await sql`
      SELECT * FROM commerce_claims ORDER BY updated_at DESC LIMIT ${limit}
    `) as ClaimRow[];
  }

  let claims = rows.map(rowToClaim);
  const type = filters.claimType?.trim();
  if (type && type !== "all") claims = claims.filter((r) => r.claimType === type);
  const status = filters.claimStatus?.trim();
  if (status && status !== "all") claims = claims.filter((r) => r.claimStatus === status);
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    claims = claims.filter((r) => {
      const hay = [r.orderNumber, r.customerName, r.customerPhone, r.productName, r.batteryCode, r.customerMessage]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }
  return claims.map(toSummary);
}

export async function claimGetById(id: string): Promise<CommerceClaimRecord | null> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM commerce_claims WHERE id = ${id} LIMIT 1`) as ClaimRow[];
  return rows[0] ? rowToClaim(rows[0]) : null;
}

export async function claimListByOrderId(orderId: string): Promise<CommerceClaimRecord[]> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM commerce_claims WHERE order_id = ${orderId} ORDER BY created_at DESC
  `) as ClaimRow[];
  return rows.map(rowToClaim);
}

export async function claimListHistories(claimId: string): Promise<ClaimHistoryRecord[]> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM commerce_claim_histories WHERE claim_id = ${claimId} ORDER BY created_at DESC
  `) as HistoryRow[];
  return rows.map(rowToHistory);
}

export async function claimUpdate(
  id: string,
  patch: Partial<
    Pick<
      CommerceClaimRecord,
      | "claimStatus"
      | "adminMemo"
      | "customerReply"
      | "needsCustomerNotice"
      | "assignedTo"
      | "reviewedAt"
      | "completedAt"
    >
  >,
  history?: {
    previousStatus: ClaimStatus | null;
    nextStatus: ClaimStatus;
    memo?: string;
    actorType: "admin" | "system";
    actorName?: string;
  },
): Promise<CommerceClaimRecord | null> {
  await ensureOperationalSchema();
  const sql = getSql();
  const prev = await claimGetById(id);
  if (!prev) return null;
  const now = new Date().toISOString();
  const next: CommerceClaimRecord = { ...prev, ...patch, updatedAt: now };

  await sql`
    UPDATE commerce_claims SET
      claim_status = ${next.claimStatus},
      admin_memo = ${next.adminMemo ?? ""},
      customer_reply = ${next.customerReply ?? null},
      needs_customer_notice = ${next.needsCustomerNotice ?? false},
      assigned_to = ${next.assignedTo ?? null},
      reviewed_at = ${next.reviewedAt ?? null},
      completed_at = ${next.completedAt ?? null},
      updated_at = ${now}
    WHERE id = ${id}
  `;

  if (history) {
    await sql`
      INSERT INTO commerce_claim_histories (
        id, claim_id, previous_status, next_status, memo, actor_type, actor_name, created_at
      ) VALUES (
        ${newId("clh")}, ${id}, ${history.previousStatus}, ${history.nextStatus},
        ${history.memo ?? null}, ${history.actorType}, ${history.actorName ?? null}, ${now}
      )
    `;
  }
  return next;
}

export type ClaimTransitionInput = {
  expectedStatuses: ClaimStatus[];
  nextStatus: ClaimStatus;
  patch?: Partial<
    Pick<
      CommerceClaimRecord,
      | "adminMemo"
      | "customerReply"
      | "needsCustomerNotice"
      | "assignedTo"
      | "reviewedAt"
      | "completedAt"
    >
  >;
  history?: {
    previousStatus: ClaimStatus | null;
    nextStatus: ClaimStatus;
    memo?: string;
    actorType: "admin" | "system";
    actorName?: string;
  };
};

export type ClaimTransitionResult =
  | { ok: true; claim: CommerceClaimRecord; transitioned: boolean }
  | { ok: false; code: string; message: string; status: number; claim?: CommerceClaimRecord };

export async function claimTransitionStatus(
  id: string,
  input: ClaimTransitionInput,
): Promise<ClaimTransitionResult> {
  await ensureOperationalSchema();
  const sql = getSql();
  const prev = await claimGetById(id);
  if (!prev) {
    return { ok: false, code: "NOT_FOUND", message: "요청을 찾을 수 없습니다.", status: 404 };
  }

  if (prev.claimStatus === input.nextStatus) {
    return { ok: true, claim: prev, transitioned: false };
  }

  const now = new Date().toISOString();
  const merged = {
    adminMemo: input.patch?.adminMemo ?? prev.adminMemo,
    customerReply: input.patch?.customerReply ?? prev.customerReply,
    needsCustomerNotice: input.patch?.needsCustomerNotice ?? prev.needsCustomerNotice,
    assignedTo: input.patch?.assignedTo ?? prev.assignedTo,
    reviewedAt: input.patch?.reviewedAt ?? prev.reviewedAt,
    completedAt: input.patch?.completedAt ?? prev.completedAt,
  };

  const rows = (await sql`
    UPDATE commerce_claims SET
      claim_status = ${input.nextStatus},
      admin_memo = ${merged.adminMemo ?? ""},
      customer_reply = ${merged.customerReply ?? null},
      needs_customer_notice = ${merged.needsCustomerNotice ?? false},
      assigned_to = ${merged.assignedTo ?? null},
      reviewed_at = ${merged.reviewedAt ?? null},
      completed_at = ${merged.completedAt ?? null},
      updated_at = ${now}
    WHERE id = ${id}
      AND claim_status = ANY(${input.expectedStatuses})
    RETURNING id
  `) as { id: string }[];

  if (!rows[0]) {
    const refreshed = await claimGetById(id);
    if (refreshed?.claimStatus === input.nextStatus) {
      return { ok: true, claim: refreshed, transitioned: false };
    }
    return {
      ok: false,
      code: "CLAIM_TRANSITION_CONFLICT",
      message: "다른 관리자가 먼저 처리했거나 상태가 변경되었습니다.",
      status: 409,
      claim: refreshed ?? undefined,
    };
  }

  if (input.history) {
    await sql`
      INSERT INTO commerce_claim_histories (
        id, claim_id, previous_status, next_status, memo, actor_type, actor_name, created_at
      ) VALUES (
        ${newId("clh")}, ${id}, ${input.history.previousStatus}, ${input.history.nextStatus},
        ${input.history.memo ?? null}, ${input.history.actorType}, ${input.history.actorName ?? null}, ${now}
      )
    `;
  }

  const claim = await claimGetById(id);
  if (!claim) {
    return { ok: false, code: "NOT_FOUND", message: "요청을 찾을 수 없습니다.", status: 404 };
  }
  return { ok: true, claim, transitioned: true };
}
