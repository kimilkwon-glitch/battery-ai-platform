import "server-only";

import { randomBytes } from "node:crypto";
import { ensureCommerceSchema } from "@/lib/db/ensure-commerce-schema";
import { ensurePromotionSchema } from "@/lib/db/ensure-promotion-schema";
import { getSql, isPostgresConfigured } from "@/lib/db/postgres";
import {
  canStartPaymentConfirm,
  isPaymentStatusTerminal,
} from "@/lib/payment/commerce-payment-transition.server";
import { normalizePaymentKey } from "@/lib/payment/payment-key-normalize.server";
import type { CommerceOrderRecord } from "@/types/commerce-payment";

export type TossApprovedPayment = {
  paymentKey: string;
  orderId: string;
  method: string;
  status: string;
  totalAmount: number;
  approvedAt: string;
  receiptUrl?: string;
};

export type ClaimConfirmResult =
  | {
      ok: true;
      outcome: "idempotent_completed";
      order: CommerceOrderRecord;
    }
  | {
      ok: true;
      outcome: "claimed";
      order: CommerceOrderRecord;
      previousPaymentStatus: string;
    }
  | {
      ok: true;
      outcome: "resume_processing";
      order: CommerceOrderRecord;
    }
  | {
      ok: false;
      code: string;
      message: string;
      status: number;
    };

export type FinalizeConfirmResult =
  | {
      ok: true;
      order: CommerceOrderRecord;
      transitioned: boolean;
      alreadyCompleted: boolean;
    }
  | {
      ok: false;
      code: string;
      message: string;
    };

