import { EMPTY_BATTERY_IMAGE_SET, getBatteryImageSet, getCanonicalBatteryCode } from "@/lib/battery-alias-map";
import type { BatteryImageSet } from "@/lib/battery-alias-map";
import { inferBatteryBrandKeyFromCode } from "@/lib/battery-brand-inference";
import { getBattery } from "@/lib/platform-data";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import {
  isBatteryMatched,
  isStrictProductCodeMatch,
  normalizeBatteryCode,
  productBatteryCode,
  terminalFromCode,
} from "@/lib/batteryNormalize";

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

/** 100R·90R 등 family 코드 — catalog fallback(첫 배터리) 오염 방지 */
export function resolveBatteryTerminalLabel(rawCode: string): string | null {
  const code = canonicalBatteryCode(rawCode) || normalizeBatteryCode(rawCode) || rawCode;
  const fromFamily = terminalFromCode(code);
  if (fromFamily) return `${fromFamily}타입`;
  const bat = getBattery(code, inferBatteryBrandKeyFromCode(code) === "solite" ? "solite" : "rocket");
  if (bat.terminal?.trim() && isStrictProductCodeMatch(code, bat.code)) {
    return `${bat.terminal.trim()}타입`;
  }
  return parseSpecParts(code).terminal;
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
  const brandKey = inferBatteryBrandKeyFromCode(code);
  const brandId = brandKey === "solite" ? "solite" : "rocket";
  const bat = getBattery(code, brandId);
  const parts = parseSpecParts(productBatteryCode(code) || code);
  const imageSet =
    getBatteryImageSet(code, brandKey, { strictBrand: true }) ?? EMPTY_BATTERY_IMAGE_SET;

  const terminalLabel = resolveBatteryTerminalLabel(code);

  const typeLabel = /^GB/i.test(code)
    ? "GB"
    : /^CMF/i.test(code)
      ? "CMF"
      : /^AGM/i.test(code)
        ? "AGM"
        : /^DIN/i.test(code)
          ? "DIN"
          : bat.type?.trim() || parts.type;

  return {
    code,
    typeLabel,
    seriesLabel: parts.series,
    terminalLabel,
    capacity: bat.capacity?.trim() || null,
    cca: bat.cca?.trim() || null,
    imageSet: imageSet?.main ? imageSet : null,
    imageAlt: `${code} 배터리 이미지`,
  };
}
