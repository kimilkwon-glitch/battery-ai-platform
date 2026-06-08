/**
 * 차량 PNG 픽셀 분석 + visual risk 분류
 * 육안 검수·before/after 비교 우선 (자동 OK ≠ 정상 확정)
 */
import type { VehicleAsset } from "@/lib/car-assets";

export function isLightBodyVehicle(asset: VehicleAsset, fileName: string): boolean {
  const hay = `${asset.displayName} ${asset.generationName ?? ""} ${fileName} ${(asset.tags ?? []).join(" ")}`.toLowerCase();
  return /white|silver|pearl|ivory|에어|air|흰|은색|회색|그레이|gray|grey|쥬얼|pebble|쥬얼그레이|스노우|snow|metal|메탈|플래티넘|platinum/.test(
    hay,
  );
}

export type VehicleImageLegacyStatus =
  | "OK"
  | "DISPLAY_ISSUE"
  | "DAMAGED_FILE"
  | "NEEDS_CHECK"
  | "MISSING_FILE";

export type VisualRiskStatus =
  | "OK"
  | "DAMAGED_FILE"
  | "NEEDS_CHECK"
  | "BRIGHT_REVIEW"
  | "RESTORE_CANDIDATE_REVIEW"
  | "MISSING_FILE";

export type VehicleImagePixelMetrics = {
  holeScore: number;
  /** 밝은 차체 내부가 배경처럼 날아간 정도 (holeScore와 동일 측정) */
  whiteBodyErosionScore: number;
  graySmearScore: number;
  edgeFloodRiskScore: number;
  brightBodyRatio: number;
};

export type VehicleImageCompareMetrics = {
  current: VehicleImagePixelMetrics;
  backup: VehicleImagePixelMetrics | null;
  /** 0~1, 현재본 vs 백업본 픽셀 차이 (클수록 다름) */
  currentVsBackupDiff: number | null;
};

export type VehicleImageRiskAssessment = {
  legacyStatus: VehicleImageLegacyStatus;
  legacyReason: string;
  visualRiskStatus: VisualRiskStatus;
  visualRiskReason: string;
  lightBodyHint: boolean;
  restoreCandidate: boolean;
  restorePriority: "immediate" | "manual" | "none";
  regenerationCandidate: boolean;
  manualBrightOkReview: boolean;
};

function lum(data: Buffer, i: number): number {
  return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
}

function isPureWhite(data: Buffer, i: number): boolean {
  return data[i] >= 248 && data[i + 1] >= 248 && data[i + 2] >= 248;
}

function isNearWhite(data: Buffer, i: number): boolean {
  return data[i] >= 230 && data[i + 1] >= 230 && data[i + 2] >= 230;
}

function isDark(data: Buffer, i: number): boolean {
  return lum(data, i) < 135;
}

function isBrightNeutral(data: Buffer, i: number): boolean {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  const l = lum(data, i);
  return spread < 28 && l >= 168 && l <= 252;
}

function isGraySmear(data: Buffer, i: number): boolean {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  const l = lum(data, i);
  return spread < 22 && l >= 150 && l <= 242 && !isPureWhite(data, i);
}

/** 단일 PNG 픽셀 분석 */
export function analyzePixelBuffer(
  data: Buffer,
  width: number,
  height: number,
  channels: number,
): VehicleImagePixelMetrics {
  const marginX = Math.floor(width * 0.1);
  const marginY = Math.floor(height * 0.1);
  let holes = 0;
  let smear = 0;
  let brightBody = 0;
  let edgeFlood = 0;
  let sampled = 0;

  for (let y = marginY; y < height - marginY; y++) {
    for (let x = marginX; x < width - marginX; x++) {
      const idx = y * width + x;
      const i = idx * channels;
      sampled++;

      if (isBrightNeutral(data, i)) brightBody++;

      if (isPureWhite(data, i) || isNearWhite(data, i)) {
        let darkNeighbors = 0;
        let brightNeighbors = 0;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const ni = (ny * width + nx) * channels;
          if (isDark(data, ni)) darkNeighbors++;
          if (isBrightNeutral(data, ni) || isPureWhite(data, ni)) brightNeighbors++;
        }
        if (darkNeighbors >= 2) holes++;
        if (brightNeighbors >= 2 && (x < marginX + 8 || y < marginY + 8 || x > width - marginX - 8 || y > height - marginY - 8)) {
          edgeFlood++;
        }
      }

      if (isGraySmear(data, i)) smear++;
    }
  }

  const denom = Math.max(sampled, 1);
  const holeScore = holes / denom;
  return {
    holeScore,
    whiteBodyErosionScore: holeScore,
    graySmearScore: smear / denom,
    edgeFloodRiskScore: edgeFlood / denom,
    brightBodyRatio: brightBody / denom,
  };
}

