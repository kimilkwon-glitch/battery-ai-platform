import { hyundaiGrandeurGenerations } from "@/data/cars";
import type { VehicleBadgeToken } from "@/components/car/VehicleSpecBadge";
import { getVehicleAsset } from "@/lib/car-assets";
import { resolveBatteryDisplay } from "@/lib/batteryNormalize";
import { getBattery, getVehicle, vehicles } from "@/lib/platform-data";
import { getVehicleCardBatteryInfo } from "@/lib/vehicleBattery";
import {
  formatConditionSpecSummary,
  getVehicleConditionSpecLines,
} from "@/lib/vehicle-condition-spec-lines";

const MAX_BADGES = 2;

/** 카드 노출 우선순위 — 최대 4개 (AGM → ISG → BMS/SC → UP/DIN) */
const BADGE_PRIORITY: VehicleBadgeToken["kind"][] = [
  "agm",
  "isg",
  "bms",
  "smart",
  "upgrade",
  "din",
  "ev",
  "diff",
];

export type VehicleCardHints = {
  tokens: VehicleBadgeToken[];
  primaryCode: string;
  yearLine: string;
  needsPhotoReview?: boolean;
};

export type VehicleExploreMeta = {
  categoryLine: string;
  detailLine: string;
  ctaLabel: string;
};

const EXPLORE_META: Record<string, Omit<VehicleExploreMeta, "categoryLine"> & { category?: string }> = {
  "santafe-tm": {
    category: "중형 SUV",
    detailLine: "가솔린·디젤 중심",
    ctaLabel: "연료별 보기",
  },
  "porter2-new": {
    category: "소형트럭",
    detailLine: "2020년 이후 100R",
    ctaLabel: "연식별 보기",
  },
  "porter2-old": {
    category: "소형트럭",
    detailLine: "2019년까지 90R",
    ctaLabel: "연식별 보기",
  },
  "staria-us4": {
    category: "MPV",
    detailLine: "디젤·LPG AGM80R",
    ctaLabel: "상세 보기",
  },
  "sorento-mq4": {
    category: "중형 SUV",
    detailLine: "가솔린·디젤·HEV",
    ctaLabel: "연료별 보기",
  },
  "grandeur-ig": {
    category: "대형 세단",
    detailLine: "가솔린·디젤·LPG",
    ctaLabel: "연료별 보기",
  },
  "g80-rg3": {
    category: "대형 세단",
    detailLine: "AGM95R/R 계열 문의 다수 · 사진 확인 권장",
    ctaLabel: "가이드·검색",
  },
  "bmw-g30": {
    category: "수입 세단",
    detailLine: "AGM92Ah 등 수입차 문의 · 사진 확인 권장",
    ctaLabel: "연료별 보기",
  },
};

const BROWSE_SAFE_CARD: Record<
  string,
  Pick<VehicleCardHints, "primaryCode" | "yearLine" | "needsPhotoReview"> & { detailLine: string }
> = {
  "g80-rg3": {
    primaryCode: "연식·연료 확인 필요",
    yearLine: "RG3 · 연식 확인",
    needsPhotoReview: true,
    detailLine: "AGM95R/R 계열 문의 다수 · 사진 확인 권장",
  },
  "bmw-g30": {
    primaryCode: "연식·연료 확인 필요",
    yearLine: "연식 확인 필요",
    needsPhotoReview: true,
    detailLine: "AGM92Ah 등 수입차 문의 · 사진 확인 권장",
  },
};

function bodyCategoryLabel(vehicleId: string): string {
  const asset = getVehicleAsset(vehicleId);
  const tag = asset?.tags?.find((t) => ["세단", "SUV", "상용차", "밴", "트럭", "EV"].includes(t));
  if (tag === "세단") return "승용";
  if (tag === "SUV") return "SUV";
  if (tag === "상용차" || tag === "트럭") return "상용";
  if (tag === "밴") return "MPV";
  if (tag === "EV") return "EV";
  if (/porter|bongo/i.test(vehicleId)) return "소형트럭";
  if (/staria|carnival/i.test(vehicleId)) return "MPV";
  return "승용";
}

function replacementDifficulty(
  bat: ReturnType<typeof getBattery>,
  hasIsg: boolean,
): VehicleBadgeToken | null {
  if (bat.bmsNote === "등록 필수" || bat.isgFit === "필수") return { kind: "diff", level: "hard" };
  if (bat.bmsNote.includes("등록") || hasIsg) return { kind: "diff", level: "mid" };
  if (bat.type === "DIN" || bat.type === "EFB") return { kind: "diff", level: "easy" };
  return null;
}

