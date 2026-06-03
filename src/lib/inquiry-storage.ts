/**
 * 상담 문의 임시 저장 — localStorage 전용 (실제 회원/DB 아님).
 * Production 운영에는 Supabase/Firebase 등 DB·인증 연동 필요.
 */

export type InquiryStatus = "new" | "reviewed" | "done";

export type InquirySource = "chat" | "support" | "product_detail";

export type InquiryRecord = {
  id: string;
  createdAt: string;
  status: InquiryStatus;
  name: string;
  contact: string;
  vehicle?: string;
  message: string;
  batteryCode?: string;
  returnOption?: string;
  pageUrl?: string;
  source?: InquirySource;
  inquiryType?: string;
  couponCode?: string;
};

const STORAGE_KEY = "bm-inquiries-v1";

function readAll(): InquiryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InquiryRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(rows: InquiryRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function listInquiries(): InquiryRecord[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addInquiry(
  input: Omit<InquiryRecord, "id" | "createdAt" | "status">,
): InquiryRecord {
  const row: InquiryRecord = {
    ...input,
    id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  writeAll([row, ...readAll()]);
  return row;
}

export function updateInquiryStatus(id: string, status: InquiryStatus) {
  writeAll(readAll().map((r) => (r.id === id ? { ...r, status } : r)));
}

export function deleteInquiry(id: string) {
  writeAll(readAll().filter((r) => r.id !== id));
}
