import "server-only";
import { randomBytes } from "node:crypto";
import { ensureCommerceSchema } from "@/lib/db/ensure-commerce-schema";
import { getSql } from "@/lib/db/postgres";
import type { BatteryCartItem } from "@/types/cart";
import type { CommerceOrderPriceSnapshot } from "@/types/commerce-order";
import type {
  CommerceOrderRecord,
  CommerceOrderStatusEvent,
} from "@/types/commerce-payment";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_type: string;
  vehicle_name: string | null;
  vehicle_year: string | null;
  vehicle_fuel: string | null;
  vehicle_plate_suffix: string | null;
  product_name: string;
  brand: string | null;
  battery_code: string;
  internet_price: number | null;
  onsite_price: number | null;
  fulfillment_type: string;
  return_battery_option: string;
  delivery_fee: number;
  store_install_discount: number;
  final_amount: number | null;
  address: string | null;
  selected_store: string | null;
  request_memo: string | null;
  order_status: string;
  payment_status: string;
  payment_request_id: string | null;
  items_json: BatteryCartItem[];
  price_lines_json: CommerceOrderPriceSnapshot[];
  created_at: string;
  updated_at: string;
  payment_provider: string | null;
  payment_key: string | null;
  toss_order_id: string | null;
  paid_amount: number | null;
  payment_method: string | null;
  approved_at: string | null;
  receipt_url: string | null;
  fail_code: string | null;
  fail_message: string | null;
  toss_payment_status: string | null;
};

type StatusLogRow = {
  previous_order_status: string | null;
  previous_payment_status: string | null;
  next_order_status: string;
  next_payment_status: string | null;
  memo: string | null;
  created_at: string;
};

const STORE_LABELS: Record<string, string> = {
  deokcheon: "덕천점",
  hakjang: "학장점",
};

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${randomBytes(4).toString("hex")}`;
}

function resolveStoreLabel(selectedStore: string | null | undefined): string | undefined {
  if (!selectedStore) return undefined;
  return STORE_LABELS[selectedStore] ?? selectedStore;
}

function rowToRecord(row: OrderRow, logs: StatusLogRow[]): CommerceOrderRecord {
  const statusHistory: CommerceOrderStatusEvent[] = logs.map((log) => ({
    status: log.next_order_status as CommerceOrderRecord["orderStatus"],
    paymentStatus: (log.next_payment_status ??
      undefined) as CommerceOrderRecord["paymentStatus"] | undefined,
    note: log.memo ?? undefined,
    at: new Date(log.created_at).toISOString(),
  }));

  if (statusHistory.length === 0) {
    statusHistory.push({
      status: row.order_status as CommerceOrderRecord["orderStatus"],
      paymentStatus: row.payment_status as CommerceOrderRecord["paymentStatus"],
      at: new Date(row.created_at).toISOString(),
    });
  }

  return {
    orderId: row.id,
    orderNumber: row.order_number,
    orderStatus: row.order_status as CommerceOrderRecord["orderStatus"],
    paymentStatus: row.payment_status as CommerceOrderRecord["paymentStatus"],
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email ?? undefined,
    customerType: row.customer_type as CommerceOrderRecord["customerType"],
    vehicleName: row.vehicle_name ?? undefined,
    vehicleYear: row.vehicle_year ?? undefined,
    vehicleFuel: row.vehicle_fuel ?? undefined,
    plateSuffix: row.vehicle_plate_suffix ?? undefined,
    productName: row.product_name,
    brand: row.brand ?? undefined,
    batteryCode: row.battery_code,
    internetPrice: row.internet_price,
    onsitePrice: row.onsite_price,
    fulfillmentType: row.fulfillment_type as CommerceOrderRecord["fulfillmentType"],
    returnBatteryOption: row.return_battery_option as CommerceOrderRecord["returnBatteryOption"],
    deliveryFee: row.delivery_fee,
    storeInstallDiscount: row.store_install_discount,
    finalAmount: row.final_amount,
    address: row.address ?? undefined,
    store: resolveStoreLabel(row.selected_store),
    requestMemo: row.request_memo ?? undefined,
    itemsJson: row.items_json ?? [],
    priceLines: row.price_lines_json ?? [],
    paymentRequestId: row.payment_request_id ?? undefined,
    paymentProvider: row.payment_provider === "toss" ? "toss" : undefined,
    paymentKey: row.payment_key ?? undefined,
    pgTransactionId: row.payment_key ?? undefined,
    paidAmount: row.paid_amount,
    paymentMethod: row.payment_method ?? undefined,
    paymentFailCode: row.fail_code ?? undefined,
    paymentFailReason: row.fail_message ?? undefined,
    approvedAt: row.approved_at ? new Date(row.approved_at).toISOString() : undefined,
    receiptUrl: row.receipt_url ?? undefined,
    tossPaymentStatus: row.toss_payment_status ?? undefined,
    statusHistory,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

async function fetchStatusLogs(orderId: string): Promise<StatusLogRow[]> {
  const sql = getSql();
  return (await sql`
    SELECT previous_order_status, previous_payment_status, next_order_status, next_payment_status, memo, created_at
    FROM commerce_order_status_logs
    WHERE order_id = ${orderId}
    ORDER BY created_at ASC
  `) as StatusLogRow[];
}

async function fetchOrderRow(orderId: string): Promise<OrderRow | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT
      o.*,
      p.provider AS payment_provider,
      p.payment_key,
      p.toss_order_id,
      p.amount AS paid_amount,
      p.method AS payment_method,
      p.approved_at,
      p.receipt_url,
      p.fail_code,
      p.fail_message,
      p.status AS toss_payment_status
    FROM commerce_orders o
    LEFT JOIN LATERAL (
      SELECT *
      FROM commerce_payments
      WHERE order_id = o.id
      ORDER BY created_at DESC
      LIMIT 1
    ) p ON TRUE
    WHERE o.id = ${orderId}
    LIMIT 1
  `) as OrderRow[];
  return rows[0] ?? null;
}

