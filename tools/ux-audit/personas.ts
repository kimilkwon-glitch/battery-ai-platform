import {
  AGE_GROUPS,
  BATTERY_SPECS,
  CTAS_BY_JOURNEY,
  JOURNEY_START_BEHAVIOR,
  PERSONALITIES,
  SITUATIONS,
  VEHICLE_CATALOG,
  deviceFor,
  knowledgeFor,
  pick,
  severityFor,
  urgencyFor,
  vehicleShortLabel,
  type VehicleEntry,
} from "./personaCatalog";
import type {
  JourneyStep,
  JourneyType,
  Persona,
  Personality,
  PersonaVehicle,
} from "./types";
import { JOURNEY_RATIOS, JOURNEY_TYPE_LABELS } from "./types";

const PERSONA_NAME_TEMPLATES: ((ctx: PersonaBuildCtx) => string)[] = [
  (c) => `${c.situation}으로 고민 중인 ${c.vehicle.label} ${c.ageGroup} 차주`,
  (c) => `${c.battery} 규격을 확인하려는 ${c.personality} ${c.vehicle.model} 운전자`,
  (c) => `${c.vehicle.year}년식 ${c.vehicle.model} ${c.situation} — ${c.personality}`,
  (c) => `출퇴근길 ${c.situation} 겪는 ${c.vehicle.label} ${c.ageGroup} 직장인`,
  (c) => `${c.journeyLabel} 여정으로 들어온 ${c.vehicle.label} ${c.personality}`,
  (c) => `배터리 ${c.situation} 때문에 찾아온 ${c.vehicle.brand} ${c.vehicle.model} 차주`,
  (c) => `${c.vehicle.fuel} ${c.vehicle.model} ${c.battery} 교체 검토 ${c.ageGroup}`,
  (c) => `주말에 ${c.situation} 확인하려는 ${c.personality}`,
  (c) => `${c.vehicle.label} ${c.battery} — ${c.situation} 대응`,
  (c) => `처음 배터리를 알아보는 ${c.vehicle.model} ${c.ageGroup} 초보`,
];

type PersonaBuildCtx = {
  vehicle: VehicleEntry;
  battery: string;
  situation: string;
  personality: Personality;
  ageGroup: string;
  journeyLabel: string;
  index: number;
};

function journeyPersonaType(journey: JourneyType): string {
  return `${JOURNEY_TYPE_LABELS[journey]} 고객`;
}

function buildGoal(journey: JourneyType, vehicle: VehicleEntry, battery: string, situation: string, query: string): string {
  switch (journey) {
    case "direct_search":
      return `"${query}"로 ${vehicle.label}에 맞는 ${battery}와 다음 행동을 빠르게 확인`;
    case "browse_vehicle":
      return `${vehicle.label} 차량 페이지에서 ${battery} 규격과 교체 정보를 찾기`;
    case "browse_spec":
      return `${battery} 규격표에서 호환 차종과 단자 방향을 확인`;
    case "compare_battery":
      return `${vehicle.label}에 필요한 ${battery}와 대체 규격의 차이를 비교`;
    case "symptom_check":
      return `${vehicle.label} ${situation} 증상에 맞는 점검·교체 안내 확인`;
    case "photo_check":
      return `${vehicle.label} 배터리 규격을 사진으로 확인하는 방법을 찾기`;
    case "faq_browse":
      return `${situation} 관련 FAQ에서 ${vehicle.label} 답변 확인`;
    case "shop_order_check":
      return `${battery} 택배 주문·자가교체 전 주의사항과 단자 방향 확인`;
    case "repair_shop_search":
      return `${vehicle.label} 배터리 교체 가능한 정비소·매장 안내 찾기`;
    case "trust_check":
      return `사이트를 둘러보며 ${vehicle.label} 배터리 정보를 신뢰할 수 있는지 확인`;
    default:
      return `${vehicle.label} 배터리 정보 확인`;
  }
}

