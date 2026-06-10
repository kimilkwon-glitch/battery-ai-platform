/** 문의·배터리톡 운영 데이터 보관·비식별 정책 (스크립트·관리자 UI 공용) */

import { isAdminTestInquiry } from "@/lib/admin/admin-test-data-filter";
import { isUx2AdminReviewRecord } from "@/lib/admin/ux2-admin-review-marker";
import { isProductQnaSource, type InquirySource } from "@/types/customer-inquiry";

export const RETENTION_ANONYMIZED_CUSTOMER_NAME = "비식별 고객";
export const RETENTION_MASKED_CONTACT = "00000000000";
export const RETENTION_ANONYMIZED_INQUIRY_MESSAGE =
  "[보관기간 경과로 비식별 처리된 상담문의입니다.]";
export const RETENTION_ANONYMIZED_TALK_MESSAGE =
  "[보관기간 경과로 비식별 처리된 배터리톡 메시지입니다.]";
export const RETENTION_ADMIN_MEMO_TAG = "retention_anonymized";

export const GENERAL_INQUIRY_RETENTION_MONTHS = 6;
export const BATTERY_TALK_RETENTION_MONTHS = 12;

export const RETENTION_POLICY_SUMMARY = {
  productQna: "상품문의/Q&A: 계속 보관",
  generalInquiry: "일반 상담문의: 6개월 후 비식별 처리",
  batteryTalk: "배터리톡: 1년 후 비식별 처리",
  defaultMode: "정리 방식: 기본 비식별 처리, dry-run 후 실행 가능",
} as const;

export const RETENTION_CUSTOMER_NOTICE =
  "상품문의/Q&A는 상품 정보 제공 및 고객 응대 이력 관리를 위해 계속 보관될 수 있습니다. 일반 상담문의는 접수일로부터 6개월 경과 후 비식별 처리되며, 배터리톡 상담 내역은 마지막 상담일로부터 1년 경과 후 비식별 처리됩니다. 단, 관계 법령상 보관이 필요한 정보 또는 주문·분쟁 처리에 필요한 최소 정보는 해당 기간 동안 보관될 수 있습니다.";

export type RetentionCleanupMode = "anonymize" | "delete";

export function subtractMonths(from: Date, months: number): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() - months);
  return d;
}

export function formatRetentionCutoffIso(cutoff: Date): string {
  return cutoff.toISOString();
}

export function getGeneralInquiryCutoff(now = new Date()): Date {
  return subtractMonths(now, GENERAL_INQUIRY_RETENTION_MONTHS);
}

export function getBatteryTalkCutoff(now = new Date()): Date {
  return subtractMonths(now, BATTERY_TALK_RETENTION_MONTHS);
}

export function isGeneralInquirySource(source: string | null | undefined): boolean {
  if (!source) return true;
  if (isProductQnaSource(source as InquirySource)) return false;
  if (source === "batterytalk") return false;
  return true;
}

export function isRetentionAnonymizedInquiry(row: {
  name?: string | null;
  contact?: string | null;
  message?: string | null;
  adminMemo?: string | null;
}): boolean {
  if (row.name?.trim() === RETENTION_ANONYMIZED_CUSTOMER_NAME) return true;
  if (row.message?.trim() === RETENTION_ANONYMIZED_INQUIRY_MESSAGE) return true;
  if ((row.adminMemo ?? "").includes(RETENTION_ADMIN_MEMO_TAG)) return true;
  if (row.contact?.trim() === RETENTION_MASKED_CONTACT) return true;
  return false;
}

export function isRetentionAnonymizedBatteryTalkSession(row: {
  customerName?: string | null;
  customerPhone?: string | null;
  adminMemo?: string | null;
  lastMessage?: string | null;
}): boolean {
  if (row.customerName?.trim() === RETENTION_ANONYMIZED_CUSTOMER_NAME) return true;
  if (row.customerPhone?.trim() === RETENTION_MASKED_CONTACT) return true;
  if ((row.adminMemo ?? "").includes(RETENTION_ADMIN_MEMO_TAG)) return true;
  if (row.lastMessage?.trim() === RETENTION_ANONYMIZED_TALK_MESSAGE) return true;
  return false;
}

export function isRetentionAnonymizedBatteryTalkMessage(message: string | null | undefined): boolean {
  return message?.trim() === RETENTION_ANONYMIZED_TALK_MESSAGE;
}

/** UX2·시드·플레이스홀더 등 — ux2:cleanup 전용, retention 대상 제외 */
export function isRetentionExcludedTestInquiry(row: {
  name: string;
  contact: string;
  message?: string | null;
  vehicle?: string | null;
  inquiryType?: string | null;
  adminMemo?: string | null;
}): boolean {
  return isAdminTestInquiry(row);
}

export function isRetentionExcludedTestBatteryTalk(row: {
  customerName?: string | null;
  customerPhone: string;
  adminMemo?: string | null;
}): boolean {
  if (
    isUx2AdminReviewRecord({
      name: row.customerName,
      phone: row.customerPhone,
      adminMemo: row.adminMemo,
    })
  ) {
    return true;
  }
  return isAdminTestInquiry({
    name: row.customerName ?? "",
    contact: row.customerPhone,
    adminMemo: row.adminMemo,
  });
}

export function appendRetentionAdminMemo(existing: string | null | undefined): string {
  const base = (existing ?? "").trim();
  if (base.includes(RETENTION_ADMIN_MEMO_TAG)) return base;
  return base ? `${base}\n${RETENTION_ADMIN_MEMO_TAG}` : RETENTION_ADMIN_MEMO_TAG;
}

export function batteryTalkSessionActivityAt(row: {
  lastMessageAt?: string | Date | null;
  updatedAt: string | Date;
}): Date {
  const raw = row.lastMessageAt ?? row.updatedAt;
  return raw instanceof Date ? raw : new Date(raw);
}

export function batteryTalkSessionHasOrderLink(contextJson: unknown): boolean {
  if (!contextJson || typeof contextJson !== "object") return false;
  const ctx = contextJson as Record<string, unknown>;
  const orderId = typeof ctx.orderId === "string" ? ctx.orderId.trim() : "";
  const orderNumber = typeof ctx.orderNumber === "string" ? ctx.orderNumber.trim() : "";
  return Boolean(orderId || orderNumber);
}

export function buildAnonymizedInquiryUpdate(): {
  name: string;
  contact: string;
  message: string;
  vehicle: null;
  region: null;
  title: null;
  couponCode: null;
  adminMemo: string;
} {
  return {
    name: RETENTION_ANONYMIZED_CUSTOMER_NAME,
    contact: RETENTION_MASKED_CONTACT,
    message: RETENTION_ANONYMIZED_INQUIRY_MESSAGE,
    vehicle: null,
    region: null,
    title: null,
    couponCode: null,
    adminMemo: RETENTION_ADMIN_MEMO_TAG,
  };
}