/** 두 이미지 raw 버퍼 비교 — center crop MAE 정규화 */
export function computeCurrentVsBackupDiff(
  current: Buffer,
  backup: Buffer,
  width: number,
  height: number,
  channels: number,
): number {
  const mx = Math.floor(width * 0.15);
  const my = Math.floor(height * 0.15);
  let sum = 0;
  let count = 0;
  for (let y = my; y < height - my; y++) {
    for (let x = mx; x < width - mx; x++) {
      const idx = (y * width + x) * channels;
      const dr = Math.abs(current[idx] - backup[idx]);
      const dg = Math.abs(current[idx + 1] - backup[idx + 1]);
      const db = Math.abs(current[idx + 2] - backup[idx + 2]);
      sum += (dr + dg + db) / 3;
      count++;
    }
  }
  return count > 0 ? sum / count / 255 : 0;
}

function legacyClassify(
  current: VehicleImagePixelMetrics,
  backup: VehicleImagePixelMetrics | null,
  opts: { primaryExists: boolean; lightBodyHint: boolean },
): { status: VehicleImageLegacyStatus; reason: string } {
  if (!opts.primaryExists) {
    return { status: "MISSING_FILE", reason: "primary PNG not found on disk" };
  }

  if (backup) {
    const holeDelta = current.holeScore - backup.holeScore;
    const smearDelta = current.graySmearScore - backup.graySmearScore;
    const holeRatio =
      backup.holeScore > 0.00001 ? current.holeScore / backup.holeScore : current.holeScore > 0.00015 ? 99 : 1;
    const smearRatio =
      backup.graySmearScore > 0.01
        ? current.graySmearScore / backup.graySmearScore
        : current.graySmearScore > 0.18
          ? 99
          : 1;

    if (holeDelta > 0.00008 && holeRatio >= 2) {
      return {
        status: "DAMAGED_FILE",
        reason: `normalize 후 hole 증가 (${backup.holeScore.toFixed(4)} → ${current.holeScore.toFixed(4)})`,
      };
    }
    if (smearDelta > 0.04 && smearRatio >= 1.4 && current.graySmearScore >= 0.14) {
      return {
        status: "DAMAGED_FILE",
        reason: `normalize 후 smear 증가 (${backup.graySmearScore.toFixed(4)} → ${current.graySmearScore.toFixed(4)})`,
      };
    }
    if (
      holeDelta > 0.00003 ||
      (smearDelta > 0.02 && current.graySmearScore >= 0.1) ||
      current.edgeFloodRiskScore > backup.edgeFloodRiskScore + 0.00005
    ) {
      return {
        status: "NEEDS_CHECK",
        reason: `백업 대비 변화 (hole Δ${holeDelta.toFixed(4)}, smear Δ${smearDelta.toFixed(4)})`,
      };
    }
    return { status: "OK", reason: "백업 대비 큰 변화 없음 (legacy)" };
  }

  if (current.holeScore >= 0.001 || current.graySmearScore >= (opts.lightBodyHint ? 0.18 : 0.22)) {
    return {
      status: "NEEDS_CHECK",
      reason: `백업 없음 — hole=${current.holeScore.toFixed(4)}, smear=${current.graySmearScore.toFixed(4)}`,
    };
  }
  return { status: "OK", reason: "heuristic OK (no backup)" };
}

function isBackupClearlyBetter(
  current: VehicleImagePixelMetrics,
  backup: VehicleImagePixelMetrics,
  diff: number | null,
): boolean {
  const holeBetter = backup.holeScore + 0.00002 < current.holeScore;
  const smearBetter = backup.graySmearScore + 0.02 < current.graySmearScore;
  const erosionBetter = backup.whiteBodyErosionScore + 0.00002 < current.whiteBodyErosionScore;
  const diffHigh = diff != null && diff > 0.018;
  const scoreBetter = [holeBetter, smearBetter, erosionBetter].filter(Boolean).length;
  return scoreBetter >= 2 || (scoreBetter >= 1 && diffHigh);
}

function isBothLowQuality(backup: VehicleImagePixelMetrics | null, current: VehicleImagePixelMetrics): boolean {
  if (!backup) return current.holeScore > 0.0015 && current.graySmearScore > 0.25;
  return (
    backup.holeScore > 0.0008 &&
    backup.graySmearScore > 0.2 &&
    current.holeScore > 0.0008 &&
    current.graySmearScore > 0.2
  );
}

