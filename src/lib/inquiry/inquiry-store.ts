/**
 * 고객 문의 저장소 파사드 — DATABASE_URL 시 Postgres, dev만 JSON fallback
 */

import path from "node:path";
import {
  assertOperationalStoreAvailable,
  isOperationalDbMode,
} from "@/lib/db/operational-store-config";
import type {
  CustomerInquiryRecord,
  InquiryStatus,
} from "@/types/customer-inquiry";

export type { InquiryCreateInput, InquiryListFilters } from "@/lib/inquiry/inquiry-store.postgres";

async function getStore() {
  assertOperationalStoreAvailable("inquiries");
  if (isOperationalDbMode()) return import("@/lib/inquiry/inquiry-store.postgres");
  return import("@/lib/inquiry/inquiry-store.json");
}

export async function inquiryCreate(
  input: import("@/lib/inquiry/inquiry-store.postgres").InquiryCreateInput,
): Promise<CustomerInquiryRecord> {
  return (await getStore()).inquiryCreate(input);
}

export async function inquiryList(
  filters: import("@/lib/inquiry/inquiry-store.postgres").InquiryListFilters = {},
): Promise<CustomerInquiryRecord[]> {
  return (await getStore()).inquiryList(filters);
}

export async function inquiryGetById(id: string): Promise<CustomerInquiryRecord | null> {
  return (await getStore()).inquiryGetById(id);
}

export async function inquiryUpdateStatus(
  id: string,
  status: InquiryStatus,
): Promise<CustomerInquiryRecord | null> {
  return (await getStore()).inquiryUpdateStatus(id, status);
}

export async function inquiryUpdateMemo(
  id: string,
  adminMemo: string,
): Promise<CustomerInquiryRecord | null> {
  return (await getStore()).inquiryUpdateMemo(id, adminMemo);
}

export async function inquirySetHidden(
  id: string,
  hidden: boolean,
): Promise<CustomerInquiryRecord | null> {
  return (await getStore()).inquirySetHidden(id, hidden);
}

export const INQUIRY_STORE_PATH = isOperationalDbMode()
  ? null
  : path.join(process.cwd(), ".data", "inquiries.json");