function resolvePrimaryCode(
  vehicleId: string,
  fallback?: string,
): { primaryCode: string; needsPhotoReview: boolean } {
  const db = getVehicleCardBatteryInfo(vehicleId);
  if (db.hasConfirmedDb && db.displayCode) {
    return { primaryCode: db.displayCode, needsPhotoReview: false };
  }
  if (db.displayCode) {
    return { primaryCode: db.displayCode, needsPhotoReview: db.needsPhotoReview };
  }
  if (fallback) {
    return {
      primaryCode: resolveBatteryDisplay(fallback).displayCode,
      needsPhotoReview: db.needsPhotoReview,
    };
  }
  return {
    primaryCode: db.needsPhotoReview ? "사진 확인 필요" : "규격 확인 필요",
    needsPhotoReview: db.needsPhotoReview,
  };
}

/** 차량 카드 — 교체 판단 배지 최대 4개 (연료 제외) */
export function getVehicleCardHints(vehicleId: string): VehicleCardHints {
  const safe = BROWSE_SAFE_CARD[vehicleId];
  if (safe) {
    return {
      tokens: vehicleId === "g80-rg3" ? [{ kind: "agm" }] : [],
      primaryCode: safe.primaryCode,
      yearLine: safe.yearLine,
      needsPhotoReview: safe.needsPhotoReview,
    };
  }

  const catalogVehicle = vehicles.find((item) => item.id === vehicleId);
  const asset = getVehicleAsset(vehicleId) ?? getVehicleAsset(vehicleId.replace(/_/g, "-"));
  const resolved = resolvePrimaryCode(vehicleId, asset?.defaultBatteryCode ?? catalogVehicle?.batteryCode);

  if (!catalogVehicle && asset) {
    const bat = resolved.primaryCode ? getBattery(resolved.primaryCode) : null;
    const tokens: VehicleBadgeToken[] = [];
    if (asset.tags?.includes("EV")) tokens.push({ kind: "ev" });
    if (asset.tags?.includes("하이브리드")) tokens.push({ kind: "isg" });
    if (bat?.type === "AGM") tokens.push({ kind: "agm" });
    if (bat?.type === "DIN") tokens.push({ kind: "din" });
    return {
      tokens: tokens.slice(0, MAX_BADGES),
      primaryCode: resolved.primaryCode,
      yearLine: (asset.yearRange ?? "").replace(/~/g, "-"),
      needsPhotoReview: resolved.needsPhotoReview,
    };
  }

  const v = catalogVehicle ?? getVehicle(vehicleId);
  const bat = getBattery(resolved.primaryCode || v.batteryCode);
  const gen = hyundaiGrandeurGenerations.find((g) => g.platformVehicleId === vehicleId);

  const pool = new Map<VehicleBadgeToken["kind"], VehicleBadgeToken>();

  const showAgm =
    bat.type === "AGM" || (gen != null && gen.agm !== "미적용" && gen.agm !== "—");
  const showDin =
    bat.type === "DIN" || (gen != null && gen.din !== "미적용" && gen.din !== "—" && !showAgm);
  const hasIsg =
    gen?.isg === true ||
    bat.isgFit === "매우 적합" ||
    bat.isgFit === "적합" ||
    bat.isgFit === "필수";
  const hasBms = bat.bmsNote.includes("등록");
  const hasUpgrade = v.upgradeCodes.some((c) => c !== v.batteryCode);

  if (showAgm) pool.set("agm", { kind: "agm" });
  if (hasIsg) pool.set("isg", { kind: "isg" });
  if (gen?.smartCharge) pool.set("smart", { kind: "smart" });
  if (hasBms) pool.set("bms", { kind: "bms" });
  if (hasUpgrade) pool.set("upgrade", { kind: "upgrade" });

  const diff = replacementDifficulty(bat, hasIsg);
  if (diff) pool.set("diff", diff);

  if (showDin) pool.set("din", { kind: "din" });
  if (bat.type === "EV") pool.set("ev", { kind: "ev" });

  const tokens = BADGE_PRIORITY.filter((k) => pool.has(k))
    .map((k) => pool.get(k)!)
    .slice(0, MAX_BADGES);

  return {
    tokens,
    primaryCode: resolved.primaryCode || resolveBatteryDisplay(v.batteryCode).displayCode,
    yearLine: v.yearRange.replace(/~/g, "-"),
    needsPhotoReview: resolved.needsPhotoReview,
  };
}

