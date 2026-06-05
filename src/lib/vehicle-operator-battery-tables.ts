/** 차종표·운영 단일 기준 — 대표 규격·연료별 후보 (DB·검수 상태와 분리) */

export const OPERATOR_SLUG_PRIMARY_BATTERY: Record<string, string> = {
  gv70: "AGM80R",
  gv80: "AGM95R",
  "g80-rg3": "AGM95R",
  g90: "AGM95R",
  "genesis-gv70": "AGM80R",
  "genesis-gv80": "AGM95R",
  "genesis-gv60": "AGM60L",
  "staria-us4": "AGM80R",
  "porter2-new": "100R",
  "hyundai-porter2-from2020": "100R",
  "renault-master-2018": "AGM95L",
  "renault-arkana-2024": "AGM60L",
  "renault-samsung-qm6-quest-2023": "DIN74L",
  "kg-actyon-2024": "AGM70L",
  "kg-torres-evx-2023": "60R",
  "gmdaewoo-labo-2011": "50L",
  "gmdaewoo-damas-2011": "50L",
  "chevrolet-bolt-ev-2017": "AGM50L",
  "porter2-ev": "80L",
  "bongo3-ev": "80L",
  "chevrolet-trailblazer-2024": "AGM70L",
  "chevrolet-equinox-2022": "AGM70L",
  "daewoo-tosca-2006": "80R",
};

export const OPERATOR_FUEL_PRIMARY: Record<string, Record<string, string>> = {
  "grandeur-ig": {
    가솔린: "AGM70L",
    디젤: "AGM80L",
    LPG: "DIN80L",
    하이브리드: "DIN74R",
  },
  "sportage-nq5": { 하이브리드: "AGM60L" },
  "k8-gl3": { 하이브리드: "AGM60L" },
  "sorento-mq4": { 하이브리드: "AGM60L" },
  "sorento-mq4-fl": { 하이브리드: "AGM60L" },
  "kona-sx2": {
    가솔린: "AGM60L",
    전기: "AGM60L",
  },
  "chevrolet-the-new-cruze-2015": {
    가솔린: "DIN60L",
    디젤: "DIN74L",
    "ISG/스마트충전": "AGM80L",
  },
  "santafe-mx5": {
    가솔린: "AGM70L",
    하이브리드: "AGM60L",
  },
  "santafe-mx5-hev": {
    하이브리드: "AGM60L",
  },
  "porter2-ev": {
    전기: "80L",
  },
  "bongo3-ev": {
    전기: "80L",
  },
  "kg-torres-2022": {
    가솔린: "AGM70L",
    전기: "60R",
  },
};
