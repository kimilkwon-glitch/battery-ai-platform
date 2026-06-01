/**
 * Vehicle Alias DB v0.3 — 현대/기아 실사용 alias 보강 (연식·연료·오타)
 * vehicle-alias-db.ts에서 병합 (export명 v0.1 유지)
 */

export const V03_YEAR_ALIASES = {
  y16: ["16년식", "2016년식", "16년", "2016"],
  y17: ["17년식", "2017년식", "17년", "2017"],
  y18: ["18년식", "2018년식", "18년", "2018"],
  y19: ["19년식", "2019년식", "19년", "2019"],
  y20: ["20년식", "2020년식", "20년", "2020"],
  y21: ["21년식", "2021년식", "21년", "2021"],
  y22: ["22년식", "2022년식", "22년", "2022"],
  y23: ["23년식", "2023년식", "23년", "2023"],
  y24: ["24년식", "2024년식", "24년", "2024"],
  y25: ["25년식", "2025년식", "25년", "2025"],
} as const;

const FUEL_HEV = ["하브", "하이브리드", "HEV", "hev", "hybrid", "하이브리드차"];
const FUEL_EV = ["전기", "전기차", "EV", "ev", "일렉트릭", "electric", "일렉트리파이드"];
const FUEL_LPG = ["LPG", "lpg", "LPe", "lpe", "엘피지", "엘피이", "가스", "바이퓨얼"];
const FUEL_DIESEL = ["디젤", "경유", "diesel"];
const FUEL_GAS = ["가솔린", "휘발유", "gasoline"];

function withModelYears(modelNames: string[], yearKeys: (keyof typeof V03_YEAR_ALIASES)[]): string[] {
  const out: string[] = [];
  for (const name of modelNames) {
    const compact = name.replace(/\s+/g, "");
    for (const key of yearKeys) {
      for (const y of V03_YEAR_ALIASES[key]) {
        out.push(`${compact}${y}`, `${name} ${y}`, `${name}${y}`);
      }
    }
  }
  return out;
}

export type VehicleAliasV03Augment = {
  aliases?: string[];
  displayAliases?: string[];
  intentTags?: string[];
  mapToFuel?: "gasoline" | "diesel" | "lpg" | "hev" | "ev";
};

