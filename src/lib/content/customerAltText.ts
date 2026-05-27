/** 고객 화면용 alt — workbench 개발 메모 문구는 표시하지 않음 */
const DEV_ALT_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  { pattern: /AGM60\/70\/80\/95L.*추가 제작/i, replacement: "AGM 배터리 규격 비교 이미지" },
  { pattern: /DIN50\/62\/74L.*추가 제작/i, replacement: "DIN 배터리 규격 비교 이미지" },
  { pattern: /IBS.*추가 제작/i, replacement: "IBS 센서 오류 안내 이미지" },
  { pattern: /G80 RG3.*추가 제작/i, replacement: "G80 RG3 AGM95R 규격 안내 이미지" },
  { pattern: /AGM80L vs DIN74L.*추가 제작/i, replacement: "AGM80L과 DIN74L 오주문 비교 이미지" },
  { pattern: /포터2.*전용은 아니지만.*90R.*100R/i, replacement: "포터2 90R 100R 규격 비교 안내" },
  { pattern: /쏘렌토.*전용은 아니지만/i, replacement: "쏘렌토 하이브리드 AGM 규격 안내" },
  { pattern: /그랜저.*전용은 아니지만/i, replacement: "그랜저 연식·연료별 배터리 안내" },
  { pattern: /CCA\/Ah.*임시 사용/i, replacement: "CCA·Ah 배터리 용량 설명" },
  { pattern: /브랜드별.*임시 사용/i, replacement: "배터리 브랜드·규격 표기 안내" },
  { pattern: /컷오프.*전용은 아니/i, replacement: "주차 중 방전·컷오프 전압 안내" },
  { pattern: /임시 사용|추가 제작 권장|전용은 아니/i, replacement: "" },
];

export function toCustomerAltText(alt: string | undefined, titleFallback: string): string {
  const raw = (alt ?? "").trim();
  if (!raw) return titleFallback;

  for (const { pattern, replacement } of DEV_ALT_PATTERNS) {
    if (pattern.test(raw)) {
      return replacement || titleFallback;
    }
  }

  return raw;
}
