import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type {
  AdminProductOverride,
  AdminProductPriceHistoryEntry,
} from "@/types/admin-product";

const DATA_DIR = join(process.cwd(), "data", "admin");
const OVERRIDES_PATH = join(DATA_DIR, "product-overrides.json");
const HISTORY_PATH = join(DATA_DIR, "product-price-history.json");

type OverrideMap = Record<string, AdminProductOverride>;

function ensureDir(): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function loadProductOverrides(): OverrideMap {
  return readJson<OverrideMap>(OVERRIDES_PATH, {});
}

export function getProductOverride(productId: string): AdminProductOverride | undefined {
  return loadProductOverrides()[productId];
}

export function saveProductOverride(
  productId: string,
  patch: AdminProductOverride,
  meta?: { changedBy?: string; reason?: string },
): AdminProductOverride {
  ensureDir();
  const all = loadProductOverrides();
  const prev = all[productId] ?? {};
  const next: AdminProductOverride = {
    ...prev,
    ...patch,
    updatedAt: new Date().toISOString(),
    updatedBy: meta?.changedBy ?? patch.updatedBy ?? "admin",
  };
  all[productId] = next;
  writeFileSync(OVERRIDES_PATH, JSON.stringify(all, null, 2), "utf8");

  const history = readJson<AdminProductPriceHistoryEntry[]>(HISTORY_PATH, []);
  for (const field of ["internetPrice", "onsitePrice"] as const) {
    if (patch[field] !== undefined && patch[field] !== prev[field]) {
      history.unshift({
        id: `ph_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        productId,
        field,
        previousValue: prev[field] ?? null,
        nextValue: patch[field] ?? null,
        changedBy: meta?.changedBy ?? "admin",
        reason: meta?.reason,
        createdAt: new Date().toISOString(),
      });
    }
  }
  writeFileSync(HISTORY_PATH, JSON.stringify(history.slice(0, 500), null, 2), "utf8");
  return next;
}

export function loadProductPriceHistory(productId?: string): AdminProductPriceHistoryEntry[] {
  const all = readJson<AdminProductPriceHistoryEntry[]>(HISTORY_PATH, []);
  if (!productId) return all;
  return all.filter((h) => h.productId === productId);
}
