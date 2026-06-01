/** API 접수 완료 화면용 최소 스냅샷 (sessionStorage) */
export const ORDER_REQUEST_LAST_API_KEY =
  "battery-manager-last-order-request-api-v1" as const;

export type OrderRequestLastApiSnapshot = {
  id: string;
  requestNumber: string;
  status: string;
  createdAt: string;
};

export function saveLastApiOrderRequest(snapshot: OrderRequestLastApiSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ORDER_REQUEST_LAST_API_KEY, JSON.stringify(snapshot));
  } catch {
    /* ignore */
  }
}

export function loadLastApiOrderRequest(): OrderRequestLastApiSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ORDER_REQUEST_LAST_API_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OrderRequestLastApiSnapshot;
  } catch {
    return null;
  }
}
