/** 상품 Q&A 상세 탭 URL (client/server 공용) */
export function buildProductQnaDetailUrl(batteryCode: string, inquiryId?: string): string {
  const code = encodeURIComponent(batteryCode.trim());
  const params = new URLSearchParams({ tab: "qna" });
  if (inquiryId) params.set("highlight", inquiryId);
  return `/batteries/${code}?${params.toString()}#battery-qna`;
}
