import { getBatteryImageSet, getCanonicalBatteryCode } from "@/lib/battery-alias-map";
import type { BatteryImageSet } from "@/lib/battery-alias-map";
import { batteryImageSetForCode } from "@/lib/battery-image";
import { getBattery } from "@/lib/platform-data";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { normalizeBatteryCode } from "@/lib/batteryNormalize";

export type BatterySpecDisplay = {
  code: string;
  typeLabel: string;
  seriesLabel: string;
  terminalLabel: string | null;
  capacity: string | null;
  cca: string | null;
  imageSet: BatteryImageSet | null;
  imageAlt: string;
};

function parseSpecParts(code: string): { type: string; series: string; terminal: string | null } {
  const m = code.match(/^(AGM|DIN|CMF|GB|EFB|MF|EV)(\d+)([LR])?$/i);
  if (!m) {
    const terminal = /[LR]$/i.test(code) ? `${code.slice(-1).toUpperCase()}타입` : null;
    return { type: "배터리", series: code, terminal };
  }
  const type = m[1]!.toUpperCase();
  const num = m[2]!;
  const side = m[3]?.toUpperCase();
  return {
    type,
    series: side ? `${num}${side} 계열` : `${num} 계열`,
    terminal: side ? `${side}타입` : null,
  };
}

export function resolvePrimaryBatteryCode(
  displayValue: string | null,
  primaryCodes: string[],
): string | null {
  for (const c of primaryCodes) {
    const p = canonicalBatteryCode(c);
    if (p) return p;
  }
  if (!displayValue) return null;
  const stripped = displayValue.replace(/\s*계열\s*$/u, "").trim().split(/\s*\/\s*/)[0]?.trim() ?? "";
  return canonicalBatteryCode(getCanonicalBatteryCode(stripped) || stripped) || null;
}

export function parseBatterySpecDisplay(rawCode: string): BatterySpecDisplay {
  const code = canonicalBatteryCode(rawCode) || normalizeBatteryCode(rawCode) || rawCode;
  const bat = getBattery(code);
  const parts = parseSpecParts(code);
  const rocket = getBatteryImageSet(code, "rocket");
  let imageSet = rocket?.main ? rocket : batteryImageSetForCode(code);
  if (!imageSet?.main && /^\d{2,3}R$/i.test(code)) {
    imageSet =
      batteryImageSetForCode("CMF100R") ??
      batteryImageSetForCode("CMF90R") ??
      batteryImageSetForCode("90R") ??
      imageSet;
  }

  return {
    code,
    typeLabel: bat.type?.trim() || parts.type,
    seriesLabel: parts.series,
    terminalLabel: bat.terminal?.trim() ? `${bat.terminal.trim()}타입` : parts.terminal,
    capacity: bat.capacity?.trim() || null,
    cca: bat.cca?.trim() || null,
    imageSet: imageSet?.main ? imageSet : null,
    imageAlt: `${code} 배터리 이미지`,
  };
}