function buildFrustrations(journey: JourneyType, personality: Personality): string[] {
  const base = ["핵심 정보가 첫 화면에 없으면 이탈", "무관한 결과가 많으면 혼란"];
  const extra: Partial<Record<JourneyType, string[]>> = {
    direct_search: ["검색 결과가 길면 바로 나감", "내 차가 맞는지 첫 화면에서 안 보이면 불안"],
    browse_vehicle: ["차량 목록에서 내 차를 못 찾으면 포기", "연료별 규격 구분이 없으면 헷갈림"],
    browse_spec: ["규격 목록이 너무 많으면 포기", "단자 방향 설명이 없으면 주문 못 함"],
    compare_battery: ["L/R·업그레이드 차이 설명이 없으면 잘못 주문", "비교표가 없으면 더 헷갈림"],
    symptom_check: ["긴급 증상인데 문의 CTA가 없으면 불안", "증상과 규격 연결이 없으면 막막"],
    photo_check: ["사진 확인 버튼이 없으면 포기", "어떤 사진을 찍어야 하는지 모르면 문의 못 함"],
    faq_browse: ["FAQ 답변이 짧으면 신뢰 안 됨", "답변 후 다음 행동 CTA가 없으면 막힘"],
    shop_order_check: ["단자 방향·배송 안내가 없으면 주문 보류", "잘못 주문 방지 안내가 없으면 불안"],
    repair_shop_search: ["정비소/매장 찾기가 안 보이면 오프라인 이용 포기", "지역·방문 안내가 없으면 불편"],
    trust_check: ["DB·플랫폼 같은 개발자 표현이 보이면 신뢰 하락", "테스트 페이지처럼 보이면 이탈"],
  };
  const personalityExtra: Partial<Record<Personality, string>> = {
    "급한 사람": "대기 시간이 길면 바로 전화로 넘어감",
    "차를 잘 모르는 사람": "전문 용어가 많으면 포기",
    "꼼꼼한 사람": "비교 근거가 없으면 결정 못 함",
    "구매 직전형": "주문 전 확인 항목이 없으면 장바구니 이탈",
  };
  const list = [...base, ...(extra[journey] ?? [])];
  const pe = personalityExtra[personality];
  if (pe) list.push(pe);
  return list;
}

function buildQuery(
  journey: JourneyType,
  vehicle: VehicleEntry,
  battery: string,
  situation: string,
  index: number,
): string {
  const vLabel = vehicle.label;
  const vShort = vehicleShortLabel(vehicle);
  const variants: Record<JourneyType, string[]> = {
    direct_search: [
      `${vLabel} ${battery}`,
      `${vShort} ${situation} ${battery}`,
      `${vehicle.model} ${vehicle.generation} ${battery}`,
      `${vLabel} ${vehicle.year} ${battery}`,
      `${vShort} ${battery} 교체`,
      `${vehicle.model} ${situation}`,
      `${vLabel} 순정 ${battery}`,
      `${vShort} ${vehicle.fuel} ${battery}`,
    ],
    browse_vehicle: [`${vShort}`, `${vehicle.model} ${vehicle.generation}`, `${vLabel} 배터리`],
    browse_spec: [`${battery}`, `${battery} 호환`, `${battery} 단자`, `AGM ${battery.slice(3)}`],
    compare_battery: [
      `${vShort} ${battery} 차이`,
      `${battery} vs ${pick(BATTERY_SPECS, index + 3)}`,
      `${vehicle.model} AGM80L AGM80R 차이`,
      `DIN74L DIN80L 차이 ${index}`,
      `${battery} 업그레이드`,
      `${vShort} ${battery} 대체`,
    ],
    symptom_check: [
      `${vShort} ${situation}`,
      `${vehicle.model} ${situation}`,
      `${situation} ${battery}`,
      `${vLabel} 시동`,
      `${vShort} 12V 방전`,
    ],
    photo_check: ["", `${vShort} 배터리 사진`, "배터리 사진 확인", "라벨 사진 보내기"],
    faq_browse: [
      `${situation} FAQ`,
      `${battery} 꼭 써야 하나요`,
      `${vShort} 배터리 교체`,
      `AGM 대신 DIN ${index}`,
    ],
    shop_order_check: [
      `${battery} 택배 주문`,
      `${vShort} ${battery} 자가교체`,
      `단자 방향 ${battery}`,
      `${battery} 배송`,
      `폐배터리 반납 ${index}`,
    ],
    repair_shop_search: [
      `${vShort} 배터리 교체`,
      `배터리 교체 매장`,
      `${vehicle.brand} 정비`,
      `출장 배터리 ${index}`,
    ],
    trust_check: [`${vLabel}`, `${battery} 호환`, `${vShort} 배터리`, ""],
  };

  const pool = variants[journey];
  const base = pool[index % pool.length];
  if (!base) return "";
  if (journey === "direct_search" && index > pool.length) {
    return `${base} ·${index}`;
  }
  return base;
}

