import type { AdminProductImportPreviewRow, AdminProductRow } from "@/types/admin-product";
import { decodeProductId } from "@/lib/admin/products/product-id";

const EXPORT_HEADERS = [
  "productId",
  "brand",
  "batteryCode",
  "displayName",
  "adminName",
  "internetPrice",
  "onsitePrice",
  "deliveryPriceCalculated",
  "onsiteInstallPriceCalculated",
  "storeInstallPriceCalculated",
  "storePickupSelfPriceCalculated",
  "saleStatus",
  "visible",
  "imageStatus",
  "detailPageStatus",
  "reviewStatus",
  "memo",
] as const;

function escapeCsvCell(v: string | number | boolean | null | undefined): string {
  const s = v == null ? "" : String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function productsToCsv(rows: AdminProductRow[]): string {
  const lines = [EXPORT_HEADERS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.productId,
        r.brand,
        r.batteryCode,
        r.displayName,
        r.adminName,
        r.internetPrice ?? "",
        r.onsitePrice ?? "",
        r.fulfillmentPrices.delivery ?? "",
        r.fulfillmentPrices.onsiteInstall ?? "",
        r.fulfillmentPrices.storeInstall ?? "",
        r.fulfillmentPrices.storePickupSelf ?? "",
        r.saleStatus,
        r.visible ? "true" : "false",
        r.imageStatus,
        r.detailPageStatus,
        r.reviewStatus,
        r.memo,
      ]
        .map(escapeCsvCell)
        .join(","),
    );
  }
  return "\uFEFF" + lines.join("\n");
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function parsePrice(raw: string): number | null | "invalid" {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t.replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) return "invalid";
  return Math.round(n);
}

type CsvRow = Record<string, string>;

function csvToRecords(text: string): CsvRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const rec: CsvRow = {};
    headers.forEach((h, i) => {
      rec[h] = cells[i] ?? "";
    });
    return rec;
  });
}

function resolveProductId(
  rec: CsvRow,
  indexById: Map<string, AdminProductRow>,
  indexByBrandCode: Map<string, AdminProductRow>,
): string | null {
  const pid = rec.productid?.trim();
  if (pid && indexById.has(pid)) return pid;
  const brand = rec.brand?.trim();
  const code = rec.batterycode?.trim();
  if (brand && code) {
    const key = `${brand}:${code}`;
    if (indexById.has(key)) return key;
    if (indexByBrandCode.has(key)) return key;
  }
  return null;
}

export function previewProductCsvImport(
  csvText: string,
  existing: AdminProductRow[],
): AdminProductImportPreviewRow[] {
  const indexById = new Map(existing.map((r) => [r.productId, r]));
  const indexByBrandCode = new Map(existing.map((r) => [`${r.brand}:${r.batteryCode}`, r]));
  const records = csvToRecords(csvText);
  const results: AdminProductImportPreviewRow[] = [];

  for (const rec of records) {
    const productId = resolveProductId(rec, indexById, indexByBrandCode);
    if (!productId) {
      results.push({
        productId: rec.productid || `${rec.brand}:${rec.batterycode}`,
        brand: rec.brand ?? "",
        batteryCode: rec.batterycode ?? "",
        status: "failed",
        message: "매칭 실패 — productId 또는 brand+batteryCode 확인",
        changes: [],
      });
      continue;
    }

    const row = indexById.get(productId)!;
    const changes: AdminProductImportPreviewRow["changes"] = [];

    if (rec.internetprice?.trim()) {
      const p = parsePrice(rec.internetprice);
      if (p === "invalid") {
        results.push({
          productId,
          brand: row.brand,
          batteryCode: row.batteryCode,
          status: "failed",
          message: "인터넷가 숫자 오류",
          changes: [],
        });
        continue;
      }
      if (p !== null && p !== row.internetPrice) {
        changes.push({
          field: "internetPrice",
          before: String(row.internetPrice ?? ""),
          after: String(p),
        });
      }
    }

    if (rec.onsiteprice?.trim()) {
      const p = parsePrice(rec.onsiteprice);
      if (p === "invalid") {
        results.push({
          productId,
          brand: row.brand,
          batteryCode: row.batteryCode,
          status: "failed",
          message: "출장가 숫자 오류",
          changes: [],
        });
        continue;
      }
      if (p !== null && p !== row.onsitePrice) {
        changes.push({
          field: "onsitePrice",
          before: String(row.onsitePrice ?? ""),
          after: String(p),
        });
      }
    }

    const textFields: { field: keyof AdminProductRow; key: string }[] = [
      { field: "displayName", key: "displayname" },
      { field: "adminName", key: "adminname" },
      { field: "saleStatus", key: "salestatus" },
      { field: "memo", key: "memo" },
    ];
    for (const { field, key } of textFields) {
      const v = rec[key]?.trim();
      if (!v) continue;
      const before = String(row[field] ?? "");
      if (v !== before) {
        changes.push({ field, before, after: v });
      }
    }

    if (rec.visible?.trim()) {
      const v = rec.visible.toLowerCase() === "true";
      if (v !== row.visible) {
        changes.push({ field: "visible", before: String(row.visible), after: String(v) });
      }
    }

    if (changes.length === 0) {
      results.push({
        productId,
        brand: row.brand,
        batteryCode: row.batteryCode,
        status: "unchanged",
        changes: [],
      });
    } else {
      const needsReview =
        changes.some((c) => c.field === "internetPrice" || c.field === "onsitePrice") &&
        row.saleStatus === "selling";
      results.push({
        productId,
        brand: row.brand,
        batteryCode: row.batteryCode,
        status: needsReview ? "needs_review" : "success",
        changes,
      });
    }
  }

  return results;
}

export function productIdFromImportRow(row: AdminProductImportPreviewRow): string | null {
  return decodeProductId(row.productId) ? row.productId : null;
}
