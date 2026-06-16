import "server-only";

import { ensureOperationalSchema } from "@/lib/db/ensure-operational-schema";
import { getSql } from "@/lib/db/postgres";
import type {
  AdminProductOverride,
  AdminProductPriceHistoryEntry,
} from "@/types/admin-product";

type OverrideMap = Record<string, AdminProductOverride>;

type OverrideRow = {
  product_id: string;
  override_json: AdminProductOverride | null;
  updated_at: string | Date;
  updated_by: string;
};

type HistoryRow = {
  id: string;
  product_id: string;
  field: string;
  previous_value: unknown;
  next_value: unknown;
  changed_by: string;
  reason: string | null;
  created_at: string | Date;
};

function toIso(value: string | Date): string {
  return typeof value === "string" ? value : value.toISOString();
}

function rowToOverride(row: OverrideRow): AdminProductOverride {
  const patch = row.override_json ?? {};
  return {
    ...patch,
    updatedAt: patch.updatedAt ?? toIso(row.updated_at),
    updatedBy: patch.updatedBy ?? row.updated_by,
  };
}

function historyRowToEntry(row: HistoryRow): AdminProductPriceHistoryEntry {
  return {
    id: row.id,
    productId: row.product_id,
    field: row.field,
    previousValue: row.previous_value as string | number | null,
    nextValue: row.next_value as string | number | null,
    changedBy: row.changed_by,
    reason: row.reason ?? undefined,
    createdAt: toIso(row.created_at),
  };
}

export async function loadProductOverridesPg(): Promise<OverrideMap> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT product_id, override_json, updated_at, updated_by
    FROM product_price_overrides
  `) as OverrideRow[];
  const map: OverrideMap = {};
  for (const row of rows) {
    map[row.product_id] = rowToOverride(row);
  }
  return map;
}

export async function getProductOverridePg(productId: string): Promise<AdminProductOverride | undefined> {
  const all = await loadProductOverridesPg();
  return all[productId];
}

export async function saveProductOverridePg(
  productId: string,
  patch: AdminProductOverride,
  meta?: { changedBy?: string; reason?: string },
): Promise<AdminProductOverride> {
  await ensureOperationalSchema();
  const sql = getSql();
  const existingRows = (await sql`
    SELECT product_id, override_json, updated_at, updated_by
    FROM product_price_overrides
    WHERE product_id = ${productId}
    LIMIT 1
  `) as OverrideRow[];
  const prev = existingRows[0] ? rowToOverride(existingRows[0]) : {};
  const now = new Date().toISOString();
  const next: AdminProductOverride = {
    ...prev,
    ...patch,
    updatedAt: now,
    updatedBy: meta?.changedBy ?? patch.updatedBy ?? "admin",
  };

  await sql`
    INSERT INTO product_price_overrides (product_id, override_json, updated_at, updated_by)
    VALUES (${productId}, ${JSON.stringify(next)}::jsonb, ${now}::timestamptz, ${next.updatedBy ?? "admin"})
    ON CONFLICT (product_id) DO UPDATE SET
      override_json = EXCLUDED.override_json,
      updated_at = EXCLUDED.updated_at,
      updated_by = EXCLUDED.updated_by
  `;

  for (const field of ["internetPrice", "onsitePrice"] as const) {
    if (patch[field] === undefined || patch[field] === prev[field]) continue;
    const historyId = `ph_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await sql`
      INSERT INTO product_price_history (
        id, product_id, field, previous_value, next_value, changed_by, reason, created_at
      ) VALUES (
        ${historyId}, ${productId}, ${field},
        ${JSON.stringify(prev[field] ?? null)}::jsonb,
        ${JSON.stringify(patch[field] ?? null)}::jsonb,
        ${meta?.changedBy ?? "admin"},
        ${meta?.reason ?? null},
        ${now}::timestamptz
      )
    `;
  }

  return next;
}

export async function loadProductPriceHistoryPg(
  productId?: string,
): Promise<AdminProductPriceHistoryEntry[]> {
  await ensureOperationalSchema();
  const sql = getSql();
  const rows = productId
    ? ((await sql`
        SELECT * FROM product_price_history
        WHERE product_id = ${productId}
        ORDER BY created_at DESC
        LIMIT 500
      `) as HistoryRow[])
    : ((await sql`
        SELECT * FROM product_price_history
        ORDER BY created_at DESC
        LIMIT 500
      `) as HistoryRow[]);
  return rows.map(historyRowToEntry);
}
