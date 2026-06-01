import { appendOrderRequestToList } from "@/lib/order-request/order-request-admin-storage";
import {
  ORDER_REQUEST_DRAFT_KEY,
  ORDER_REQUEST_LAST_KEY,
  type OrderRequest,
} from "@/types/order-request";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveOrderRequestDraft(draft: Partial<OrderRequest>): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(ORDER_REQUEST_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

export function loadOrderRequestDraft(): Partial<OrderRequest> | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(ORDER_REQUEST_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<OrderRequest>;
  } catch {
    return null;
  }
}

export function saveLastOrderRequest(request: OrderRequest): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(ORDER_REQUEST_LAST_KEY, JSON.stringify(request));
    localStorage.removeItem(ORDER_REQUEST_DRAFT_KEY);
    appendOrderRequestToList(request);
  } catch {
    /* ignore */
  }
}

export function loadLastOrderRequest(): OrderRequest | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(ORDER_REQUEST_LAST_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OrderRequest;
  } catch {
    return null;
  }
}

export { ORDER_REQUEST_DRAFT_KEY, ORDER_REQUEST_LAST_KEY };