function buildKeywords(
  journey: JourneyType,
  vehicle: VehicleEntry,
  battery: string,
  situation: string,
  query: string,
): string[] {
  const kw = new Set<string>();
  kw.add(vehicle.model.split(" ")[0]);
  if (vehicle.generation && vehicle.generation.length <= 6) kw.add(vehicle.generation);
  if (battery) kw.add(battery);
  if (/시동|방전|블랙박스/.test(situation)) kw.add(situation.split(" ")[0]);
  if (/BMS|IBS/.test(query)) {
    kw.add("BMS");
    kw.add("IBS");
  }
  if (/사진|라벨|단자/.test(query) || journey === "photo_check") {
    kw.add("사진");
    kw.add("라벨");
  }
  if (/FAQ|꼭|대신|차이/.test(query) || journey === "faq_browse" || journey === "compare_battery") {
    kw.add("차이");
  }
  if (/택배|주문|배송|반납/.test(query) || journey === "shop_order_check") {
    kw.add("주문");
  }
  if (/정비|매장|교체/.test(query) || journey === "repair_shop_search") {
    kw.add("교체");
  }
  if (journey === "trust_check") {
    kw.add(vehicleShortLabel(vehicle));
  }
  return [...kw].filter(Boolean).slice(0, 6);
}

function buildSteps(journey: JourneyType, query: string, vehicle: VehicleEntry, battery: string): JourneyStep[] {
  const vSearch = `${vehicle.model} ${vehicle.generation}`.trim();
  const ctas = CTAS_BY_JOURNEY[journey];

  switch (journey) {
    case "direct_search":
      return [
        { action: "goto", url: "/" },
        { action: "search", query },
        { action: "expectTopResult", keywords: buildKeywords(journey, vehicle, battery, "", query).slice(0, 3) },
        { action: "expectAnyCta", texts: ctas },
      ];
    case "browse_vehicle":
      return [
        { action: "goto", url: "/" },
        { action: "clickLink", textIncludes: ["차종으로 찾기", "차종별", "차량"] },
        { action: "expectAnyText", textIncludes: [vehicle.model, vehicle.brand, "차량", "차종"] },
        { action: "expectAnyCta", texts: ctas },
      ];
    case "browse_spec":
      return [
        { action: "goto", url: "/" },
        { action: "clickLink", textIncludes: ["규격으로 찾기", "규격", "AGM", "비교"] },
        { action: "expectAnyText", textIncludes: [battery.slice(0, 3), "AGM", "DIN", "규격"] },
        { action: "expectAnyCta", texts: ctas },
      ];
    case "compare_battery":
      return [
        { action: "goto", url: "/" },
        ...(query ? [{ action: "search" as const, query }] : [{ action: "clickLink" as const, textIncludes: ["비교", "규격"] }]),
        { action: "expectAnyText", textIncludes: ["차이", "비교", battery, "단자", "L", "R"] },
        { action: "expectAnyCta", texts: ctas },
      ];
    case "symptom_check":
      return [
        { action: "goto", url: "/" },
        { action: "clickLink", textIncludes: ["증상", "시동", "방전", "진단"] },
        { action: "expectAnyText", textIncludes: ["시동", "방전", "증상", "배터리"] },
        { action: "expectAnyCta", texts: ctas },
      ];
    case "photo_check":
      return [
        { action: "goto", url: "/" },
        { action: "findAndClickAny", textIncludes: ["사진으로 확인", "사진 규격", "사진 확인", "배터리 사진"] },
        { action: "expectAnyText", textIncludes: ["사진", "라벨", "단자", "촬영"] },
        { action: "expectAnyCta", texts: ctas },
      ];
    case "faq_browse":
      return [
        { action: "goto", url: "/" },
        { action: "scroll", amount: 800 },
        { action: "clickLink", textIncludes: ["Q&A", "FAQ", "질문", "답변"] },
        { action: "expectAnyCta", texts: ctas },
      ];
    case "shop_order_check":
      return [
        { action: "goto", url: "/" },
        { action: "clickLink", textIncludes: ["쇼핑", "주문", "택배", "교체"] },
        ...(query ? [{ action: "search" as const, query }] : []),
        { action: "expectAnyText", textIncludes: ["주문", "배송", "단자", "교체", "사진"] },
        { action: "expectAnyCta", texts: ctas },
      ];
    case "repair_shop_search":
      return [
        { action: "goto", url: "/" },
        { action: "clickLink", textIncludes: ["작업 가능", "정비", "매장", "서비스", "교체 상담"] },
        { action: "expectAnyText", textIncludes: ["정비", "매장", "방문", "교체", "문의"] },
        { action: "expectAnyCta", texts: ctas },
      ];
    case "trust_check":
      return [
        { action: "goto", url: "/" },
        { action: "scroll", amount: 600 },
        { action: "clickLink", textIncludes: ["가이드", "검색", "차종", "규격"] },
        { action: "expectAnyText", textIncludes: [vehicle.model, battery, "배터리"] },
      ];
    default:
      return [
        { action: "goto", url: "/" },
        { action: "search", query: query || vSearch },
      ];
  }
}

