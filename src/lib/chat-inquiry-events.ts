export type ChatInquiryOpenDetail = {
  batteryCode?: string;
  returnOption?: string;
  vehicle?: string;
};

export const CHAT_INQUIRY_OPEN_EVENT = "bm-open-chat-inquiry";

export function openChatInquiry(detail?: ChatInquiryOpenDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHAT_INQUIRY_OPEN_EVENT, { detail }));
}
