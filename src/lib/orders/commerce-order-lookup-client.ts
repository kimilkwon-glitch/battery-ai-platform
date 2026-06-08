import type { CommerceOrderGuestLookupResult } from "@/lib/orders/commerce-order-mine";

export type CommerceOrderLookupResult =
  | { ok: true; lookup: CommerceOrderGuestLookupResult }
  | { ok: false; message: string };

export async function lookupCommerceOrderApi(
  orderRef: string,
  phone: string,
): Promise<CommerceOrderLookupResult> {
  try {
    const res = await fetch("/api/orders/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNumber: orderRef.trim(),
        orderId: orderRef.trim(),
        phone: phone.trim(),
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      lookup?: CommerceOrderGuestLookupResult;
      message?: string;
    };
    if (!res.ok || !data.ok || !data.lookup) {
      return {
        ok: false,
        message:
          data.message ?? "입력하신 정보와 일치하는 주문을 찾을 수 없습니다.",
      };
    }
    return { ok: true, lookup: data.lookup };
  } catch {
    return {
      ok: false,
      message: "조회 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}
