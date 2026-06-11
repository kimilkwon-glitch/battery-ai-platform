import {
  RETENTION_ANONYMIZED_CUSTOMER_NAME,
  RETENTION_ANONYMIZED_INQUIRY_MESSAGE,
  RETENTION_ANONYMIZED_TALK_MESSAGE,
  RETENTION_ADMIN_MEMO_TAG,
} from "@/lib/retention/operational-data-retention";

const FRIENDLY_ANONYMIZED_NAME = "정보 숨김 고객";

export function formatAdminCustomerName(name: string | null | undefined): string {
  const n = (name ?? "").trim();
  if (!n || n === RETENTION_ANONYMIZED_CUSTOMER_NAME) return FRIENDLY_ANONYMIZED_NAME;
  return n;
}

export function formatAdminInquiryMessage(message: string | null | undefined): string {
  const m = (message ?? "").trim();
  if (!m) return "아직 등록된 내용이 없습니다.";
  if (m === RETENTION_ANONYMIZED_INQUIRY_MESSAGE || m === RETENTION_ANONYMIZED_TALK_MESSAGE) {
    return "개인정보 보관기간이 지나 고객 정보가 숨김 처리된 상담입니다.";
  }
  if (m.includes("retention_anonymized") || m.includes(RETENTION_ADMIN_MEMO_TAG)) {
    return "보관기간 만료로 일부 정보가 숨김 처리되었습니다.";
  }
  return m;
}

/** 상담문의 목록 미리보기 — 빈 값이면 null (반복 placeholder 금지) */
export function formatAdminInquiryListPreview(message: string | null | undefined): string | null {
  const m = (message ?? "").trim();
  if (!m) return null;
  if (m === RETENTION_ANONYMIZED_INQUIRY_MESSAGE || m === RETENTION_ANONYMIZED_TALK_MESSAGE) {
    return "개인정보 보관기간이 지나 고객 정보가 숨김 처리된 상담입니다.";
  }
  if (m.includes("retention_anonymized") || m.includes(RETENTION_ADMIN_MEMO_TAG)) {
    return "보관기간 만료로 일부 정보가 숨김 처리되었습니다.";
  }
  return m.length > 80 ? `${m.slice(0, 80)}…` : m;
}

export function formatAdminContact(contact: string | null | undefined, masked?: string): string {
  const c = (contact ?? "").trim();
  if (c === "00000000000" || c.replace(/\D/g, "") === "00000000000") {
    return "연락처 숨김";
  }
  return masked ?? c;
}

/** 상담 목록 카드 미리보기 — 빈 값이면 null (카드에 반복 문구 노출 금지) */
export function formatBatteryTalkCardPreview(message: string | null | undefined): string | null {
  const m = (message ?? "").trim();
  if (!m) return null;
  if (m === RETENTION_ANONYMIZED_INQUIRY_MESSAGE || m === RETENTION_ANONYMIZED_TALK_MESSAGE) {
    return "개인정보 보관기간이 지나 고객 정보가 숨김 처리된 상담입니다.";
  }
  if (m.includes("retention_anonymized") || m.includes(RETENTION_ADMIN_MEMO_TAG)) {
    return "보관기간 만료로 일부 정보가 숨김 처리되었습니다.";
  }
  if (m.startsWith("배터리매니저입니다.") || m.startsWith("현재 보고 계신 상품")) {
    return null;
  }
  return m.length > 72 ? `${m.slice(0, 72)}…` : m;
}

export const ADMIN_EMPTY_LIST_MESSAGE = "아직 등록된 내용이 없습니다.";

export const ADMIN_EMPTY_ORDER_MESSAGE = "현재 처리할 주문이 없습니다.";

export const ADMIN_EMPTY_ORDER_VIEW_MESSAGES: Record<string, string> = {
  new_order: "현재 처리할 신규주문이 없습니다.",
  preparing: "현재 처리할 상품준비 주문이 없습니다.",
  needs_invoice: "송장등록이 필요한 주문이 없습니다.",
  in_progress: "현재 처리할 배송·출장 주문이 없습니다.",
  completed: "완료·구매확정된 주문이 없습니다.",
  cancel_request: "현재 처리할 취소요청이 없습니다.",
  return_exchange: "현재 처리할 반품·교환요청이 없습니다.",
};
