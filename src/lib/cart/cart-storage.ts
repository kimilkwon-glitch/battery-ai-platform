import type { BatteryCartItem, BatteryCartSummary } from "@/types/cart";
import { CART_STORAGE_KEY } from "@/types/cart";

export { CART_STORAGE_KEY };

export const CART_UPDATED_EVENT = "battery-cart-updated" as const;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function dispatchCartUpdated(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
}

function normalizeItem(raw: Partial<BatteryCartItem> & { id: string }): BatteryCartItem {
  const now = new Date().toISOString();
  return {
    id: raw.id,
    productId: raw.productId ?? raw.batterySpec ?? "unknown",
    productName: raw.productName?.trim() || "배터리 상품",
    brandName: raw.brandName,
    batterySpec: raw.batterySpec?.trim() || "규격 확인 필요",
    terminalDirection: raw.terminalDirection,
    quantity: Math.max(1, raw.quantity ?? 1),
    basePrice: raw.basePrice,
    finalPrice: raw.finalPrice,
    imageSrc: raw.imageSrc ?? null,
    vehicle: raw.vehicle,
    recommendationStatus: raw.recommendationStatus,
    fitmentStatus: raw.fitmentStatus ?? "unknown",
    usedBatteryReturn: {
      option: raw.usedBatteryReturn?.option ?? "undecided",
      priceImpact: raw.usedBatteryReturn?.priceImpact,
      guideRequired: raw.usedBatteryReturn?.guideRequired ?? true,
      guideAcknowledged: raw.usedBatteryReturn?.guideAcknowledged,
    },
    fulfillment: {
      method: raw.fulfillment?.method ?? "undecided",
      storeId: raw.fulfillment?.storeId,
      requestedRegion: raw.fulfillment?.requestedRegion,
    },
    install: {
      method: raw.install?.method ?? "undecided",
    },
    preOrderCheckRequired: raw.preOrderCheckRequired ?? true,
    photoCheckRequired: raw.photoCheckRequired ?? false,
    customerMemo: raw.customerMemo,
    warnings: Array.isArray(raw.warnings) ? raw.warnings : [],
    source: raw.source,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  };
}

function parseStoredItems(raw: string): BatteryCartItem[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row): row is Partial<BatteryCartItem> & { id: string } => {
        return typeof row === "object" && row !== null && typeof (row as { id?: string }).id === "string";
      })
      .map((row) => normalizeItem(row));
  } catch {
    return [];
  }
}

/** 병합 키 — fitment·차량·반납 옵션이 다르면 별도 라인 */
export function cartItemMergeKey(
  item: Pick<
    BatteryCartItem,
    "productId" | "batterySpec" | "vehicle" | "usedBatteryReturn" | "fitmentStatus"
  >,
): string {
  const vehicleKey =
    item.vehicle?.vehicleId ??
    [item.vehicle?.displayName, item.vehicle?.generationName, item.vehicle?.year]
      .filter(Boolean)
      .join("|") ??
    "";
  return [
    item.productId,
    item.batterySpec,
    vehicleKey,
    item.usedBatteryReturn.option,
    item.fitmentStatus,
  ].join("::");
}

export function getCartItems(): BatteryCartItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return parseStoredItems(raw);
  } catch {
    return [];
  }
}

export function saveCartItems(items: BatteryCartItem[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    dispatchCartUpdated();
  } catch {
    /* quota / private mode */
  }
}

export function addCartItem(item: BatteryCartItem): BatteryCartItem[] {
  const items = getCartItems();
  const key = cartItemMergeKey(item);
  const existing = items.find((i) => cartItemMergeKey(i) === key);
  const now = new Date().toISOString();

  let next: BatteryCartItem[];
  if (existing) {
    next = items.map((i) =>
      i.id === existing.id
        ? { ...i, quantity: i.quantity + item.quantity, updatedAt: now }
        : i,
    );
  } else {
    next = [...items, { ...item, createdAt: item.createdAt ?? now, updatedAt: now }];
  }
  saveCartItems(next);
  return next;
}

export function updateCartItem(
  itemId: string,
  patch: Partial<BatteryCartItem>,
): BatteryCartItem[] {
  const now = new Date().toISOString();
  const next = getCartItems().map((i) =>
    i.id === itemId
      ? normalizeItem({
          ...i,
          ...patch,
          id: i.id,
          usedBatteryReturn: patch.usedBatteryReturn
            ? { ...i.usedBatteryReturn, ...patch.usedBatteryReturn }
            : i.usedBatteryReturn,
          fulfillment: patch.fulfillment
            ? { ...i.fulfillment, ...patch.fulfillment }
            : i.fulfillment,
          install: patch.install ? { ...i.install, ...patch.install } : i.install,
          updatedAt: now,
        })
      : i,
  );
  saveCartItems(next);
  return next;
}

export function removeCartItem(itemId: string): BatteryCartItem[] {
  const next = getCartItems().filter((i) => i.id !== itemId);
  saveCartItems(next);
  return next;
}

export function clearCart(): void {
  saveCartItems([]);
}

export function itemNeedsReview(item: BatteryCartItem): boolean {
  return (
    item.fitmentStatus !== "confirmed" ||
    item.terminalDirection === "unknown" ||
    !item.terminalDirection ||
    item.usedBatteryReturn.option === "undecided" ||
    item.fulfillment.method === "undecided" ||
    !item.vehicle?.displayName
  );
}

export function getCartSummary(items: BatteryCartItem[]): BatteryCartSummary {
  const subtotal = items.reduce((sum, i) => {
    const unit = i.finalPrice ?? i.basePrice;
    if (unit == null || Number.isNaN(unit)) return sum;
    return sum + unit * i.quantity;
  }, 0);

  const usedBatteryReturnAdjustment = items.reduce(
    (sum, i) => sum + (i.usedBatteryReturn.priceImpact ?? 0) * i.quantity,
    0,
  );

  return {
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    usedBatteryReturnAdjustment,
    estimatedTotal: subtotal,
    hasNeedsReviewItem: items.some(itemNeedsReview),
    hasNoReturnItem: items.some((i) => i.usedBatteryReturn.option === "no_return"),
    hasUndecidedUsedBattery: items.some((i) => i.usedBatteryReturn.option === "undecided"),
    hasUndecidedFulfillment: items.some((i) => i.fulfillment.method === "undecided"),
  };
}
