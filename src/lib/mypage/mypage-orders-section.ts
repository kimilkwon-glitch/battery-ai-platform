/**
 * 마이페이지 주문 영역 — GET /api/orders/mine 연동
 *
 * @see src/lib/orders/mall-order-api-contract.ts
 */

import {
  COMMERCE_ORDER_LOOKUP_PAGE,
  ORDER_REQUEST_LOOKUP_PAGE,
} from "@/lib/customer-center-routes";
import type { MallOrderMineListItemExtended } from "@/lib/orders/commerce-order-mine";

/** 마이페이지 주문 empty state CTA */
export const MYPAGE_ORDER_CTAS = {
  guestOrderLookup: COMMERCE_ORDER_LOOKUP_PAGE,
  consultationLookup: ORDER_REQUEST_LOOKUP_PAGE,
  search: "/search",
} as const;

export const MYPAGE_ORDERS_MINE_API = "/api/orders/mine" as const;

export type MyOrdersFetchResult =
  | { ok: true; orders: MallOrderMineListItemExtended[] }
  | { ok: false; message: string; unauthorized?: boolean };

export async function fetchMyCommerceOrders(): Promise<MyOrdersFetchResult> {
  try {
    const res = await fetch(MYPAGE_ORDERS_MINE_API, {
      credentials: "include",
      cache: "no-store",
    });

    if (res.status === 401) {
      return { ok: false, message: "로그인이 필요합니다.", unauthorized: true };
    }

    const data = (await res.json()) as {
      ok?: boolean;
      orders?: MallOrderMineListItemExtended[];
      message?: string;
    };

    if (!res.ok || !data.ok) {
      return {
        ok: false,
        message: data.message ?? "주문 내역을 불러오지 못했습니다.",
      };
    }

    return { ok: true, orders: data.orders ?? [] };
  } catch {
    return {
      ok: false,
      message: "주문 내역을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export function formatOrderDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatOrderAmount(amount: number | null): string {
  if (amount == null) return "금액 확인 중";
  return `${amount.toLocaleString("ko-KR")}원`;
}