async function appendStatusLog(
  orderId: string,
  prev: { orderStatus: string; paymentStatus: string },
  next: { orderStatus: string; paymentStatus: string },
  memo?: string,
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO commerce_order_status_logs (
      id, order_id, previous_order_status, previous_payment_status,
      next_order_status, next_payment_status, memo
    ) VALUES (
      ${generateId("log")},
      ${orderId},
      ${prev.orderStatus},
      ${prev.paymentStatus},
      ${next.orderStatus},
      ${next.paymentStatus},
      ${memo ?? null}
    )
  `;
}

async function upsertLatestPayment(
  orderId: string,
  patch: {
    paymentRequestId?: string;
    paymentKey?: string;
    amount?: number | null;
    method?: string;
    status: string;
    approvedAt?: string;
    receiptUrl?: string;
    failCode?: string;
    failMessage?: string;
  },
): Promise<void> {
  const sql = getSql();
  const existing = (await sql`
    SELECT id FROM commerce_payments
    WHERE order_id = ${orderId}
    ORDER BY created_at DESC
    LIMIT 1
  `) as { id: string }[];

  if (existing[0]?.id && patch.status !== "completed") {
    await sql`
      UPDATE commerce_payments SET
        payment_request_id = COALESCE(${patch.paymentRequestId ?? null}, payment_request_id),
        payment_key = COALESCE(${patch.paymentKey ?? null}, payment_key),
        toss_order_id = COALESCE(${patch.paymentKey ? orderId : null}, toss_order_id),
        amount = COALESCE(${patch.amount ?? null}, amount),
        method = COALESCE(${patch.method ?? null}, method),
        status = ${patch.status},
        approved_at = COALESCE(${patch.approvedAt ?? null}::timestamptz, approved_at),
        receipt_url = COALESCE(${patch.receiptUrl ?? null}, receipt_url),
        fail_code = COALESCE(${patch.failCode ?? null}, fail_code),
        fail_message = COALESCE(${patch.failMessage ?? null}, fail_message),
        updated_at = NOW()
      WHERE id = ${existing[0].id}
    `;
    return;
  }

  if (existing[0]?.id && patch.status === "completed") {
    await sql`
      UPDATE commerce_payments SET
        payment_key = ${patch.paymentKey ?? null},
        toss_order_id = ${orderId},
        amount = ${patch.amount ?? null},
        method = ${patch.method ?? null},
        status = ${patch.status},
        approved_at = ${patch.approvedAt ?? null}::timestamptz,
        receipt_url = ${patch.receiptUrl ?? null},
        fail_code = NULL,
        fail_message = NULL,
        updated_at = NOW()
      WHERE id = ${existing[0].id}
    `;
    return;
  }

  await sql`
    INSERT INTO commerce_payments (
      id, order_id, provider, payment_request_id, payment_key, toss_order_id,
      amount, method, status, approved_at, receipt_url, fail_code, fail_message
    ) VALUES (
      ${generateId("pay")},
      ${orderId},
      'toss',
      ${patch.paymentRequestId ?? null},
      ${patch.paymentKey ?? null},
      ${patch.paymentKey ? orderId : null},
      ${patch.amount ?? null},
      ${patch.method ?? null},
      ${patch.status},
      ${patch.approvedAt ?? null}::timestamptz,
      ${patch.receiptUrl ?? null},
      ${patch.failCode ?? null},
      ${patch.failMessage ?? null}
    )
  `;
}

function extractSelectedStoreId(record: CommerceOrderRecord): string | null {
  if (record.selectedStore === "deokcheon" || record.selectedStore === "hakjang") {
    return record.selectedStore;
  }
  if (record.store === "덕천점") return "deokcheon";
  if (record.store === "학장점") return "hakjang";
  return null;
}

async function ensureDb(): Promise<void> {
  await ensureCommerceSchema();
}

export async function pgStoreCommerceOrderCreate(
  record: CommerceOrderRecord,
): Promise<CommerceOrderRecord> {
  await ensureDb();
  const sql = getSql();
  const selectedStore = extractSelectedStoreId(record);

  await sql`
    INSERT INTO commerce_orders (
      id, order_number, customer_name, customer_phone, customer_email, customer_type,
      vehicle_name, vehicle_year, vehicle_fuel, vehicle_plate_suffix,
      product_name, brand, battery_code, internet_price, onsite_price,
      fulfillment_type, return_battery_option, delivery_fee, store_install_discount,
      final_amount, address, selected_store, request_memo,
      order_status, payment_status, payment_request_id, items_json, price_lines_json,
      created_at, updated_at
    ) VALUES (
      ${record.orderId},
      ${record.orderNumber},
      ${record.customerName},
      ${record.customerPhone},
      ${record.customerEmail ?? null},
      ${record.customerType},
      ${record.vehicleName ?? null},
      ${record.vehicleYear ?? null},
      ${record.vehicleFuel ?? null},
      ${record.plateSuffix ?? null},
      ${record.productName},
      ${record.brand ?? null},
      ${record.batteryCode},
      ${record.internetPrice},
      ${record.onsitePrice},
      ${record.fulfillmentType},
      ${record.returnBatteryOption},
      ${record.deliveryFee},
      ${record.storeInstallDiscount},
      ${record.finalAmount},
      ${record.address ?? null},
      ${selectedStore},
      ${record.requestMemo ?? null},
      ${record.orderStatus},
      ${record.paymentStatus},
      ${record.paymentRequestId ?? null},
      ${JSON.stringify(record.itemsJson)}::jsonb,
      ${JSON.stringify(record.priceLines)}::jsonb,
      ${record.createdAt}::timestamptz,
      ${record.updatedAt}::timestamptz
    )
  `;

  const initial = record.statusHistory[record.statusHistory.length - 1];
  await appendStatusLog(
    record.orderId,
    { orderStatus: record.orderStatus, paymentStatus: record.paymentStatus },
    {
      orderStatus: initial?.status ?? record.orderStatus,
      paymentStatus: initial?.paymentStatus ?? record.paymentStatus,
    },
    initial?.note ?? "결제 대기 주문 생성",
  );

  return record;
}

export async function pgStoreCommerceOrderGet(
  orderId: string,
): Promise<CommerceOrderRecord | null> {
  await ensureDb();
  const row = await fetchOrderRow(orderId);
  if (!row) return null;
  const logs = await fetchStatusLogs(orderId);
  return rowToRecord(row, logs);
}

export async function pgStoreCommerceOrderUpdate(
  orderId: string,
  patch: Partial<CommerceOrderRecord>,
): Promise<CommerceOrderRecord | null> {
  await ensureDb();
  const current = await pgStoreCommerceOrderGet(orderId);
  if (!current) return null;

  const next: CommerceOrderRecord = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  const sql = getSql();
  const selectedStore = extractSelectedStoreId(next);

  await sql`
    UPDATE commerce_orders SET
      customer_name = ${next.customerName},
      customer_phone = ${next.customerPhone},
      customer_email = ${next.customerEmail ?? null},
      vehicle_name = ${next.vehicleName ?? null},
      vehicle_year = ${next.vehicleYear ?? null},
      vehicle_fuel = ${next.vehicleFuel ?? null},
      vehicle_plate_suffix = ${next.plateSuffix ?? null},
      product_name = ${next.productName},
      brand = ${next.brand ?? null},
      battery_code = ${next.batteryCode},
      internet_price = ${next.internetPrice},
      onsite_price = ${next.onsitePrice},
      fulfillment_type = ${next.fulfillmentType},
      return_battery_option = ${next.returnBatteryOption},
      delivery_fee = ${next.deliveryFee},
      store_install_discount = ${next.storeInstallDiscount},
      final_amount = ${next.finalAmount},
      address = ${next.address ?? null},
      selected_store = ${selectedStore},
      request_memo = ${next.requestMemo ?? null},
      order_status = ${next.orderStatus},
      payment_status = ${next.paymentStatus},
      payment_request_id = ${next.paymentRequestId ?? null},
      items_json = ${JSON.stringify(next.itemsJson)}::jsonb,
      price_lines_json = ${JSON.stringify(next.priceLines)}::jsonb,
      updated_at = NOW()
    WHERE id = ${orderId}
  `;

  const statusChanged =
    patch.orderStatus != null ||
    patch.paymentStatus != null ||
    patch.statusHistory != null;

  if (statusChanged) {
    const lastEvent = patch.statusHistory?.[patch.statusHistory.length - 1];
    await appendStatusLog(
      orderId,
      { orderStatus: current.orderStatus, paymentStatus: current.paymentStatus },
      {
        orderStatus: next.orderStatus,
        paymentStatus: next.paymentStatus,
      },
      lastEvent?.note,
    );
  }

  if (
    patch.paymentStatus === "pending" ||
    patch.paymentRequestId ||
    patch.paymentStatus === "completed" ||
    patch.paymentStatus === "failed" ||
    patch.paymentStatus === "canceled"
  ) {
    await upsertLatestPayment(orderId, {
      paymentRequestId: next.paymentRequestId,
      paymentKey: next.paymentKey,
      amount: next.paidAmount ?? next.finalAmount,
      method: next.paymentMethod,
      status: next.paymentStatus,
      approvedAt: next.approvedAt,
      receiptUrl: next.receiptUrl,
      failCode: next.paymentFailCode,
      failMessage: next.paymentFailReason,
    });
  }

  return pgStoreCommerceOrderGet(orderId);
}

export async function pgStoreCommerceOrderCountByPrefix(prefix: string): Promise<number> {
  await ensureDb();
  const sql = getSql();
  const rows = (await sql`
    SELECT COUNT(*)::int AS count
    FROM commerce_orders
    WHERE order_number LIKE ${`${prefix}%`}
  `) as { count: number }[];
  return rows[0]?.count ?? 0;
}

export async function pgStoreCommerceOrderList(limit = 200): Promise<CommerceOrderRecord[]> {
  await ensureDb();
  const sql = getSql();
  const ids = (await sql`
    SELECT id FROM commerce_orders
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as { id: string }[];

  const records: CommerceOrderRecord[] = [];
  for (const { id } of ids) {
    const record = await pgStoreCommerceOrderGet(id);
    if (record) records.push(record);
  }
  return records;
}
