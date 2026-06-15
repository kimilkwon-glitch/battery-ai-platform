import type { CommerceOrderGuestLookupResult } from "@/lib/orders/commerce-order-mine";

export type CommerceOrderLookupResult =
  | { ok: true; orders: CommerceOrderGuestLookupResult[]; count: number }
  | { ok: false; message: string };

export async function lookupCommerceOrdersByIdentityApi(
  customerName: string,
  phone: string,
): Promise<CommerceOrderLookupResult> {
  try {
    const res = await fetch("/api/orders/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        customerName: customerName.trim(),
        phone: phone.trim(),
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      orders?: CommerceOrderGuestLookupResult[];
      count?: number;
      message?: string;
    };
    if (!res.ok || !data.ok || !Array.isArray(data.orders)) {
      return {
        ok: false,
        message: data.message ?? "입력하신 정보와 일치하는 주문을 찾을 수 없습니다.",
      };
    }
    return { ok: true, orders: data.orders, count: data.count ?? data.orders.length };
  } catch {
    return {
      ok: false,
      message: "조회 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

/** @deprecated 주문번호+연락처 — 내부/레거시용 */
export async function lookupCommerceOrderApi(
  orderRef: string,
  phone: string,
): Promise<
  | { ok: true; lookup: CommerceOrderGuestLookupResult }
  | { ok: false; message: string }
> {
  const res = await lookupCommerceOrdersByIdentityApi(orderRef, phone);
  if (!res.ok) return res;
  const match = res.orders.find(
    (o) => o.orderNumber === orderRef.trim() || o.orderId === orderRef.trim(),
  );
  if (!match) {
    return { ok: false, message: "입력하신 정보와 일치하는 주문을 찾을 수 없습니다." };
  }
  return { ok: true, lookup: match };
}
