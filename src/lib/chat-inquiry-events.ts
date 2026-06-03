export type ChatInquiryVariant = "product" | "general";

export type ChatInquiryOpenDetail = {
  batteryCode?: string;
  returnOption?: string;
  vehicle?: string;
  variant?: ChatInquiryVariant;
};

export const CHAT_INQUIRY_OPEN_EVENT = "bm-open-chat-inquiry";

export function openChatInquiry(detail?: ChatInquiryOpenDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHAT_INQUIRY_OPEN_EVENT, { detail }));
}

export function openProductInquiry(detail: { batteryCode: string; vehicle?: string }) {
  openChatInquiry({ ...detail, variant: "product" });
}