function toPersonaVehicle(v: VehicleEntry): PersonaVehicle {
  return {
    brand: v.brand,
    model: v.model,
    generation: v.generation,
    year: v.year,
    fuel: v.fuel,
  };
}

function buildOnePersona(journey: JourneyType, slotIndex: number, globalIndex: number): Persona {
  const vehicle = pick(VEHICLE_CATALOG, globalIndex * 3 + slotIndex);
  const battery = pick(BATTERY_SPECS, globalIndex * 7 + slotIndex + 1);
  const situation = pick(SITUATIONS, globalIndex + slotIndex * 2);
  const personality = pick(PERSONALITIES, globalIndex * 2 + slotIndex);
  const ageGroup = pick(AGE_GROUPS, globalIndex + slotIndex);
  const knowledgeLevel = knowledgeFor(globalIndex);
  const urgency = urgencyFor(journey, personality, globalIndex);
  const device = deviceFor(journey, personality, globalIndex);
  const query = buildQuery(journey, vehicle, battery, situation, globalIndex * 11 + slotIndex);
  const goal = buildGoal(journey, vehicle, battery, situation, query);
  const ctx: PersonaBuildCtx = {
    vehicle,
    battery,
    situation,
    personality,
    ageGroup,
    journeyLabel: JOURNEY_TYPE_LABELS[journey],
    index: globalIndex,
  };
  const personaName = PERSONA_NAME_TEMPLATES[(globalIndex + slotIndex) % PERSONA_NAME_TEMPLATES.length](ctx);
  const expectedKeywords = buildKeywords(journey, vehicle, battery, situation, query);
  const steps = buildSteps(journey, query, vehicle, battery);

  return {
    id: `persona-${String(globalIndex + 1).padStart(3, "0")}`,
    personaName,
    personaType: journeyPersonaType(journey),
    ageGroup,
    knowledgeLevel,
    urgency,
    personality,
    vehicle: toPersonaVehicle(vehicle),
    situation,
    journeyType: journey,
    startBehavior: JOURNEY_START_BEHAVIOR[journey],
    query,
    goal,
    steps,
    expectedKeywords,
    expectedCtas: CTAS_BY_JOURNEY[journey],
    possibleFrustrations: buildFrustrations(journey, personality),
    device,
    severityWeight: severityFor(journey, urgency, personality),
    batterySpec: battery,
    actionType: journey === "direct_search" || journey === "compare_battery" ? "search" : "home",
  };
}

