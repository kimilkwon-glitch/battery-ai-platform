"use client";

import type { CustomerOrderRequestLookup } from "@/types/order-request";

export async function lookupOrderRequestApi(
  requestNumber: string,
  phone: string,
): Promise<
  | { ok: true; lookup: CustomerOrderRequestLookup }
  | { ok: false; message?: string; errors?: string[] }
> {
  const res = await fetch("/api/order-requests/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestNumber, phone, website: "" }),
  });
  const data = await res.json();
  if (!res.ok) {
    return {
      ok: false,
      message: data.message as string | undefined,
      errors: data.errors as string[] | undefined,
    };
  }
  return { ok: true, lookup: data.lookup as CustomerOrderRequestLookup };
}
