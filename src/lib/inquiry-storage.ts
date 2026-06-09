/**
 * 고객 문의 클라이언트 API — 서버 JSON 저장소 연동.
 * localStorage는 dev-only fallback (API 실패 시에만).
 */

import {
  normalizeInquiryCategory,
  type CustomerInquiryRecord,
  type InquiryCategory,
  type InquirySource,
  type InquiryStatus,
} from "@/types/customer-inquiry";

export type {
  CustomerInquiryRecord as InquiryRecord,
  InquiryStatus,
  InquirySource,
  InquiryCategory,
};

const STORAGE_KEY = "bm-inquiries-v1-dev-fallback";

function readLocalFallback(): CustomerInquiryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomerInquiryRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalFallback(rows: CustomerInquiryRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export type SubmitInquiryInput = {
  name: string;
  contact: string;
  vehicle?: string;
  region?: string;
  message: string;
  title?: string;
  batteryCode?: string;
  productCode?: string;
  productName?: string;
  returnOption?: string;
  pageUrl?: string;
  source?: InquirySource;
  inquiryType?: string;
  category?: InquiryCategory;
  couponCode?: string;
  isSecret?: boolean;
};

/** @deprecated 관리자는 /api/admin/inquiries 사용 */
export function listInquiries(): CustomerInquiryRecord[] {
  return readLocalFallback().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function submitInquiry(
  input: SubmitInquiryInput,
): Promise<{ ok: boolean; id?: string }> {
  try {
    const res = await fetch("/api/support/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { ok?: boolean; id?: string };
    if (res.ok && data.ok) {
      return { ok: true, id: data.id };
    }
  } catch {
    /* fallback below */
  }

  if (process.env.NODE_ENV === "development") {
    const now = new Date().toISOString();
    const row: CustomerInquiryRecord = {
      id: `inq_local_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      status: "new",
      category: input.category ?? normalizeInquiryCategory(input.inquiryType),
      name: input.name.trim() || "고객",
      contact: input.contact.trim(),
      vehicle: input.vehicle?.trim(),
      region: input.region?.trim(),
      message: input.message.trim(),
      title: input.title?.trim(),
      batteryCode: input.batteryCode?.trim(),
      productCode: input.productCode?.trim(),
      productName: input.productName?.trim(),
      isSecret: input.isSecret === true,
      returnOption: input.returnOption?.trim(),
      pageUrl: input.pageUrl?.trim(),
      source: input.source,
      inquiryType: input.inquiryType,
      couponCode: input.couponCode?.trim(),
      adminMemo: "",
    };
    writeLocalFallback([row, ...readLocalFallback()]);
    return { ok: true, id: row.id };
  }

  return { ok: false };
}

/** @deprecated submitInquiry 사용 */
export function addInquiry(input: Omit<CustomerInquiryRecord, "id" | "createdAt" | "updatedAt" | "status" | "category" | "adminMemo"> & { inquiryType?: string }) {
  void submitInquiry(input);
  return { id: "pending", createdAt: new Date().toISOString(), status: "new" as const, ...input, category: normalizeInquiryCategory(input.inquiryType), updatedAt: new Date().toISOString(), adminMemo: "" };
}

/** @deprecated 관리자 API 사용 */
export function updateInquiryStatus(_id: string, _status: InquiryStatus) {
  /* no-op — admin uses API */
}

/** @deprecated 관리자 API 사용 */
export function deleteInquiry(_id: string) {
  /* no-op */
}