export function journeyQuotas(total: number): Record<JourneyType, number> {
  const journeys = Object.keys(JOURNEY_RATIOS) as JourneyType[];
  const quotas = {} as Record<JourneyType, number>;
  const raw = journeys.map((j) => ({ j, exact: total * JOURNEY_RATIOS[j] }));
  let assigned = 0;
  for (const { j, exact } of raw) {
    quotas[j] = Math.floor(exact);
    assigned += quotas[j];
  }
  let rem = total - assigned;
  const byFrac = [...raw].sort((a, b) => (b.exact % 1) - (a.exact % 1));
  for (let i = 0; i < rem; i++) {
    quotas[byFrac[i % byFrac.length].j]++;
  }

  if (total >= 25) {
    for (const j of journeys) {
      if (quotas[j] === 0) {
        quotas[j] = 1;
        const donor = journeys.find((d) => quotas[d] > 1);
        if (donor) quotas[donor]--;
      }
    }
  }
  return quotas;
}

export function generateAllPersonas(count = 500): Persona[] {
  const quotas = journeyQuotas(count);
  const personas: Persona[] = [];
  const queryCount = new Map<string, number>();
  const goalSet = new Set<string>();
  const nameSet = new Set<string>();
  let globalIndex = 0;

  for (const journey of Object.keys(quotas) as JourneyType[]) {
    let created = 0;
    let attempt = 0;
    while (created < quotas[journey] && attempt < quotas[journey] * 30) {
      const p = buildOnePersona(journey, created, globalIndex + attempt);
      attempt++;

      const qKey = p.query || `__no_query__${p.journeyType}__${p.id}`;
      if ((queryCount.get(qKey) ?? 0) >= 2) continue;

      if (goalSet.has(p.goal) || nameSet.has(p.personaName)) {
        p.personaName = `${p.personaName} (#${globalIndex + attempt})`;
        p.goal = `${p.goal} — 시나리오 ${globalIndex + attempt}`;
      }
      if (goalSet.has(p.goal) || nameSet.has(p.personaName)) continue;

      queryCount.set(qKey, (queryCount.get(qKey) ?? 0) + 1);
      goalSet.add(p.goal);
      nameSet.add(p.personaName);
      p.id = `persona-${String(personas.length + 1).padStart(3, "0")}`;
      personas.push(p);
      created++;
      globalIndex++;
    }
  }

  return personas.slice(0, count);
}

export function samplePersonasBalanced(all: Persona[], limit: number): Persona[] {
  if (limit >= all.length) return all;

  const quotas = journeyQuotas(limit);
  const byJourney = new Map<JourneyType, Persona[]>();
  for (const p of all) {
    const list = byJourney.get(p.journeyType) ?? [];
    list.push(p);
    byJourney.set(p.journeyType, list);
  }

  const journeyOrder = (Object.keys(quotas) as JourneyType[]).sort((a, b) => quotas[a] - quotas[b]);
  const selected: Persona[] = [];
  const usedIds = new Set<string>();

  for (const journey of journeyOrder) {
    const pool = byJourney.get(journey) ?? [];
    let taken = 0;
    for (const p of pool) {
      if (taken >= quotas[journey]) break;
      if (usedIds.has(p.id)) continue;
      selected.push(p);
      usedIds.add(p.id);
      taken++;
    }
  }

  if (selected.length < limit) {
    for (const p of all) {
      if (selected.length >= limit) break;
      if (usedIds.has(p.id)) continue;
      selected.push(p);
      usedIds.add(p.id);
    }
  }

  return selected.slice(0, limit);
}

export const TOTAL_PERSONA_CAPACITY = 500;

export function countByJourney(personas: Persona[]): Record<JourneyType, number> {
  const counts = {} as Record<JourneyType, number>;
  for (const j of Object.keys(JOURNEY_RATIOS) as JourneyType[]) counts[j] = 0;
  for (const p of personas) counts[p.journeyType]++;
  return counts;
}