/** slugHint별 추가 alias (기존 엔트리에 병합) */
export const vehicleAliasV03Augments: Record<string, VehicleAliasV03Augment> = {
  "hyundai-grand-starex": {
    aliases: [
      "그랜드스타렉스",
      "그랜드 스타렉스 16년식",
      "그랜드스타렉스 18년식",
      ...withModelYears(["그랜드 스타렉스", "그랜드스타렉스"], ["y16", "y17", "y18", "y19"]),
    ],
  },
  "hyundai-staria-us4": {
    aliases: [
      "스타리아 21년식",
      "스타리아 22년식",
      "스타리아 23년식",
      ...withModelYears(["스타리아"], ["y21", "y22", "y23", "y24", "y25"]),
      ...FUEL_DIESEL.map((f) => `스타리아 ${f}`),
      ...FUEL_LPG.map((f) => `스타리아 ${f}`),
    ],
  },
  "hyundai-staria-hev": {
    aliases: [...FUEL_HEV.map((f) => `스타리아 ${f}`), "스타리아 하이브리드 24년식"],
    intentTags: ["hev"],
    mapToFuel: "hev",
  },
  "hyundai-porter2": {
    aliases: [
      "포터2 19년식",
      "포터2 20년식",
      "포터2 21년식",
      "포터 19년식",
      "포터 21년식",
      ...withModelYears(["포터2", "포터 2"], ["y16", "y17", "y18", "y19", "y20", "y21", "y22"]),
      ...FUEL_DIESEL.map((f) => `포터2 ${f}`),
      ...FUEL_LPG.map((f) => `포터2 ${f}`),
      ...FUEL_EV.map((f) => `포터2 ${f}`),
      ...FUEL_EV.map((f) => `포터 ${f}`),
    ],
  },
  "hyundai-avante-ad": {
    aliases: withModelYears(["아반떼 AD", "아반떼AD"], ["y16", "y17", "y18", "y19"]),
  },
  "hyundai-avante-cn7": {
    aliases: [
      "아반떼cn7",
      "cn7아반떼",
      "아반떼 cn7 21년식",
      ...withModelYears(["아반떼 CN7", "아반떼CN7"], ["y20", "y21", "y22", "y23", "y24", "y25"]),
      ...FUEL_HEV.map((f) => `아반떼 ${f}`),
    ],
  },
  "hyundai-sonata-lf": {
    aliases: withModelYears(["쏘나타 LF", "쏘나타LF", "소나타 LF"], ["y16", "y17", "y18", "y19"]),
  },
  "hyundai-sonata-dn8": {
    aliases: [
      ...withModelYears(["쏘나타 DN8", "쏘나타DN8"], ["y19", "y20", "y21", "y22", "y23", "y24"]),
      ...FUEL_HEV.map((f) => `쏘나타 dn8 ${f}`),
    ],
  },
  "hyundai-sonata-dn8-hev": {
    aliases: [
      "쏘나타 dn8 하브",
      "쏘나타dn8하이브리드",
      "쏘나타 DN8 HEV",
      ...FUEL_HEV.map((f) => `쏘나타 dn8 ${f}`),
    ],
    mapToFuel: "hev",
  },
  "hyundai-grandeur-ig": {
    aliases: [
      "더뉴그랜저",
      "더뉴 그랜저",
      "더 뉴 그랜저 IG",
      "그랜저ig 21년식",
      ...withModelYears(["그랜저 IG", "그랜저IG"], ["y16", "y17", "y18", "y19", "y20"]),
      ...FUEL_HEV.map((f) => `그랜저 ig ${f}`),
      ...FUEL_LPG.map((f) => `그랜저 ig ${f}`),
    ],
  },
  "hyundai-grandeur-gn7": {
    aliases: [
      "디올뉴그랜저",
      "올뉴그랜저",
      ...withModelYears(["그랜저 GN7", "디 올 뉴 그랜저"], ["y21", "y22", "y23", "y24", "y25"]),
    ],
  },
  "hyundai-santafe-dm": {
    aliases: [
      "산타페 더프라임",
      "싼타페더프라임",
      "싼타페 더 프라임",
      "싼타페 더프라임",
      ...withModelYears(["싼타페 DM", "싼타페DM"], ["y16", "y17", "y18"]),
    ],
  },
  "hyundai-santafe-tm": {
    aliases: [
      "더뉴싼타페",
      "더 뉴 싼타페 TM",
      "더뉴 싼타페 21년식",
      ...withModelYears(["싼타페 TM", "싼타페TM"], ["y18", "y19", "y20", "y21", "y22", "y23"]),
    ],
  },
  "hyundai-santafe-mx5": {
    aliases: [
      "싼타페 mx5",
      "싼타페MX5",
      "디올뉴싼타페",
      ...withModelYears(["싼타페 MX5"], ["y23", "y24", "y25"]),
    ],
  },
  "hyundai-tucson-lm": {
    aliases: ["투싼 TL", "투싼tl", ...withModelYears(["투싼 ix"], ["y16", "y17"])],
  },
  "hyundai-tucson-tl": {
    aliases: withModelYears(["투싼 TL", "올뉴투싼"], ["y16", "y17", "y18", "y19"]),
  },
  "hyundai-tucson-nx4": {
    aliases: [
      ...withModelYears(["투싼 NX4", "투싼NX4"], ["y20", "y21", "y22", "y23", "y24"]),
      ...FUEL_DIESEL.map((f) => `투싼 nx4 ${f}`),
    ],
  },
  "hyundai-tucson-nx4-hev": {
    aliases: [
      "투싼 nx4 하브",
      "투싼nx4하이브리드",
      "투싼 NX4 HEV",
      ...FUEL_HEV.map((f) => `투싼 nx4 ${f}`),
    ],
    mapToFuel: "hev",
  },
  "hyundai-palisade-lx2": {
    aliases: withModelYears(["팰리세이드", "펠리세이드"], ["y19", "y20", "y21", "y22", "y23", "y24"]),
  },
  "hyundai-kona-os": {
    aliases: [
      ...FUEL_EV.map((f) => `코나 ${f}`),
      ...FUEL_HEV.map((f) => `코나 ${f}`),
      ...withModelYears(["코나"], ["y17", "y18", "y19", "y20", "y21", "y22"]),
    ],
  },
  "hyundai-kona-sx2": {
    aliases: [...FUEL_EV.map((f) => `코나 ${f}`), ...withModelYears(["디 올 뉴 코나"], ["y23", "y24", "y25"])],
  },
  "hyundai-ioniq5-ne": {
    aliases: [...FUEL_EV, ...withModelYears(["아이오닉5", "아이오닉 5"], ["y21", "y22", "y23", "y24", "y25"])],
  },
  "hyundai-ioniq6-ce": {
    aliases: [...FUEL_EV, ...withModelYears(["아이오닉6", "아이오닉 6"], ["y22", "y23", "y24", "y25"])],
  },
  "kia-morning-ja": {
    aliases: withModelYears(["모닝", "모닝 JA"], ["y17", "y18", "y19", "y20", "y21", "y22", "y23", "y24"]),
  },
  "kia-ray-1st": {
    aliases: [...withModelYears(["레이"], ["y16", "y17", "y18", "y19", "y20", "y21", "y22"]), ...FUEL_EV.map((f) => `레이 ${f}`)],
  },
  "kia-k3-1st": {
    aliases: [
      "케이쓰리",
      "케이3",
      "k3쿱",
      "K3쿱",
      "K3 쿠페",
      ...withModelYears(["K3", "케이3"], ["y16", "y17", "y18"]),
    ],
  },
  "kia-k3-bd": {
    aliases: [
      "올뉴K3",
      "올 뉴 K3",
      ...withModelYears(["K3", "올뉴 K3"], ["y18", "y19", "y20", "y21", "y22"]),
    ],
  },
  "kia-k5-jf": {
    aliases: withModelYears(["K5", "K5 2세대"], ["y16", "y17", "y18"]),
  },
  "kia-k5-dl3": {
    aliases: [
      "K5 DL3",
      "k5 dl3",
      ...withModelYears(["K5", "K5 DL3"], ["y19", "y20", "y21", "y22", "y23", "y24", "y25"]),
      ...FUEL_HEV.map((f) => `K5 ${f}`),
    ],
  },
  "kia-k7-vg": {
    aliases: withModelYears(["K7", "케이7"], ["y16", "y17", "y18"]),
  },
  "kia-k7-yg": {
    aliases: withModelYears(["K7", "올뉴 K7"], ["y16", "y17", "y18", "y19", "y20"]),
  },
  "kia-k8-gl3": {
    aliases: withModelYears(["K8", "케이8"], ["y21", "y22", "y23", "y24", "y25"]),
  },
  "kia-sportage-ql": {
    aliases: withModelYears(["스포티지 QL", "스포티지QL"], ["y16", "y17", "y18", "y19", "y20"]),
  },
  "kia-sportage-nq5": {
    aliases: withModelYears(["스포티지 NQ5"], ["y21", "y22", "y23", "y24", "y25"]),
  },
  "kia-sorento-um": {
    aliases: withModelYears(["쏘렌토 UM", "올뉴 쏘렌토"], ["y16", "y17", "y18", "y19"]),
  },
  "kia-sorento-mq4": {
    aliases: [
      "쏘렌토 mq4 디젤",
      ...withModelYears(["쏘렌토 MQ4"], ["y20", "y21", "y22", "y23", "y24"]),
      ...FUEL_DIESEL.map((f) => `쏘렌토 mq4 ${f}`),
    ],
  },
  "kia-sorento-mq4-hev": {
    aliases: [
      "쏘렌토 mq4 하브",
      "쏘렌토mq4하이브리드",
      ...FUEL_HEV.map((f) => `쏘렌토 mq4 ${f}`),
    ],
    mapToFuel: "hev",
  },
  "kia-carnival-yp": {
    aliases: withModelYears(["카니발 YP", "올뉴 카니발"], ["y16", "y17", "y18", "y19"]),
  },
  "kia-carnival-ka4": {
    aliases: [
      "카니발 ka4",
      "카니발KA4",
      ...withModelYears(["카니발 KA4"], ["y20", "y21", "y22", "y23", "y24", "y25"]),
    ],
  },
  "kia-seltos": {
    aliases: [
      "셀토스 21년식",
      "셀토스 22년식",
      ...withModelYears(["셀토스"], ["y19", "y20", "y21", "y22", "y23", "y24", "y25"]),
    ],
  },
  "kia-niro-de": {
    aliases: [
      ...FUEL_HEV.map((f) => `니로 ${f}`),
      ...FUEL_EV.map((f) => `니로 ${f}`),
      "니로 PHEV",
      "니로 플러그인",
      ...withModelYears(["니로"], ["y16", "y17", "y18", "y19", "y20", "y21"]),
    ],
  },
  "kia-niro-sg2": {
    aliases: [...FUEL_HEV.map((f) => `니로 ${f}`), ...FUEL_EV.map((f) => `니로 ${f}`), ...withModelYears(["디 올 뉴 니로"], ["y22", "y23", "y24", "y25"])],
  },
  "kia-bongo3": {
    aliases: [
      "봉고3 전기",
      "봉고3전기",
      "봉고 전기",
      ...withModelYears(["봉고3", "봉고 3"], ["y16", "y17", "y18", "y19", "y20", "y21", "y22"]),
      ...FUEL_EV.map((f) => `봉고3 ${f}`),
      ...FUEL_DIESEL.map((f) => `봉고3 ${f}`),
    ],
  },
  "kia-mohave": {
    aliases: [
      "모하비 16년식",
      ...withModelYears(["모하비"], ["y16", "y17", "y18", "y19", "y20"]),
      ...FUEL_DIESEL.map((f) => `모하비 ${f}`),
    ],
  },
};

/** v0.3 신규 엔트리 (코어/v02에 없는 항목만) */
export const vehicleAliasDbV03NewEntries = [
  {
    brandGroup: "hyundai" as const,
    brandLabel: "현대",
    canonicalName: "더 뉴 그랜저 IG",
    slugHint: "hyundai-grandeur-ig-fl",
    yearRange: "2019-2022",
    generationCode: "IG",
    generationName: "그랜저 IG 페이스리프트",
    displayAliases: ["더 뉴 그랜저 IG", "그랜저 IG 페이스리프트"],
    aliases: [
      "더뉴그랜저IG",
      "더 뉴 그랜저 IG",
      "더뉴 그랜저",
      "그랜저 IG FL",
      ...withModelYears(["더 뉴 그랜저", "그랜저 IG"], ["y19", "y20", "y21", "y22"]),
    ],
    intentTags: ["vehicle", "generation", "facelift"],
    mapTo: { vehicleFamily: "그랜저", generation: "IG" },
    notes: "IG 본형과 페이스리프트 구분. asset은 grandeur-ig-fl.",
  },
];
