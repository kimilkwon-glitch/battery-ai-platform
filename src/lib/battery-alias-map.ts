import { getBatteryAliases, normalizeBatteryCode as normalizeBatteryFamily } from "./batteryNormalize";

/** public/assets/batteries — /public 접두사 금지 */
const ASSET_BASE = "/assets/batteries";

export type BatteryImageSet = {
  main: string;
  productBox?: string;
  boxFront?: string;
  boxAngle?: string;
  productBoxAngle?: string;
  labelTop?: string;
  frontLabel?: string;
};

export type BatteryBrandKey = "rocket" | "solite" | "delkor" | "delco" | "varta" | "atk";

/** platform brandId → alias map brandKey */
export function brandIdToBatteryBrandKey(brandId: string): BatteryBrandKey | undefined {
  const map: Record<string, BatteryBrandKey> = {
    rocket: "rocket",
    solite: "solite",
    delco: "delco",
    delkor: "delkor",
    varta: "varta",
    atk: "atk",
  };
  return map[brandId];
}

export type BatterySpecEntry = {
  canonical: string;
  type: "AGM" | "DIN" | "GB" | "EV" | "CMF";
  terminal: "L" | "R";
  capacityAh?: number;
  aliases: string[];
  brandCodes: Partial<Record<BatteryBrandKey, string[]>>;
  imageFolderByBrand: Partial<Record<BatteryBrandKey, string>>;
};

const CMF_PNG_SLOTS = {
  main: "01-main.png",
  productBox: "02-product-box.png",
  boxFront: "03-box-front.png",
  boxAngle: "04-box-angle.png",
  productBoxAngle: "05-product-box-angle.png",
  labelTop: "06-label-top.png",
  frontLabel: "07-front-label.png",
} as const;

/** 실제 폴더별 파일명 (확장자 포함) — public/assets/batteries 스캔 기준 */
const FOLDER_IMAGE_FILES: Record<
  string,
  {
    main: string;
    productBox?: string;
    boxFront?: string;
    boxAngle?: string;
    productBoxAngle?: string;
    labelTop?: string;
    frontLabel?: string;
  }
