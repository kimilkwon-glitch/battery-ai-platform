import "server-only";

import { filterAdminTestOrderRequests } from "@/lib/admin/admin-test-data-filter";
import { ensureOperationalSchema } from "@/lib/db/ensure-operational-schema";
import { getSql } from "@/lib/db/postgres";
import type { BatteryCartItem } from "@/types/cart";
import type {
  OrderRequestConfirmations,
  OrderRequestCustomerType,
  OrderRequestFulfillmentMethod,
  OrderRequestReviewFlag,
  OrderRequestStoreId,
  OrderRequestUsedBatteryOption,
  OrderRequestWorkflowStatus,
  PersistedOrderRequest,
  GuestOrderExtras,
} from "@/types/order-request";

type OrderRequestRow = {
  id: string;
  request_number: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  vehicle_name: string | null;
  vehicle_year: string | null;
  vehicle_fuel_type: string | null;
  current_battery_spec: string | null;
  battery_spec_summary: string;
  terminal_direction: string | null;
  used_battery_return_option: string;
  fulfillment_method: string;
  store_id: string | null;
  requested_region: string | null;
  preferred_time: string | null;
  items_json: BatteryCartItem[];
  memo: string | null;
  internal_memo: string | null;
  review_flags: OrderRequestReviewFlag[];
  confirmations_json: OrderRequestConfirmations | null;
  source: string;
  customer_type: string | null;
  guest_extras_json: GuestOrderExtras | null;
  contacted_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

function rowToRecord(row: OrderRequestRow): PersistedOrderRequest {
  return {
    id: row.id,
    requestNumber: row.request_number,
    status: row.status as OrderRequestWorkflowStatus,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email ?? undefined,
    vehicleName: row.vehicle_name ?? undefined,
    vehicleYear: row.vehicle_year ?? undefined,
    vehicleFuelType: row.vehicle_fuel_type ?? undefined,
    currentBatterySpec: row.current_battery_spec ?? undefined,
    batterySpecSummary: row.battery_spec_summary,
    terminalDirection: (row.terminal_direction as BatteryCartItem["terminalDirection"]) ?? undefined,
    usedBatteryReturnOption: row.used_battery_return_option as OrderRequestUsedBatteryOption,
    fulfillmentMethod: row.fulfillment_method as OrderRequestFulfillmentMethod,
    storeId: (row.store_id as OrderRequestStoreId) ?? undefined,
    requestedRegion: row.requested_region ?? undefined,
    preferredTime: row.preferred_time ?? undefined,
    itemsJson: Array.isArray(row.items_json) ? row.items_json : [],
    memo: row.memo ?? undefined,
    internalMemo: row.internal_memo ?? undefined,
    reviewFlags: Array.isArray(row.review_flags) ? row.review_flags : [],
    confirmationsJson: row.confirmations_json ?? undefined,
    source: row.source as PersistedOrderRequest["source"],
    customerType: (row.customer_type as OrderRequestCustomerType) ?? undefined,
    guestExtrasJson: row.guest_extras_json ?? undefined,
    contactedAt: row.contacted_at ?? undefined,
    closedAt: row.closed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type OrderRequestListFilters = {
  status?: string | null;
  q?: string | null;
  limit?: number;
};

export async function storeCreate(record: PersistedOrderRequest): Promise<PersistedOrderRequest> {
  await ensureOperationalSchema();
  const sql = getSql();
  await sql`
    INSERT INTO order_requests (
      id, request_number, status, customer_name, customer_phone, customer_email,
      vehicle_name, vehicle_year, vehicle_fuel_type, current_battery_spec, battery_spec_summary,
      terminal_direction, used_battery_return_option, fulfillment_method, store_id,
      requested_region, preferred_time, items_json, memo, internal_memo, review_flags,
      confirmations_json, source, customer_type, guest_extras_json, contacted_at, closed_at,
      created_at, updated_at
    ) VALUES (
      ${record.id}, ${record.requestNumber}, ${record.status}, ${record.customerName},
      ${record.customerPhone}, ${record.customerEmail ?? null}, ${record.vehicleName ?? null},
      ${record.vehicleYear ?? null}, ${record.vehicleFuelType ?? null},
      ${record.currentBatterySpec ?? null}, ${record.batterySpecSummary},
      ${record.terminalDirection ?? null}, ${record.usedBatteryReturnOption},
      ${record.fulfillmentMethod}, ${record.storeId ?? null}, ${record.requestedRegion ?? null},
      ${record.preferredTime ?? null}, ${JSON.stringify(record.itemsJson)}, ${record.memo ?? null},
      ${record.internalMemo ?? ""}, ${JSON.stringify(record.reviewFlags)},
      ${record.confirmationsJson ? JSON.stringify(record.confirmationsJson) : null},
      ${record.source}, ${record.customerType ?? null},
      ${record.guestExtrasJson ? JSON.stringify(record.guestExtrasJson) : null},
      ${record.contactedAt ?? null}, ${record.closedAt ?? null},
      ${record.createdAt}, ${record.updatedAt}
    )
  `;
  return record;
}

export async function storeList(
  filters: OrderRequestListFilters = {},
): Promise<PersistedOrderRequest[]> {
  await ensureOperationalSchema();
  const sql = getSql();
  const limit = filters.limit ?? 200;
  const status = filters.status?.trim();

  let rows: OrderRequestRow[];
  if (status && status !== "all") {
    rows = (await sql`
      SELECT * FROM order_requests WHERE status = ${status}
      ORDER BY created_at DESC LIMIT ${limit}
    `) as OrderRequestRow[];
  } else {
    rows = (await sql`
      SELECT * FROM order_requests ORDER BY created_at DESC LIMIT ${limit}
    `) as OrderRequestRow[];
  }

  let records = rows.map(rowToRecord);
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    records = records.filter((r) => {
      const hay = [r.requestNumber, r.customerName, r.customerPhone, r.vehicleName, r.batterySpecSummary, r.memo]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }
  return filterAdminTestOrderRequests(records).slice(0, limit);
}

export async function storeGetById(id: string): Promise<PersistedOrderRequest | null> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`SELECT * FROM order_requests WHERE id = ${id} LIMIT 1`) as OrderRequestRow[];
  return rows[0] ? rowToRecord(rows[0]) : null;
}

export async function storeGetByRequestNumber(
  requestNumber: string,
): Promise<PersistedOrderRequest | null> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rn = requestNumber.trim();
  const rows = (await sql`
    SELECT * FROM order_requests WHERE request_number = ${rn} LIMIT 1
  `) as OrderRequestRow[];
  return rows[0] ? rowToRecord(rows[0]) : null;
}

export async function storeUpdate(
  id: string,
  patch: Partial<PersistedOrderRequest>,
): Promise<PersistedOrderRequest | null> {
  const prev = await storeGetById(id);
  if (!prev) return null;
  const next: PersistedOrderRequest = {
    ...prev,
    ...patch,
    id: prev.id,
    requestNumber: prev.requestNumber,
    createdAt: prev.createdAt,
    updatedAt: new Date().toISOString(),
  };
  const sql = getSql();
  await sql`
    UPDATE order_requests SET
      status = ${next.status},
      customer_name = ${next.customerName},
      customer_phone = ${next.customerPhone},
      customer_email = ${next.customerEmail ?? null},
      vehicle_name = ${next.vehicleName ?? null},
      vehicle_year = ${next.vehicleYear ?? null},
      vehicle_fuel_type = ${next.vehicleFuelType ?? null},
      current_battery_spec = ${next.currentBatterySpec ?? null},
      battery_spec_summary = ${next.batterySpecSummary},
      terminal_direction = ${next.terminalDirection ?? null},
      used_battery_return_option = ${next.usedBatteryReturnOption},
      fulfillment_method = ${next.fulfillmentMethod},
      store_id = ${next.storeId ?? null},
      requested_region = ${next.requestedRegion ?? null},
      preferred_time = ${next.preferredTime ?? null},
      items_json = ${JSON.stringify(next.itemsJson)},
      memo = ${next.memo ?? null},
      internal_memo = ${next.internalMemo ?? ""},
      review_flags = ${JSON.stringify(next.reviewFlags)},
      confirmations_json = ${next.confirmationsJson ? JSON.stringify(next.confirmationsJson) : null},
      source = ${next.source},
      customer_type = ${next.customerType ?? null},
      guest_extras_json = ${next.guestExtrasJson ? JSON.stringify(next.guestExtrasJson) : null},
      contacted_at = ${next.contactedAt ?? null},
      closed_at = ${next.closedAt ?? null},
      updated_at = ${next.updatedAt}
    WHERE id = ${id}
  `;
  return next;
}

export async function storeCountForDatePrefix(prefix: string): Promise<number> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT COUNT(*)::int AS count FROM order_requests
    WHERE request_number LIKE ${`${prefix}%`}
  `) as { count: number }[];
  return rows[0]?.count ?? 0;
}