export type MarkReconcileResult =
  | { ok: true; order: CommerceOrderRecord }
  | { ok: false; code: string; message: string };

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${randomBytes(4).toString("hex")}`;
}

type PaymentRow = {
  id: string;
  order_id: string;
  payment_key: string | null;
  status: string;
  payment_request_id: string | null;
};

type OrderRow = {
  id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  payment_request_id: string | null;
  final_amount: number | null;
};

async function mapOrderRow(orderId: string): Promise<CommerceOrderRecord | null> {
  const { pgStoreCommerceOrderGet } = await import(
    "@/lib/payment/commerce-order-store.postgres"
  );
  return pgStoreCommerceOrderGet(orderId);
}

/**
 * confirm 선점 — order row FOR UPDATE + commerce_payments processing claim.
 * Vercel 다중 인스턴스에서도 DB 기준으로 단일 Toss confirm만 허용.
 */
export async function pgClaimPaymentConfirmOperation(input: {
  orderId: string;
  paymentKey: string;
  paymentRequestId?: string;
}): Promise<ClaimConfirmResult> {
  if (!isPostgresConfigured()) {
    return {
      ok: false,
      code: "COMMERCE_STORE_UNAVAILABLE",
      message: "주문 저장소를 사용할 수 없습니다.",
      status: 503,
    };
  }

  await ensureCommerceSchema();
  const sql = getSql();
  const paymentKey = normalizePaymentKey(input.paymentKey);
  if (!paymentKey) {
    return {
      ok: false,
      code: "INVALID_PAYMENT_KEY",
      message: "결제 확인에 필요한 정보가 없습니다.",
      status: 400,
    };
  }

  try {
    const orderRows = (await sql`
      SELECT id, order_number, order_status, payment_status, payment_request_id, final_amount
      FROM commerce_orders
      WHERE id = ${input.orderId}
      LIMIT 1
    `) as OrderRow[];

    const orderRow = orderRows[0];
    if (!orderRow) {
      return {
        ok: false,
        code: "ORDER_NOT_FOUND",
        message: "주문 정보를 찾을 수 없습니다.",
        status: 404,
      };
    }

    const storedPrid = orderRow.payment_request_id?.trim();
    const clientPrid = input.paymentRequestId?.trim();
    if (storedPrid && clientPrid && storedPrid !== clientPrid) {
      return {
        ok: false,
        code: "PAYMENT_REQUEST_MISMATCH",
        message: "결제 요청 정보가 일치하지 않습니다.",
        status: 403,
      };
    }

    const foreignKeyRows = (await sql`
      SELECT order_id, status, payment_key
      FROM commerce_payments
      WHERE payment_key = ${paymentKey}
        AND order_id <> ${input.orderId}
      LIMIT 1
    `) as PaymentRow[];

    if (foreignKeyRows[0]) {
      return {
        ok: false,
        code: "PAYMENT_KEY_BOUND_TO_OTHER_ORDER",
        message: "결제 키가 다른 주문에 연결되어 있습니다.",
        status: 409,
      };
    }

    const paymentStatus = orderRow.payment_status as CommerceOrderRecord["paymentStatus"];

    if (paymentStatus === "completed") {
      const latest = (await sql`
        SELECT payment_key FROM commerce_payments
        WHERE order_id = ${input.orderId}
        ORDER BY created_at DESC
        LIMIT 1
      `) as { payment_key: string | null }[];

      const boundKey = latest[0]?.payment_key?.trim();
      if (boundKey && boundKey !== paymentKey) {
        return {
          ok: false,
          code: "ALREADY_PAID",
          message: "이미 결제가 완료된 주문입니다.",
          status: 409,
        };
      }

      const order = await mapOrderRow(input.orderId);
      if (!order) {
        return {
          ok: false,
          code: "ORDER_NOT_FOUND",
          message: "주문 정보를 찾을 수 없습니다.",
          status: 404,
        };
      }
      return { ok: true, outcome: "idempotent_completed", order };
    }

    if (isPaymentStatusTerminal(paymentStatus)) {
      return {
        ok: false,
        code: "PAYMENT_TERMINAL",
        message: "결제를 확정할 수 없는 주문 상태입니다.",
        status: 409,
      };
    }

    if (!canStartPaymentConfirm(paymentStatus)) {
      return {
        ok: false,
        code: "PAYMENT_STATE_BLOCKED",
        message: "결제를 확정할 수 없는 주문 상태입니다.",
        status: 409,
      };
    }

    const latestPayments = (await sql`
      SELECT id, order_id, payment_key, status, payment_request_id
      FROM commerce_payments
      WHERE order_id = ${input.orderId}
      ORDER BY created_at DESC
      LIMIT 1
    `) as PaymentRow[];

    const latest = latestPayments[0];
    if (
      latest?.status === "processing" &&
      latest.payment_key?.trim() &&
      latest.payment_key.trim() !== paymentKey
    ) {
      return {
        ok: false,
        code: "CONFIRM_IN_PROGRESS",
        message: "다른 결제 확인이 진행 중입니다.",
        status: 409,
      };
    }

    if (latest?.status === "processing" && latest.payment_key?.trim() === paymentKey) {
      await sql`
        UPDATE commerce_orders SET
          payment_status = 'processing',
          updated_at = NOW()
        WHERE id = ${input.orderId}
      `;
      const order = await mapOrderRow(input.orderId);
      if (!order) {
        return {
          ok: false,
          code: "ORDER_NOT_FOUND",
          message: "주문 정보를 찾을 수 없습니다.",
          status: 404,
        };
      }
      return { ok: true, outcome: "resume_processing", order };
    }

    const previousPaymentStatus = orderRow.payment_status;

    const claimedRows = (await sql`
      UPDATE commerce_orders SET
        payment_status = 'processing',
        updated_at = NOW()
      WHERE id = ${input.orderId}
        AND payment_status IN ('not_started', 'preparing', 'pending', 'failed', 'canceled', 'reconcile_needed')
      RETURNING id
    `) as { id: string }[];

    if (!claimedRows[0]) {
      const refreshed = await mapOrderRow(input.orderId);
      if (refreshed?.paymentStatus === "completed") {
        return { ok: true, outcome: "idempotent_completed", order: refreshed };
      }
      return {
        ok: false,
        code: "CONFIRM_IN_PROGRESS",
        message: "다른 결제 확인이 진행 중입니다.",
        status: 409,
      };
    }

    if (latest?.id) {
      await sql`
        UPDATE commerce_payments SET
          payment_key = ${paymentKey},
          payment_request_id = COALESCE(${input.paymentRequestId ?? null}, payment_request_id),
          status = 'processing',
          toss_order_id = ${input.orderId},
          updated_at = NOW()
        WHERE id = ${latest.id}
      `;
    } else {
      await sql`
        INSERT INTO commerce_payments (
          id, order_id, provider, payment_request_id, payment_key, toss_order_id,
          amount, status
        ) VALUES (
          ${generateId("pay")},
          ${input.orderId},
          'toss',
          ${input.paymentRequestId ?? orderRow.payment_request_id ?? null},
          ${paymentKey},
          ${input.orderId},
          ${orderRow.final_amount},
          'processing'
        )
      `;
    }

    const order = await mapOrderRow(input.orderId);
    if (!order) {
      return {
        ok: false,
        code: "ORDER_NOT_FOUND",
        message: "주문 정보를 찾을 수 없습니다.",
        status: 404,
      };
    }

    return {
      ok: true,
      outcome: "claimed",
      order,
      previousPaymentStatus,
    };
  } catch (err) {
    const code = err instanceof Error ? err.message : String(err);
    if (/unique|duplicate/i.test(code)) {
      return {
        ok: false,
        code: "PAYMENT_KEY_CONFLICT",
        message: "결제 키가 이미 사용 중입니다.",
        status: 409,
      };
    }
    return {
      ok: false,
      code: "CLAIM_FAILED",
      message: "결제 확인을 시작할 수 없습니다.",
      status: 503,
    };
  }
}

export async function pgFinalizePaymentConfirmAtomically(input: {
  orderId: string;
  paymentKey: string;
  approved: TossApprovedPayment;
  statusNote: string;
  source: "browser" | "webhook" | "reconcile";
}): Promise<FinalizeConfirmResult> {
  if (!isPostgresConfigured()) {
    return {
      ok: false,
      code: "COMMERCE_STORE_UNAVAILABLE",
      message: "주문 저장소를 사용할 수 없습니다.",
    };
  }

  await ensureCommerceSchema();
  await ensurePromotionSchema();
  const sql = getSql();
  const logId = generateId("log");
  const paymentKey = normalizePaymentKey(input.paymentKey);
  if (!paymentKey) {
    return { ok: false, code: "INVALID_PAYMENT_KEY", message: "결제 키가 없습니다." };
  }

  try {
    const orderRows = (await sql`
      SELECT id, order_status, payment_status
      FROM commerce_orders
      WHERE id = ${input.orderId}
      LIMIT 1
    `) as { id: string; order_status: string; payment_status: string }[];

    const orderRow = orderRows[0];
    if (!orderRow) {
      return { ok: false, code: "ORDER_NOT_FOUND", message: "주문을 찾을 수 없습니다." };
    }

    if (orderRow.payment_status === "completed") {
      const keyRows = (await sql`
        SELECT payment_key FROM commerce_payments
        WHERE order_id = ${input.orderId}
        ORDER BY created_at DESC
        LIMIT 1
      `) as { payment_key: string | null }[];
      const bound = keyRows[0]?.payment_key?.trim();
      if (bound && bound !== paymentKey) {
        return {
          ok: false,
          code: "ALREADY_PAID",
          message: "이미 다른 결제로 완료된 주문입니다.",
        };
      }
      const order = await mapOrderRow(input.orderId);
      if (!order) {
        return { ok: false, code: "ORDER_NOT_FOUND", message: "주문을 찾을 수 없습니다." };
      }
      return {
        ok: true,
        order,
        transitioned: false,
        alreadyCompleted: true,
      };
    }

    const txnResults = await sql.transaction((txn) => [
      txn`
        UPDATE commerce_orders SET
          order_status = 'payment_completed',
          payment_status = 'completed',
          updated_at = NOW()
        WHERE id = ${input.orderId}
          AND payment_status IN ('not_started', 'preparing', 'pending', 'processing', 'failed', 'canceled', 'reconcile_needed')
        RETURNING id
      `,
      txn`
        UPDATE commerce_payments SET
          payment_key = ${paymentKey},
          toss_order_id = ${input.approved.orderId},
          amount = ${input.approved.totalAmount},
          method = ${input.approved.method},
          status = 'completed',
          approved_at = ${input.approved.approvedAt}::timestamptz,
          receipt_url = ${input.approved.receiptUrl ?? null},
          fail_code = NULL,
          fail_message = NULL,
          updated_at = NOW()
        WHERE order_id = ${input.orderId}
          AND status IN ('processing', 'pending', 'not_started', 'failed', 'canceled', 'reconcile_needed')
      `,
      txn`
        INSERT INTO commerce_order_status_logs (
          id, order_id, previous_order_status, previous_payment_status,
          next_order_status, next_payment_status, memo
        )
        SELECT
          ${logId},
          o.id,
          ${orderRow.order_status},
          ${orderRow.payment_status},
          'payment_completed',
          'completed',
          ${input.statusNote}
        FROM commerce_orders o
        WHERE o.id = ${input.orderId}
          AND o.payment_status = 'completed'
          AND NOT EXISTS (
            SELECT 1 FROM commerce_order_status_logs l
            WHERE l.order_id = o.id
              AND l.next_payment_status = 'completed'
              AND l.memo = ${input.statusNote}
          )
        LIMIT 1
      `,
    ]);

    const updated = (txnResults[0] ?? []) as { id: string }[];
    if (!updated[0]) {
      const refreshed = await mapOrderRow(input.orderId);
      if (refreshed?.paymentStatus === "completed") {
        return {
          ok: true,
          order: refreshed,
          transitioned: false,
          alreadyCompleted: true,
        };
      }
      return {
        ok: false,
        code: "FINALIZE_STATE_CONFLICT",
        message: "결제 상태를 완료로 변경할 수 없습니다.",
      };
    }

    const order = await mapOrderRow(input.orderId);
    if (!order) {
      return { ok: false, code: "ORDER_NOT_FOUND", message: "주문을 찾을 수 없습니다." };
    }

    return {
      ok: true,
      order,
      transitioned: true,
      alreadyCompleted: false,
    };
  } catch {
    return {
      ok: false,
      code: "FINALIZE_FAILED",
      message: "결제 완료 저장에 실패했습니다.",
    };
  }
}

export async function pgMarkPaymentReconcileNeeded(input: {
  orderId: string;
  paymentKey: string;
  note: string;
}): Promise<MarkReconcileResult> {
  if (!isPostgresConfigured()) {
    return {
      ok: false,
      code: "COMMERCE_STORE_UNAVAILABLE",
      message: "주문 저장소를 사용할 수 없습니다.",
    };
  }

  await ensureCommerceSchema();
  const sql = getSql();
  const logId = generateId("log");

  try {
    const rows = (await sql`
      SELECT order_status, payment_status
      FROM commerce_orders
      WHERE id = ${input.orderId}
      LIMIT 1
    `) as { order_status: string; payment_status: string }[];

    const row = rows[0];
    if (!row || row.payment_status === "completed") {
      const order = await mapOrderRow(input.orderId);
      if (!order) {
        return { ok: false, code: "ORDER_NOT_FOUND", message: "주문을 찾을 수 없습니다." };
      }
      return { ok: true, order };
    }

    await sql`
      UPDATE commerce_orders SET
        payment_status = 'reconcile_needed',
        updated_at = NOW()
      WHERE id = ${input.orderId}
        AND payment_status <> 'completed'
    `;

    await sql`
      UPDATE commerce_payments SET
        payment_key = COALESCE(${input.paymentKey}, payment_key),
        status = 'reconcile_needed',
        fail_message = ${input.note},
        updated_at = NOW()
      WHERE order_id = ${input.orderId}
    `;

    await sql`
      INSERT INTO commerce_order_status_logs (
        id, order_id, previous_order_status, previous_payment_status,
        next_order_status, next_payment_status, memo
      ) VALUES (
        ${logId},
        ${input.orderId},
        ${row.order_status},
        ${row.payment_status},
        ${row.order_status},
        'reconcile_needed',
        ${input.note}
      )
    `;

    const order = await mapOrderRow(input.orderId);
    if (!order) {
      return { ok: false, code: "ORDER_NOT_FOUND", message: "주문을 찾을 수 없습니다." };
    }
    return { ok: true, order };
  } catch {
    return {
      ok: false,
      code: "RECONCILE_MARK_FAILED",
      message: "재동기화 대상 표시에 실패했습니다.",
    };
  }
}

export async function pgFindOrderIdByPaymentKey(
  paymentKey: string,
): Promise<string | null> {
  if (!isPostgresConfigured()) return null;
  await ensureCommerceSchema();
  const sql = getSql();
  const key = normalizePaymentKey(paymentKey);
  if (!key) return null;
  const rows = (await sql`
    SELECT order_id FROM commerce_payments
    WHERE payment_key = ${key}
    ORDER BY created_at DESC
    LIMIT 1
  `) as { order_id: string }[];
  return rows[0]?.order_id ?? null;
}
