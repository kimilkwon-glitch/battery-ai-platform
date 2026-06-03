/**
 * 제네시스 차량 검색·자동완성 registry
 */
import type { VehicleAsset } from "@/lib/car-assets";

function genesisImage(file: string): string {
  return `/assets/cars-normalized/genesis/${file}`;
}

function g(
  id: string,
  modelGroup: string,
  displayName: string,
  imageFile: string,
  opts: {
    generationName?: string;
    aliases?: string[];
    yearRange?: string;
    catalogId?: string;
    defaultBatteryCode?: string;
    batteryNotes?: string;
    tags?: string[];
  } = {},
): VehicleAsset {
  const aliases = opts.aliases ?? [displayName];
  return {
    id,
    brand: "genesis",
    modelGroup,
    displayName,
    generationName: opts.generationName,
    aliases: [...new Set([displayName, ...aliases])],
    imageFile,
    image: genesisImage(imageFile),
    batteryNotes: opts.batteryNotes,
    tags: opts.tags,
    yearRange: opts.yearRange,
    catalogId: opts.catalogId ?? id,
    defaultBatteryCode: opts.defaultBatteryCode,
    batteryMatchStatus: opts.defaultBatteryCode ? "linked" : "needsReview",
  };
}

export const vehicleAssetsGenesis: VehicleAsset[] = [
  g("genesis-gv60", "gv60", "GV60", "genesis_gv60_2021.png", {
    yearRange: "2021-현재",
    catalogId: "genesis-gv60",
    defaultBatteryCode: "AGM60L",
    batteryNotes: "대표 규격 AGM60L",
    aliases: ["GV60", "gv60", "지브이60", "제네시스 GV60", "제네시스 지브이60"],
    tags: ["SUV", "EV"],
  }),
  g("genesis-gv70", "gv70", "GV70", "genesis_gv70_2020.png", {
    yearRange: "2020-현재",
    catalogId: "gv70",
    defaultBatteryCode: "AGM80R",
    batteryNotes: "대표 규격 AGM80R",
    aliases: ["GV70", "gv70", "지브이70", "제네시스 GV70", "제네시스 지브이70"],
    tags: ["SUV"],
  }),
  g("genesis-gv80", "gv80", "GV80", "genesis_gv80_2020.png", {
    yearRange: "2020-현재",
    catalogId: "gv80",
    defaultBatteryCode: "AGM95R",
    batteryNotes: "대표 규격 AGM95R",
    aliases: ["GV80", "gv80", "지브이80", "제네시스 GV80", "제네시스 지브이80"],
    tags: ["SUV"],
  }),
  g("genesis-g70", "g70", "G70", "genesis_g70_2017_2020.png", {
    yearRange: "2017-현재",
    catalogId: "g70-ik",
    defaultBatteryCode: "AGM80L",
    batteryNotes: "연식·옵션별 확인 필요",
    aliases: ["G70", "g70", "제네시스 G70"],
    tags: ["세단"],
  }),
  g("genesis-g80-rg3", "g80", "G80", "genesis_the_all_new_g80_2020_2023.png", {
    generationName: "RG3",
    yearRange: "2020-현재",
    catalogId: "g80-rg3",
    defaultBatteryCode: "AGM95R",
    batteryNotes: "대표 규격 AGM95R",
    aliases: [
      "G80",
      "g80",
      "지에이티",
      "제네시스 G80",
      "제네시스 지에이티",
      "제네시스 지팔공",
      "G80 RG3",
      "디 올 뉴 G80",
    ],
    tags: ["세단"],
  }),
  g("genesis-g80-dh", "g80", "G80", "genesis_g80_2016_2020.png", {
    generationName: "DH",
    yearRange: "2016-2020",
    catalogId: "genesis-g80-dh",
    defaultBatteryCode: "AGM105L",
    batteryNotes: "대표 규격 AGM105L",
    aliases: ["G80 DH", "G80 1세대", "제네시스 G80 DH"],
    tags: ["세단"],
  }),
  g("genesis-eq900", "g90", "EQ900", "genesis_eq900_2015_2018.png", {
    yearRange: "2015-2018",
    catalogId: "genesis-eq900",
    defaultBatteryCode: "AGM105L",
    batteryNotes: "대표 규격 AGM105L",
    aliases: ["EQ900", "eq900", "이큐900", "에쿠스 후속", "제네시스 EQ900"],
    tags: ["세단"],
  }),
  g("genesis-g90", "g90", "G90", "genesis_g90_2018_2021.png", {
    yearRange: "2018-현재",
    catalogId: "g90",
    batteryNotes: "상담 확인 권장",
    aliases: ["G90", "g90", "지구공", "제네시스 G90"],
    tags: ["세단"],
  }),
  g("genesis-dh", "genesis", "제네시스 DH", "genesis_dh_2013_2016.png", {
    yearRange: "2013-2016",
    catalogId: "genesis-dh",
    defaultBatteryCode: "AGM105L",
    batteryNotes: "대표 규격 AGM105L",
    aliases: ["제네시스 DH", "제네시스DH", "현대 제네시스", "DH 제네시스"],
    tags: ["세단"],
  }),
];
