"use client";

import type {
  AdminOrderRequestListItem,
  CreateOrderRequestInput,
  PersistedOrderRequest,
  UpdateOrderRequestInput,
} from "@/types/order-request";

const adminFetchInit: RequestInit = {
  credentials: "include",
};

export type CreateOrderRequestApiResponse = {
  ok: boolean;
  request?: {
    id: string;
    requestNumber: string;
    status: string;
    createdAt: string;
  };
  errors?: string[];
  message?: string;
};

export async function submitOrderRequest(
  input: CreateOrderRequestInput,
): Promise<CreateOrderRequestApiResponse> {
  const res = await fetch("/api/order-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as CreateOrderRequestApiResponse & {
    errors?: string[];
  };
  if (!res.ok) {
    return {
      ok: false,
      errors: data.errors ?? [data.message ?? "접수에 실패했습니다."],
    };
  }
  return data;
}

export async function fetchAdminOrderRequests(
  params?: { status?: string; q?: string },
): Promise<{ ok: boolean; items?: AdminOrderRequestListItem[]; error?: string }> {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.q) sp.set("q", params.q);
  const qs = sp.toString();
  const res = await fetch(
    `/api/admin/order-requests${qs ? `?${qs}` : ""}`,
    adminFetchInit,
  );
  const data = await res.json();
  if (!res.ok) {
    return {
      ok: false,
      error:
        data.error === "UNAUTHORIZED"
          ? "관리자 세션이 만료되었습니다. 다시 로그인해 주세요."
          : "목록을 불러오지 못했습니다.",
    };
  }
  return { ok: true, items: data.items as AdminOrderRequestListItem[] };
}

export async function fetchAdminOrderRequestDetail(
  id: string,
): Promise<{ ok: boolean; record?: PersistedOrderRequest; error?: string }> {
  const res = await fetch(
    `/api/admin/order-requests/${encodeURIComponent(id)}`,
    adminFetchInit,
  );
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: data.message ?? "상세를 불러오지 못했습니다." };
  }
  return { ok: true, record: data.record as PersistedOrderRequest };
}

export async function patchAdminOrderRequest(
  id: string,
  patch: UpdateOrderRequestInput,
): Promise<{ ok: boolean; record?: PersistedOrderRequest; error?: string }> {
  const res = await fetch(`/api/admin/order-requests/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(patch),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: data.message ?? "저장에 실패했습니다." };
  }
  return { ok: true, record: data.record as PersistedOrderRequest };
}
