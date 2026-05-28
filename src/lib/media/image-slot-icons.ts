/** 이미지 슬롯 placeholder — 목적별 아이콘 (실사 전 의도 표시) */
export function imageSlotPurposeIcon(purpose: string, assetKey: string): string {
  if (purpose.includes("store") || assetKey.includes("store")) return "🏪";
  if (purpose.includes("outbound") || purpose.includes("field")) return "🚗";
  if (purpose.includes("inspection") || purpose.includes("tester")) return "🔧";
  if (purpose.includes("delivery") || purpose.includes("pack")) return "📦";
  if (purpose.includes("label")) return "🏷️";
  if (purpose.includes("symptom") || purpose.includes("blackbox")) return "⚡";
  if (purpose.includes("vehicle") || assetKey.includes("vehicle")) return "🚙";
  if (purpose.includes("battery") || purpose.includes("product")) return "🔋";
  if (purpose.includes("qna") || purpose.includes("terminal")) return "📋";
  if (purpose.includes("photo") || purpose.includes("guide")) return "📷";
  return "🖼️";
}