> = {
  AGM105L: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  AGM60L: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  AGM70L: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  AGM80L: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  AGM95L: { main: "01-main.jpg", productBox: "02-product-box.jpg", boxFront: "03-box-front.jpg", boxAngle: "04-box-angle.jpg", productBoxAngle: "05-product-box-angle.jpg", labelTop: "06-label-top.jpg", frontLabel: "07-front-label.jpg" },
  AGM95R: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB55066: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB56219: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB57219: { main: "01-main.png", productBox: "02-product-box.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB57820: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB58014: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB59042: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB60044: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB40AL: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB50L: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB60AL: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB60R: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB80L: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB80R: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB90L: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB90R: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB95R: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB100L: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  GB100R: { main: "01-main.png", productBox: "02-product-box.png", boxFront: "03-box-front.png", boxAngle: "04-box-angle.png", productBoxAngle: "05-product-box-angle.png", labelTop: "06-label-top.png", frontLabel: "07-front-label.png" },
  CMF40L: { ...CMF_PNG_SLOTS },
  CMF60L: { ...CMF_PNG_SLOTS },
  CMF80L: { ...CMF_PNG_SLOTS },
  CMF80R: { ...CMF_PNG_SLOTS },
  CMF90L: { ...CMF_PNG_SLOTS },
  CMF90R: { ...CMF_PNG_SLOTS },
  CMF100L: { ...CMF_PNG_SLOTS },
  CMF100R: { ...CMF_PNG_SLOTS },
  CMF54459: { ...CMF_PNG_SLOTS },
  CMF56219: { ...CMF_PNG_SLOTS },
  CMF57412: { ...CMF_PNG_SLOTS },
};

export const batteryAliasMap: Record<string, BatterySpecEntry> = {
  AGM60L: {
    canonical: "AGM60L",
    type: "AGM",
    terminal: "L",
    capacityAh: 60,
    aliases: ["AGM60", "AGM60L", "AGM 60L", "AGM LN2", "LN2", "AGM60Ah"],
    brandCodes: { rocket: ["AGM60L", "AGM 60L2", "AGM60"], solite: ["AGM60L", "AGM LN2"], delkor: ["AGM60L"] },
    imageFolderByBrand: { rocket: "AGM60L" },
  },
  AGM70L: {
    canonical: "AGM70L",
    type: "AGM",
    terminal: "L",
    capacityAh: 70,
    aliases: ["AGM70", "AGM70L", "AGM 70L", "AGM LN3", "LN3", "AGM70Ah"],
    brandCodes: { rocket: ["AGM70L", "AGM 70L3", "AGM70"], solite: ["AGM70L", "AGM LN3"], delkor: ["AGM70L"] },
    imageFolderByBrand: { rocket: "AGM70L" },
  },
  AGM80L: {
    canonical: "AGM80L",
    type: "AGM",
    terminal: "L",
    capacityAh: 80,
    aliases: ["AGM80", "AGM80L", "AGM 80L", "AGM LN4", "LN4", "AGM80Ah"],
    brandCodes: { rocket: ["AGM80L", "AGM 80L4", "AGM80"], solite: ["AGM80L", "AGM LN4"], delkor: ["AGM80L"] },
    imageFolderByBrand: { rocket: "AGM80L" },
  },
  AGM80R: {
    canonical: "AGM80R",
    type: "AGM",
    terminal: "R",
    capacityAh: 80,
    aliases: ["AGM80R", "AGM80 R", "AGM LN4 R", "GB80R", "CMF80R", "80R"],
    brandCodes: { rocket: ["GB80R"], solite: ["CMF80R"] },
    imageFolderByBrand: { rocket: "GB80R", solite: "CMF80R" },
  },
  AGM95L: {
    canonical: "AGM95L",
    type: "AGM",
    terminal: "L",
    capacityAh: 95,
    aliases: ["AGM95", "AGM95L", "AGM 95L", "AGM95L5", "AGM 95L5", "LN5"],
    brandCodes: { rocket: ["AGM95L", "AGM 95L5"], solite: ["AGM95L"], delkor: ["AGM95L"] },
    imageFolderByBrand: { rocket: "AGM95L" },
  },
  AGM95R: {
    canonical: "AGM95R",
    type: "AGM",
    terminal: "R",
    capacityAh: 95,
    aliases: ["AGM95R", "AGM 95R", "AGM95R5", "AGM 95R5"],
    brandCodes: { rocket: ["AGM95R", "AGM 95R5"] },
    imageFolderByBrand: { rocket: "AGM95R" },
  },
  AGM105L: {
    canonical: "AGM105L",
    type: "AGM",
    terminal: "L",
    capacityAh: 105,
    aliases: ["AGM105", "AGM105L", "AGM 105L", "AGM105L6", "AGM 105L6"],
    brandCodes: { rocket: ["AGM105L", "AGM 105L6"] },
    imageFolderByBrand: { rocket: "AGM105L" },
  },
  DIN50L: {
    canonical: "DIN50L",
    type: "DIN",
    terminal: "L",
    aliases: ["DIN50", "DIN50L", "DIN44L", "55066", "GB55066", "54459", "CMF54459", "쏠라이트54459", "쏠라이트 CMF54459"],
    brandCodes: { rocket: ["GB55066", "55066"], solite: ["CMF54459", "54459"] },
    imageFolderByBrand: { rocket: "GB55066", solite: "CMF54459" },
  },
  DIN60L: {
    canonical: "DIN60L",
    type: "DIN",
    terminal: "L",
    aliases: ["DIN60", "DIN60L", "DIN60HL", "DIN60Ah", "DIN62L", "56219", "GB56219", "CMF56219", "쏠라이트56219", "쏠라이트 CMF56219"],
    brandCodes: { rocket: ["GB56219", "56219"], solite: ["CMF56219", "56219"] },
    imageFolderByBrand: { rocket: "GB56219", solite: "CMF56219" },
  },
  DIN74L: {
    canonical: "DIN74L",
    type: "DIN",
    terminal: "L",
    aliases: ["DIN74", "DIN74L", "DIN78L", "57412", "57820", "GB57820", "CMF57412", "쏠라이트57412", "쏠라이트 CMF57412"],
    brandCodes: { rocket: ["GB57820", "57820"], solite: ["CMF57412", "57412"] },
    imageFolderByBrand: { rocket: "GB57820", solite: "CMF57412" },
  },
  DIN74R: {
    canonical: "DIN74R",
    type: "DIN",
    terminal: "R",
    aliases: ["DIN74R", "57219", "GB57219", "57412R", "57820R", "로케트57219", "로케트 GB57219"],
    brandCodes: { rocket: ["GB57219", "57219"] },
    imageFolderByBrand: { rocket: "GB57219" },
  },
  DIN80L: {
    canonical: "DIN80L",
    type: "DIN",
    terminal: "L",
    aliases: ["DIN80", "DIN80L", "58014", "GB58014"],
    brandCodes: { rocket: ["GB58014", "58014"] },
    imageFolderByBrand: { rocket: "GB58014" },
  },
  DIN90L: {
    canonical: "DIN90L",
    type: "DIN",
    terminal: "L",
    aliases: ["DIN90", "DIN90L", "59042", "GB59042"],
    brandCodes: { rocket: ["GB59042", "59042"] },
    imageFolderByBrand: { rocket: "GB59042" },
  },
  DIN100L: {
    canonical: "DIN100L",
    type: "DIN",
    terminal: "L",
    aliases: ["DIN100", "DIN100L", "60044", "GB60044"],
    brandCodes: { rocket: ["GB60044", "60044"] },
    imageFolderByBrand: { rocket: "GB60044" },
  },
  GB40AL: {
    canonical: "GB40AL",
    type: "GB",
    terminal: "L",
    aliases: ["GB40AL", "40AL"],
    brandCodes: { rocket: ["GB40AL"] },
    imageFolderByBrand: { rocket: "GB40AL" },
  },
  GB50L: {
    canonical: "GB50L",
    type: "GB",
    terminal: "L",
    aliases: ["GB50L", "50L"],
    brandCodes: { rocket: ["GB50L"] },
    imageFolderByBrand: { rocket: "GB50L" },
  },
  GB60AL: {
    canonical: "GB60AL",
    type: "GB",
    terminal: "L",
    aliases: ["GB60AL", "60AL"],
    brandCodes: { rocket: ["GB60AL"] },
    imageFolderByBrand: { rocket: "GB60AL" },
  },
  GB60R: {
    canonical: "GB60R",
    type: "GB",
    terminal: "R",
    aliases: ["GB60R", "60R"],
    brandCodes: { rocket: ["GB60R"] },
    imageFolderByBrand: { rocket: "GB60R" },
  },
  GB80L: {
    canonical: "GB80L",
    type: "GB",
    terminal: "L",
    aliases: ["GB80L", "80L"],
    brandCodes: { rocket: ["GB80L"] },
    imageFolderByBrand: { rocket: "GB80L" },
  },
  GB80R: {
    canonical: "GB80R",
    type: "GB",
    terminal: "R",
    aliases: ["GB80R", "80R"],
    brandCodes: { rocket: ["GB80R"] },
    imageFolderByBrand: { rocket: "GB80R" },
  },
  GB90L: {
    canonical: "GB90L",
    type: "GB",
    terminal: "L",
    aliases: ["GB90L", "90L"],
    brandCodes: { rocket: ["GB90L"] },
    imageFolderByBrand: { rocket: "GB90L" },
  },
  GB90R: {
    canonical: "GB90R",
    type: "GB",
    terminal: "R",
    aliases: ["GB90R", "90R"],
    brandCodes: { rocket: ["GB90R"] },
    imageFolderByBrand: { rocket: "GB90R" },
  },
  GB95R: {
    canonical: "GB95R",
    type: "GB",
    terminal: "R",
    aliases: ["GB95R", "95R"],
    brandCodes: { rocket: ["GB95R"] },
    imageFolderByBrand: { rocket: "GB95R" },
  },
  GB100L: {
    canonical: "GB100L",
    type: "GB",
    terminal: "L",
    aliases: ["GB100L", "100L"],
    brandCodes: { rocket: ["GB100L"] },
    imageFolderByBrand: { rocket: "GB100L" },
  },
  GB100R: {
    canonical: "GB100R",
    type: "GB",
    terminal: "R",
    aliases: ["GB100R", "100R"],
    brandCodes: { rocket: ["GB100R"] },
    imageFolderByBrand: { rocket: "GB100R" },
  },
  CMF40L: {
    canonical: "CMF40L",
    type: "CMF",
    terminal: "L",
    capacityAh: 40,
    aliases: ["CMF40L", "40L", "쏠라이트40L", "쏠라이트 CMF40L"],
    brandCodes: { solite: ["CMF40L"] },
    imageFolderByBrand: { solite: "CMF40L" },
  },
  CMF60L: {
    canonical: "CMF60L",
    type: "CMF",
    terminal: "L",
    capacityAh: 60,
    aliases: ["CMF60L", "60L", "쏠라이트60L", "쏠라이트 CMF60L"],
    brandCodes: { solite: ["CMF60L"] },
    imageFolderByBrand: { solite: "CMF60L" },
  },
  CMF80L: {
    canonical: "CMF80L",
    type: "CMF",
    terminal: "L",
    capacityAh: 80,
    aliases: ["CMF80L", "80L", "쏠라이트80L", "쏠라이트 CMF80L"],
    brandCodes: { solite: ["CMF80L"] },
    imageFolderByBrand: { solite: "CMF80L" },
  },
  CMF80R: {
    canonical: "CMF80R",
    type: "CMF",
    terminal: "R",
    capacityAh: 80,
    aliases: ["CMF80R", "80R", "쏠라이트80R", "쏠라이트 CMF80R"],
    brandCodes: { solite: ["CMF80R"] },
    imageFolderByBrand: { solite: "CMF80R" },
  },
  CMF90L: {
    canonical: "CMF90L",
    type: "CMF",
    terminal: "L",
    capacityAh: 90,
    aliases: ["CMF90L", "90L", "쏠라이트90L", "쏠라이트 CMF90L"],
    brandCodes: { solite: ["CMF90L"] },
    imageFolderByBrand: { solite: "CMF90L" },
  },
  CMF90R: {
    canonical: "CMF90R",
    type: "CMF",
    terminal: "R",
    capacityAh: 90,
    aliases: ["CMF90R", "90R", "쏠라이트90R", "쏠라이트 CMF90R"],
    brandCodes: { solite: ["CMF90R"] },
    imageFolderByBrand: { solite: "CMF90R" },
  },
  CMF100L: {
    canonical: "CMF100L",
    type: "CMF",
    terminal: "L",
    capacityAh: 100,
    aliases: ["CMF100L", "100L", "쏠라이트100L", "쏠라이트 CMF100L"],
    brandCodes: { solite: ["CMF100L"] },
    imageFolderByBrand: { solite: "CMF100L" },
  },
  CMF100R: {
    canonical: "CMF100R",
    type: "CMF",
    terminal: "R",
    capacityAh: 100,
    aliases: ["CMF100R", "100R", "쏠라이트100R", "쏠라이트 CMF100R"],
    brandCodes: { solite: ["CMF100R"] },
    imageFolderByBrand: { solite: "CMF100R" },
  },
};

const aliasToCanonical = new Map<string, string>();

function registerAlias(raw: string, canonical: string) {
  const key = normalizeBatteryCode(raw);
  if (key) aliasToCanonical.set(key, canonical);
}

for (const [canonical, spec] of Object.entries(batteryAliasMap)) {
  registerAlias(canonical, canonical);
  for (const a of spec.aliases) registerAlias(a, canonical);
  for (const codes of Object.values(spec.brandCodes)) {
    if (codes) for (const c of codes) registerAlias(c, canonical);
  }
}

/** 검색·매칭용 정규화 */
export function normalizeBatteryCode(input: string): string {
  const trimmed = input.trim().toUpperCase();
  if (trimmed === "EV 12V") return "EV12V";
  if (trimmed === "EV 12V AGM") return "EV12VAGM";
  return trimmed.replace(/\s+/g, "");
}

/** 별칭·브랜드코드·GB57820 등 → canonical (없으면 undefined) */
export function getCanonicalBatteryCode(input: string): string | undefined {
  const key = normalizeBatteryCode(input);
  if (!key) return undefined;
  const hit = aliasToCanonical.get(key);
  if (hit) return hit;
  if (batteryAliasMap[key]) return key;
  return undefined;
}

function buildImageSetFromFolder(folder: string): BatteryImageSet | undefined {
  const files = FOLDER_IMAGE_FILES[folder];
  if (!files?.main) return undefined;
  const base = `${ASSET_BASE}/${folder}`;
  const set: BatteryImageSet = { main: `${base}/${files.main}` };
  if (files.productBox) set.productBox = `${base}/${files.productBox}`;
  if (files.boxFront) set.boxFront = `${base}/${files.boxFront}`;
  if (files.boxAngle) set.boxAngle = `${base}/${files.boxAngle}`;
  if (files.productBoxAngle) set.productBoxAngle = `${base}/${files.productBoxAngle}`;
  if (files.labelTop) set.labelTop = `${base}/${files.labelTop}`;
  if (files.frontLabel) set.frontLabel = `${base}/${files.frontLabel}`;
  return set;
}

function hasImageFolder(canonical: string, brandKey: BatteryBrandKey): boolean {
  const spec = batteryAliasMap[canonical];
  return Boolean(spec?.imageFolderByBrand[brandKey]);
}

function sortAliasesForBrand(aliases: string[], brandKey: BatteryBrandKey): string[] {
  const prefer = (a: string) => {
    const u = a.toUpperCase();
    if (brandKey === "solite") {
      if (u.includes("CMF")) return 0;
      if (u.startsWith("AGM")) return 1;
      if (u.startsWith("GB")) return 2;
      return 3;
    }
    if (u.startsWith("GB")) return 0;
    if (u.startsWith("AGM")) return 1;
    if (u.includes("CMF")) return 2;
    return 3;
  };
  return [...aliases].sort((a, b) => prefer(a) - prefer(b));
}

/** exact → normalized family → alias map → 브랜드별 상품 canonical */
export function findBatteryProductByCode(
  code: string,
  brandKey: BatteryBrandKey = "rocket",
): string | undefined {
  const exact = getCanonicalBatteryCode(code);
  if (exact && hasImageFolder(exact, brandKey)) return exact;

  const family = normalizeBatteryFamily(code);
  const aliases = sortAliasesForBrand(getBatteryAliases(family), brandKey);
  for (const alias of aliases) {
    const canonical = getCanonicalBatteryCode(alias);
    if (canonical && hasImageFolder(canonical, brandKey)) return canonical;
  }

  const fallbackBrands: BatteryBrandKey[] =
    brandKey === "rocket" ? ["solite", "rocket"] : ["rocket", "solite"];
  for (const bk of fallbackBrands) {
    for (const alias of aliases) {
      const canonical = getCanonicalBatteryCode(alias);
      if (canonical && hasImageFolder(canonical, bk)) return canonical;
    }
  }

  return exact;
}

/**
 * canonical + 브랜드 imageFolder 기준 imageSet.
 * rocket 외 브랜드는 imageFolder 없으면 undefined → gradient fallback.
 */
export type GetBatteryImageSetOptions = {
  /** true면 다른 브랜드 폴더로 대체하지 않음 (메인 라인업) */
  strictBrand?: boolean;
};

export function getBatteryImageSet(
  code: string,
  brandKey: BatteryBrandKey = "rocket",
  options?: GetBatteryImageSetOptions,
): BatteryImageSet | undefined {
  const canonical = findBatteryProductByCode(code, brandKey) ?? getCanonicalBatteryCode(code);
  if (!canonical) return undefined;
  const spec = batteryAliasMap[canonical];
  if (!spec) return undefined;
  const folder = spec.imageFolderByBrand[brandKey];
  if (!folder) {
    if (options?.strictBrand) return undefined;
    const altBrand: BatteryBrandKey = brandKey === "rocket" ? "solite" : "rocket";
    const altFolder = spec.imageFolderByBrand[altBrand];
    if (altFolder) return buildImageSetFromFolder(altFolder);
    return undefined;
  }
  return buildImageSetFromFolder(folder);
}

/** 메인 라인업 — 해당 브랜드 전용 이미지 asset 존재 여부 */
export function hasStrictBrandProductImage(
  code: string,
  brandKey: BatteryBrandKey,
): boolean {
  return Boolean(getBatteryImageSet(code, brandKey, { strictBrand: true })?.main);
}

export type BatteryDisplaySpec = BatterySpecEntry & {
  displayCode: string;
  rocketImageFolder?: string;
  rocketBrandCode?: string;
};

export type BatteryBrandBadge = {
  key: string;
  text: string;
  tone: "rocket" | "solite" | "delkor" | "neutral" | "meta";
};

const BRAND_DISPLAY_NAMES: Record<BatteryBrandKey, string> = {
  rocket: "로케트",
  solite: "쏠라이트",
  delkor: "델코",
  delco: "델코",
  varta: "바르타",
  atk: "한국AT",
};

const BRAND_BADGE_ORDER: BatteryBrandKey[] = ["rocket", "solite", "delkor", "delco", "varta", "atk"];

function badgeToneForBrand(brandKey: BatteryBrandKey): BatteryBrandBadge["tone"] {
  if (brandKey === "rocket") return "rocket";
  if (brandKey === "solite") return "solite";
  if (brandKey === "delkor" || brandKey === "delco") return "delkor";
  return "neutral";
}

function findAgmLnAlias(spec: BatterySpecEntry): string | undefined {
  return (
    spec.aliases.find((a) => /^AGM\s*LN\d$/i.test(a)) ??
    spec.aliases.find((a) => /^LN\d$/i.test(a)) ??
    spec.brandCodes.solite?.find((c) => /LN/i.test(c))
  );
}

function findDinCrossAlias(spec: BatterySpecEntry, canonical: string): string | undefined {
  const canonNum = parseInt(canonical.match(/\d+/)?.[0] ?? "0", 10);
  const brandNorms = new Set(
    Object.values(spec.brandCodes)
      .flat()
      .filter(Boolean)
      .map((c) => normalizeBatteryCode(c)),
  );
  return spec.aliases.find((a) => {
    if (!/^DIN\d/i.test(a) || normalizeBatteryCode(a) === normalizeBatteryCode(canonical)) return false;
    if (brandNorms.has(normalizeBatteryCode(a))) return false;
    const altNum = parseInt(a.match(/\d+/)?.[0] ?? "0", 10);
    return altNum > 0 && altNum !== canonNum && altNum < canonNum;
  });
}

/** 카드·검색·비교용 브랜드별 표기 뱃지 (로케트 우선) */
export function getBatteryBrandBadges(code: string): BatteryBrandBadge[] {
  const canonical = getCanonicalBatteryCode(code);
  if (!canonical) return [];
  const spec = batteryAliasMap[canonical];
  if (!spec) return [{ key: "std", text: canonical, tone: "neutral" }];

  const badges: BatteryBrandBadge[] = [];
  const used = new Set<string>();

  const push = (key: string, text: string, tone: BatteryBrandBadge["tone"]) => {
    const id = normalizeBatteryCode(text.replace(/^(로케트|쏠라이트|델코|바르타|한국AT|표준)\s*/, ""));
    if (used.has(text) || used.has(id)) return;
    used.add(text);
    used.add(id);
    badges.push({ key, text, tone });
  };

  const rocketCode = spec.brandCodes.rocket?.[0];

  for (const brandKey of BRAND_BADGE_ORDER) {
    const primary = spec.brandCodes[brandKey]?.[0];
    if (!primary) continue;
    if (brandKey === "solite" && rocketCode && normalizeBatteryCode(primary) === normalizeBatteryCode(rocketCode)) {
      continue;
    }
    push(brandKey, `${BRAND_DISPLAY_NAMES[brandKey]} ${primary}`, badgeToneForBrand(brandKey));
  }

  if (spec.type === "AGM") {
    const ln = findAgmLnAlias(spec);
    if (ln) push("ln", ln, "meta");
    if (spec.capacityAh) push("ah", `${spec.capacityAh}Ah`, "meta");
  } else if (spec.type === "DIN" || spec.type === "GB") {
    const cross = findDinCrossAlias(spec, canonical);
    push("std", cross ?? canonical, "neutral");
  }

  return badges;
}

/** UI·가이드용 canonical 규격 정보 */
export function getBatteryDisplaySpec(code: string): BatteryDisplaySpec | undefined {
  const canonical = getCanonicalBatteryCode(code);
  if (!canonical) return undefined;
  const spec = batteryAliasMap[canonical];
  if (!spec) return undefined;
  return {
    ...spec,
    displayCode: canonical,
    rocketImageFolder: spec.imageFolderByBrand.rocket,
    rocketBrandCode: spec.brandCodes.rocket?.[0],
  };
}

export function hasRocketBatteryAssets(code: string): boolean {
  return getBatteryImageSet(code, "rocket") != null;
}

export function hasSoliteBatteryAssets(code: string): boolean {
  return getBatteryImageSet(code, "solite") != null;
}

export function hasBatteryAssets(code: string, brandKey: BatteryBrandKey): boolean {
  return getBatteryImageSet(code, brandKey) != null;
}

/** 브랜드 우선 imageSet — 같은 family alias로 다른 브랜드 이미지 fallback 허용 */
export function resolveBatteryImageSet(
  code: string,
  brandKey: BatteryBrandKey = "rocket",
): BatteryImageSet | undefined {
  return getBatteryImageSet(code, brandKey);
}

export const ROCKET_BATTERY_FOLDERS = Object.keys(FOLDER_IMAGE_FILES).filter((f) => !f.startsWith("CMF"));

export const SOLITE_BATTERY_FOLDERS = Object.keys(FOLDER_IMAGE_FILES).filter((f) =>
  f.startsWith("CMF"),
);

/** 메인 라인업 — strict 브랜드 이미지가 있는 asset 폴더만 */
export function getStrictHomeLineupFolders(brandKey: BatteryBrandKey): string[] {
  const candidates =
    brandKey === "rocket" ? ROCKET_BATTERY_FOLDERS : SOLITE_BATTERY_FOLDERS;
  return candidates.filter((folder) => hasStrictBrandProductImage(folder, brandKey));
}

export const EMPTY_BATTERY_IMAGE_SET: BatteryImageSet = { main: "" };

export const AGM60L_IMAGE_SET = getBatteryImageSet("AGM60L", "rocket")!;
export const AGM70L_IMAGE_SET = getBatteryImageSet("AGM70L", "rocket")!;