/** 탐색·추천 카드 — 연식/차급/특징 1~2줄 */
export function getVehicleExploreMeta(vehicleId: string): VehicleExploreMeta {
  const hints = getVehicleCardHints(vehicleId);
  const asset = getVehicleAsset(vehicleId);
  const override = EXPLORE_META[vehicleId];
  const yearLine = asset?.yearRange?.replace(/-/g, "~") ?? hints.yearLine.replace(/-/g, "~");
  const category = override?.category ?? bodyCategoryLabel(vehicleId);

  let detailLine = override?.detailLine ?? "";
  if (!detailLine && asset?.batteryNotes && asset.batteryNotes !== "연식, 연료, ISG 여부에 따라 배터리 규격 확인이 필요합니다.") {
    detailLine = asset.batteryNotes;
  }
  const safeBrowse = BROWSE_SAFE_CARD[vehicleId];
  if (safeBrowse) {
    detailLine = safeBrowse.detailLine;
  } else if (
    !detailLine &&
    hints.primaryCode &&
    hints.primaryCode !== "규격 확인 필요" &&
    hints.primaryCode !== "사진 확인 필요" &&
    !hints.primaryCode.includes("확인 필요")
  ) {
    detailLine = `대표 규격 ${hints.primaryCode}`;
  }
  if (!detailLine) detailLine = "연료·연식별 규격 확인";

  const primaryDisplay =
    hints.primaryCode === "사진 확인 필요" || hints.primaryCode.includes("확인 필요")
      ? "규격 확인 필요"
      : hints.primaryCode;

  const categoryLine =
    safeBrowse?.yearLine && safeBrowse.yearLine.includes("확인")
      ? `연식 확인 필요 / ${category}`
      : `${yearLine} / ${category}`;

  return {
    categoryLine,
    detailLine: detailLine.includes("대표") ? detailLine : detailLine,
    ctaLabel: override?.ctaLabel ?? "연료별 보기",
  };
}

export type VehicleCardCompactCopy = {
  categoryLine: string;
  specLine: string;
  cautionLine: string;
  ctaLabel: string;
};

/** /vehicles 카드 — 배지 없이 텍스트 4줄 구조 */
export function getVehicleCardCompactCopy(vehicleId: string, title?: string): VehicleCardCompactCopy {
  if (vehicleId === "rexton-sports-search") {
    return {
      categoryLine: "KG/쌍용 · SUV",
      specLine: "연식·연료별 규격 확인",
      cautionLine: "Y400 등 트림별 규격이 다를 수 있어 사진 확인을 권장합니다.",
      ctaLabel: "검색으로 확인",
    };
  }

  const hints = getVehicleCardHints(vehicleId);
  const meta = getVehicleExploreMeta(vehicleId);
  const typeBits: string[] = [];
  for (const t of hints.tokens.slice(0, 2)) {
    if (t.kind === "agm") typeBits.push("AGM");
    else if (t.kind === "isg") typeBits.push("ISG");
    else if (t.kind === "din") typeBits.push("DIN");
    else if (t.kind === "ev") typeBits.push("EV");
  }
  const typeLine = typeBits.length > 0 ? `${typeBits.join(" · ")} · ` : "";

  const conditionLines = getVehicleConditionSpecLines(vehicleId);
  const fuelSummary = formatConditionSpecSummary(conditionLines);
  const spec = fuelSummary
    ? fuelSummary
    : hints.primaryCode && !hints.primaryCode.includes("준비") && !hints.primaryCode.includes("사진")
      ? `대표 규격 ${hints.primaryCode}`
      : "대표 규격 연료·연식별 확인";

  const caution = meta.detailLine.replace(/^대표\s*규격\s*\S+\s*/i, "").trim() || "연료·연식별 상세에서 확인";
  const mergedCaution = `${typeLine}${caution}`.replace(/\s+/g, " ").trim();

  return {
    categoryLine: meta.categoryLine,
    specLine: spec,
    cautionLine: mergedCaution.slice(0, 120),
    ctaLabel: meta.ctaLabel === "가이드·검색" ? "상세 보기" : meta.ctaLabel,
  };
}
