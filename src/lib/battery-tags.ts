import { normalizeBatteryCode } from "@/lib/batteryNormalize";

const BATTERY_TAG_PATTERN = /\b(AGM\d+[LR]?|DIN\d+[LR]?|EV\s*12V(?:\s*AGM)?)\b/gi;

/** Q&A·가이드 태그/제목에서 배터리 규격 코드 추출 */
export function extractBatteryCodesFromTags(tags: string[]): string[] {
  const out = new Set<string>();
  for (const tag of tags) {
    const matches = tag.matchAll(BATTERY_TAG_PATTERN);
    for (const m of matches) {
      const code = normalizeBatteryCode(m[0]!.replace(/\s+/g, " "));
      if (code) out.add(code);
    }
  }
  return [...out];
}