export function assessVehicleImageRisk(
  compare: VehicleImageCompareMetrics,
  asset: Pick<VehicleAsset, "displayName" | "generationName" | "tags" | "imageFile">,
  opts: { primaryExists: boolean; backupExists: boolean },
): VehicleImageRiskAssessment {
  const lightBodyHint =
    isLightBodyVehicle(asset as VehicleAsset, asset.imageFile) ||
    compare.current.brightBodyRatio >= 0.22 ||
    compare.current.graySmearScore >= 0.14;

  const legacy = legacyClassify(compare.current, compare.backup, {
    primaryExists: opts.primaryExists,
    lightBodyHint,
  });

  if (!opts.primaryExists) {
    return {
      legacyStatus: "MISSING_FILE",
      legacyReason: legacy.reason,
      visualRiskStatus: "MISSING_FILE",
      visualRiskReason: "파일 없음",
      lightBodyHint,
      restoreCandidate: false,
      restorePriority: "none",
      regenerationCandidate: true,
      manualBrightOkReview: false,
    };
  }

  const cur = compare.current;
  const bak = compare.backup;
  const diff = compare.currentVsBackupDiff;

  const highSmear = cur.graySmearScore >= (lightBodyHint ? 0.1 : 0.13);
  const highErosion = cur.whiteBodyErosionScore >= (lightBodyHint ? 0.00008 : 0.00012);
  const highEdgeFlood = cur.edgeFloodRiskScore >= 0.00006;
  const largeDiff = diff != null && diff > 0.022;

  const backupBetter = bak != null && isBackupClearlyBetter(cur, bak, diff);
  const bothBad = isBothLowQuality(bak, cur);

  let visualRiskStatus: VisualRiskStatus = "OK";
  let visualRiskReason = "자동 기준 큰 이상 없음";

  if (legacy.status === "DAMAGED_FILE" || (highErosion && highSmear)) {
    visualRiskStatus = "DAMAGED_FILE";
    visualRiskReason = `차체 손상 의심 (erosion=${cur.whiteBodyErosionScore.toFixed(4)}, smear=${cur.graySmearScore.toFixed(4)})`;
  } else if (backupBetter && opts.backupExists) {
    visualRiskStatus = "RESTORE_CANDIDATE_REVIEW";
    visualRiskReason = `백업본이 현재본보다 양호 (diff=${diff?.toFixed(4) ?? "n/a"})`;
  } else if (
    lightBodyHint &&
    (highSmear || highErosion || highEdgeFlood || (bak && cur.graySmearScore > bak.graySmearScore + 0.015))
  ) {
    visualRiskStatus = "BRIGHT_REVIEW";
    visualRiskReason = `밝은 차체 검수 (smear=${cur.graySmearScore.toFixed(4)}, bright=${(cur.brightBodyRatio * 100).toFixed(1)}%)`;
  } else if (legacy.status === "NEEDS_CHECK" || largeDiff) {
    visualRiskStatus = "NEEDS_CHECK";
    visualRiskReason = legacy.reason;
  } else if (highSmear || highErosion) {
    visualRiskStatus = "BRIGHT_REVIEW";
    visualRiskReason = `회색 얼룩/erosion 의심 (smear=${cur.graySmearScore.toFixed(4)})`;
  }

  const restoreCandidate =
    opts.backupExists &&
    (visualRiskStatus === "RESTORE_CANDIDATE_REVIEW" ||
      visualRiskStatus === "DAMAGED_FILE" ||
      (backupBetter && (highSmear || highErosion || largeDiff)));

  const restorePriority: VehicleImageRiskAssessment["restorePriority"] = restoreCandidate
    ? visualRiskStatus === "RESTORE_CANDIDATE_REVIEW" ||
      visualRiskStatus === "DAMAGED_FILE" ||
      (backupBetter && (cur.graySmearScore >= 0.12 || cur.whiteBodyErosionScore >= 0.00008))
      ? "immediate"
      : "manual"
    : "none";

  const manualBrightOkReview =
    legacy.status === "OK" &&
    (lightBodyHint || highSmear) &&
    visualRiskStatus !== "RESTORE_CANDIDATE_REVIEW";

  const regenerationCandidate =
    bothBad || (!opts.backupExists && (highErosion && highSmear)) || legacy.status === "MISSING_FILE";

  return {
    legacyStatus: legacy.status,
    legacyReason: legacy.reason,
    visualRiskStatus,
    visualRiskReason,
    lightBodyHint,
    restoreCandidate,
    restorePriority,
    regenerationCandidate,
    manualBrightOkReview,
  };
}

export type RestoreListBuckets = {
  immediateRestore: string[];
  manualRestore: string[];
  regeneration: string[];
};

export function bucketRestoreLists(
  entries: { slug: string; restoreCandidate: boolean; restorePriority: string; regenerationCandidate: boolean; visualRiskStatus: VisualRiskStatus; manualBrightOkReview: boolean }[],
): RestoreListBuckets {
  const immediateRestore: string[] = [];
  const manualRestore: string[] = [];
  const regeneration: string[] = [];

  for (const e of entries) {
    if (e.regenerationCandidate) regeneration.push(e.slug);
    else if (e.restorePriority === "immediate") immediateRestore.push(e.slug);
    else if (
      e.restorePriority === "manual" ||
      e.manualBrightOkReview ||
      e.visualRiskStatus === "BRIGHT_REVIEW" ||
      e.visualRiskStatus === "NEEDS_CHECK"
    ) {
      manualRestore.push(e.slug);
    }
  }

  return {
    immediateRestore: [...new Set(immediateRestore)],
    manualRestore: [...new Set(manualRestore)].filter((s) => !immediateRestore.includes(s)),
    regeneration: [...new Set(regeneration)],
  };
}
