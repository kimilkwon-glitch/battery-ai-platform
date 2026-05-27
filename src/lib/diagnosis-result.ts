import { getBattery, getSymptom, getVehicle, vehicles } from "./platform-data";
import {
  getVehicleBatteryPageData,
  getVehicleCardBatteryInfo,
  hasConfirmedBatteryData,
  type VehicleBatterySummaryLine,
} from "./vehicleBattery";

export type DiagnosisBatteryRec = {
  primaryCode: string;
  codes: string[];
  fuelLines: VehicleBatterySummaryLine[];
  fromDb: boolean;
};

const FUEL_OPTIONS = ["가솔린", "디젤", "하이브리드", "LPG", "전기"] as const;

export function resolveVehicleIdFromName(vehicleName: string): string {
  const q = vehicleName.trim();
  if (!q) return "grandeur-ig";

  const exact = vehicles.find((v) => v.displayName === q);
  if (exact) return exact.id;

  const partial = vehicles.find(
    (v) => q.includes(v.displayName) || v.displayName.includes(q) || q.toLowerCase().includes(v.id.replace(/-/g, " ")),
  );
  if (partial) return partial.id;

  const token = q.match(/mq4|ig|g30|ev6|dn8|nx4|ka4|palisade|seltos/i)?.[0]?.toLowerCase();
  if (token) {
    const byToken = vehicles.find((v) => v.id.includes(token) || v.displayName.toLowerCase().includes(token));
    if (byToken) return byToken.id;
  }

  return "grandeur-ig";
}

function matchFuelGroup(fuelHint: string, fuelLabel: string): boolean {
  const h = fuelHint.trim();
  const l = fuelLabel.trim();
  if (!h || !l) return false;
  return l.includes(h) || h.includes(l);
}

/** 차량 DB 우선 → 카드 DB → 증상/카탈로그 fallback */
export function getDiagnosisBatteryRecommendations(
  vehicleId: string,
  options?: { fuelHint?: string; symptomId?: string },
): DiagnosisBatteryRec {
  const page = getVehicleBatteryPageData(vehicleId);

  if (page.hasData && page.summary) {
    const { summary, fuelGroups } = page;
    let primaryCode = summary.representativeBattery;
    let fuelLines = summary.lines;

    if (options?.fuelHint) {
      const group = fuelGroups.find((g) => matchFuelGroup(options.fuelHint!, g.fuelLabel));
      if (group) {
        primaryCode = group.primaryBattery;
        fuelLines = [{ label: group.fuelLabel, battery: group.primaryBattery }];
      }
    }

    const dbCodes = new Set<string>();
    for (const line of fuelLines) dbCodes.add(line.battery);
    for (const alt of summary.alternatives) {
      if (fuelGroups.some((g) => g.batteryOptions.includes(alt) || g.primaryBattery === alt)) {
        dbCodes.add(alt);
      }
    }

    const codes =
      options?.fuelHint && primaryCode
        ? [primaryCode, ...summary.alternatives.filter((c) => c !== primaryCode && dbCodes.has(c))].slice(0, 3)
        : [...new Set(fuelLines.map((l) => l.battery))].slice(0, 3);

    return {
      primaryCode: primaryCode || summary.representativeBattery,
      codes: codes.filter(Boolean),
      fuelLines,
      fromDb: page.records.some(hasConfirmedBatteryData) || fuelGroups.length > 0,
    };
  }

  const card = getVehicleCardBatteryInfo(vehicleId);
  if (card.displayCode) {
    return {
      primaryCode: card.displayCode,
      codes: [...new Set([card.displayCode, ...card.batteryOptions])].slice(0, 3),
      fuelLines: [],
      fromDb: card.hasConfirmedDb,
    };
  }

  const vehicle = getVehicle(vehicleId);
  const symptom = options?.symptomId ? getSymptom(options.symptomId) : null;
  const symptomCode = symptom?.batteryCodes.find((c) => {
    try {
      return Boolean(getBattery(c));
    } catch {
      return false;
    }
  });
  const fallbackCode = symptomCode ?? vehicle.batteryCode;

  return {
    primaryCode: fallbackCode,
    codes: [fallbackCode],
    fuelLines: [],
    fromDb: false,
  };
}

export function getFuelOptionsForVehicle(vehicleId: string): string[] {
  const page = getVehicleBatteryPageData(vehicleId);
  if (!page.fuelGroups.length) return [];
  return page.fuelGroups.map((g) => g.fuelLabel).filter((f) => FUEL_OPTIONS.some((o) => f.includes(o) || o.includes(f)));
}

const VERDICT_BY_SYMPTOM: Record<string, string> = {
  "slow-engine-start":
    "시동 지연이 반복된다면 배터리 충전 상태와 CCA를 먼저 확인해야 합니다.",
  "blackbox-drain":
    "블랙박스·상시전원 사용 시 대기전류가 원인일 수 있습니다. 배터리 성능과 컷오프 전압을 함께 점검하세요.",
  "winter-discharge":
    "겨울철 저온에서는 CCA 성능 저하로 방전 위험이 높아질 수 있습니다. SOH·충전 상태 확인이 필요합니다.",
  "ev12v-discharge":
    "EV 12V 보조배터리는 일반 배터리와 충전 제어가 다릅니다. 순정 규격 확인을 우선하세요.",
  "agm-replacement":
    "현재 증상은 배터리 성능 저하 가능성이 높습니다. CCA/SOH 점검 후 차량에 맞는 AGM 규격을 확인하는 것이 좋습니다.",
  "battery-warning":
    "배터리 경고등은 충전계통·센서·배터리 상태를 함께 의심해야 합니다. 전압과 충전 전압을 먼저 확인하세요.",
  "bms-warning":
    "IBS/BMS 오류는 배터리 교체 후 등록·학습 누락, 또는 센서 이상일 수 있습니다. 순정 규격과 등록 절차를 확인하세요.",
  "short-trip-wear":
    "단거리 반복 주행은 충전 부족으로 SOH 저하를 유발할 수 있습니다. 주행 패턴과 전압 추이를 함께 보세요.",
};

export function getDiagnosisVerdict(
  symptomId: string,
  vehicleDisplayName: string,
  batteryRec: DiagnosisBatteryRec,
): string {
  const base = VERDICT_BY_SYMPTOM[symptomId] ?? VERDICT_BY_SYMPTOM["slow-engine-start"];

  if (batteryRec.fromDb && batteryRec.fuelLines.length > 1) {
    const fuelHint = batteryRec.fuelLines.map((l) => `${l.label} ${l.battery}`).join(", ");
    return `${base} ${vehicleDisplayName}는 연료별로 ${fuelHint} 등 규격이 다를 수 있습니다.`;
  }

  if (batteryRec.fromDb && batteryRec.primaryCode) {
    return `${base} ${vehicleDisplayName} 기준 추천 규격은 ${batteryRec.primaryCode}입니다.`;
  }

  return base;
}

export function riskTone(risk: string): "red" | "amber" | "blue" {
  if (risk === "높음") return "red";
  if (risk === "중상" || risk === "중간") return "amber";
  return "blue";
}
