import { getHomeCardCopy } from "@/data/battery/batterySpecIndex";
import {
  batteryAliasMap,
  getStrictHomeLineupFolders,
  type BatteryBrandKey,
  type BatterySpecEntry,
} from "@/lib/battery-alias-map";
import { getSearchHref } from "@/lib/battery-search";
import { batteryDetailHref } from "@/lib/home-upgrade-v2-data";
import { HUB_PHOTO, HUB_SHOP_ANCHORS, HUB_STORE_ANCHORS, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { HUB_ORDER_CHECKLIST } from "@/lib/platform-hub-routes";

export type HomeCatalogBrandId = "rocket" | "solite";

export type HomeProductTypeFilter = "전체" | "AGM" | "일반형" | "DIN" | "EV 보조 12V";

export type HomeProductTypeTag = "AGM" | "일반형" | "DIN" | "EV 보조 12V";

/** 메인 라인업 카드 — 표시명·이미지·검색 연결 분리 */
export type HomeCatalogProduct = {
  id: string;
  displayName: string;
  searchCode: string;
  imageKey: string;
  typeTag: HomeProductTypeTag;
  summary: string;
  specAliases?: readonly string[];
};

export const HOME_MAIN_SEARCH_PLACEHOLDER = "차량명 또는 배터리 규격으로 바로 확인";

export const HOME_MAIN_SEARCH_EXAMPLES = [
  { label: "쏘렌토 MQ4", href: getSearchHref("쏘렌토 MQ4") },
  { label: "AGM70L", href: getSearchHref("AGM70L") },
  { label: "포터2 100R", href: getSearchHref("포터2 100R") },
  { label: "스타리아 AGM80R", href: getSearchHref("스타리아 CMF80L") },
] as const;

export const HOME_MAIN_AUX_LINKS = [
  { label: "사진으로 확인하기", href: HUB_PHOTO },
  { label: "주문 전 체크리스트", href: HUB_ORDER_CHECKLIST },
  { label: "EV/하이브리드 보조배터리 안내", href: "/guides/knowledge/bk-ev-aux-12v" },
] as const;

export const HOME_CATALOG_TYPE_FILTERS: HomeProductTypeFilter[] = [
  "전체",
  "AGM",
  "일반형",
  "DIN",
  "EV 보조 12V",
];

const ROCKET_FOLDER_ORDER = [
  "AGM60L",
  "AGM70L",
  "AGM80L",
  "AGM95L",
  "AGM95R",
  "AGM105L",
  "GB40AL",
  "GB50L",
  "GB60AL",
  "GB60R",
  "GB80L",
  "GB80R",
  "GB90L",
  "GB90R",
  "GB95R",
  "GB100L",
  "GB100R",
  "GB55066",
  "GB56219",
  "GB57219",
  "GB57820",
  "GB58014",
  "GB59042",
  "GB60044",
] as const;

const SOLITE_FOLDER_ORDER = [
  "CMF57412",
  "CMF54459",
  "CMF56219",
  "CMF80L",
  "CMF80R",
  "CMF60L",
  "CMF40L",
  "CMF90L",
  "CMF90R",
  "CMF100L",
  "CMF100R",
] as const;

const ROCKET_SUMMARY: Partial<Record<string, string>> = {
  GB80L: "로케트 GB80L — 일반 충전제어 차량에서 많이 쓰이는 80Ah급 L타입 배터리입니다.",
  GB57820: "로케트 GB57820 — DIN H6 / DIN74L 계열 표기입니다.",
  GB56219: "로케트 GB56219 — DIN62L / DIN60L 계열 표기입니다.",
  GB55066: "로케트 GB55066 — 소형 DIN / DIN50L 계열 표기입니다.",
  GB90R: "로케트 GB90R — 일반형 R타입 규격입니다.",
  GB100R: "로케트 GB100R — 일반형 R타입 규격입니다.",
};

const SOLITE_SUMMARY: Partial<Record<string, string>> = {
  CMF57412: "쏠라이트 CMF57412 — DIN H6 / DIN74L 계열 표기입니다.",
  CMF54459: "쏠라이트 CMF54459 — 소형 DIN 계열에서 함께 확인되는 표기입니다.",
  CMF80L: "쏠라이트 CMF80L — 일반 충전계통 중대형 L타입 규격입니다.",
  CMF56219: "쏠라이트 CMF56219 — DIN62L / DIN60L 계열 표기입니다.",
};

function catalogProduct(
  id: string,
  displayName: string,
  searchCode: string,
  typeTag: HomeProductTypeTag,
  opts?: {
    imageKey?: string;
    summary?: string;
    specAliases?: readonly string[];
  },
): HomeCatalogProduct {
  const imageKey = opts?.imageKey ?? displayName;
  return {
    id,
    displayName,
    searchCode,
    imageKey,
    typeTag,
    specAliases: opts?.specAliases,
    summary:
      opts?.summary ??
      getHomeCardCopy(searchCode) ??
      `${displayName} 규격 — 차종·라벨과 함께 확인하세요.`,
  };
}

function specTypeToHomeTag(type: BatterySpecEntry["type"]): HomeProductTypeTag {
  if (type === "AGM") return "AGM";
  if (type === "DIN") return "DIN";
  return "일반형";
}

function findPrimarySpecForFolder(
  brandKey: BatteryBrandKey,
  folder: string,
): { canonical: string; spec: BatterySpecEntry } | undefined {
  let hit: { canonical: string; spec: BatterySpecEntry } | undefined;
  for (const [canonical, spec] of Object.entries(batteryAliasMap)) {
    if (spec.imageFolderByBrand[brandKey] !== folder) continue;
    if (canonical === folder) return { canonical, spec };
    if (!hit) hit = { canonical, spec };
  }
  return hit;
}

function sortFolders(folders: string[], order: readonly string[]): string[] {
  return [...folders].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function rocketDisplayName(folder: string): string | null {
  if (folder.startsWith("CMF")) return null;
  if (folder.startsWith("GB") || folder.startsWith("AGM")) return folder;
  return folder;
}

function soliteDisplayName(folder: string): string | null {
  if (folder.startsWith("GB")) return null;
  if (folder.startsWith("CMF")) return folder;
  return folder;
}

function buildLineupFromAssetFolders(
  brand: HomeCatalogBrandId,
  folders: string[],
  order: readonly string[],
): HomeCatalogProduct[] {
  const brandKey = brand === "rocket" ? "rocket" : "solite";
  const nameFor =
    brand === "rocket" ? rocketDisplayName : soliteDisplayName;
  const summaryMap = brand === "rocket" ? ROCKET_SUMMARY : SOLITE_SUMMARY;
  const brandLabel = brand === "rocket" ? "로케트" : "쏠라이트";

  return sortFolders(folders, order)
    .map((folder) => {
      const displayName = nameFor(folder);
      if (!displayName) return null;
      const meta = findPrimarySpecForFolder(brandKey, folder);
      const searchCode = meta?.canonical ?? folder;
      const typeTag = meta ? specTypeToHomeTag(meta.spec.type) : "일반형";
      return catalogProduct(
        `${brand}-${folder.toLowerCase()}`,
        displayName,
        searchCode,
        typeTag,
        {
          imageKey: folder,
          specAliases: meta?.spec.aliases,
          summary:
            summaryMap[folder] ??
            `${brandLabel} ${displayName} — 차종·라벨과 함께 확인하세요.`,
        },
      );
    })
    .filter((p): p is HomeCatalogProduct => p !== null);
}

const SOLITE_LINEUP_PLACEHOLDER: HomeCatalogProduct[] = [
  catalogProduct("solite-eagm60", "eAGM60", "eAGM60", "EV 보조 12V", {
    imageKey: "eAGM60",
    specAliases: ["eAGM60", "AGM60L", "AGM LN2"],
    summary: "쏠라이트 EV 보조 12V(eAGM60) — 차종·라벨로 최종 확인하세요.",
  }),
  catalogProduct("solite-ev12v", "EV 12V", "EV 12V", "EV 보조 12V", {
    imageKey: "EV 12V",
    specAliases: ["EV 12V", "EV12V"],
    summary: "전기차 보조 12V — 고전압 메인 배터리와 별도입니다.",
  }),
];

export const rocketLineup: HomeCatalogProduct[] = buildLineupFromAssetFolders(
  "rocket",
  getStrictHomeLineupFolders("rocket"),
  ROCKET_FOLDER_ORDER,
);

export const soliteLineup: HomeCatalogProduct[] = [
  ...buildLineupFromAssetFolders(
    "solite",
    getStrictHomeLineupFolders("solite"),
    SOLITE_FOLDER_ORDER,
  ),
  ...SOLITE_LINEUP_PLACEHOLDER,
];

export const HOME_CATALOG_BY_BRAND: Record<HomeCatalogBrandId, HomeCatalogProduct[]> = {
  rocket: rocketLineup,
  solite: soliteLineup,
};

export const HOME_CATALOG_BRAND_KEY: Record<HomeCatalogBrandId, BatteryBrandKey> = {
  rocket: "rocket",
  solite: "solite",
};

export function getCurrentLineup(brand: HomeCatalogBrandId): HomeCatalogProduct[] {
  return HOME_CATALOG_BY_BRAND[brand];
}

export function filterCatalogProducts(
  products: HomeCatalogProduct[],
  typeFilter: HomeProductTypeFilter,
): HomeCatalogProduct[] {
  if (typeFilter === "전체") return products;
  return products.filter((p) => p.typeTag === typeFilter);
}

export const HOME_SPEC_CARD_ACTIONS = {
  fitCheck: (code: string) => getSearchHref(code),
  photo: HUB_PHOTO,
  outbound: HUB_STORE_ANCHORS.regions,
  store: HUB_STORE_ANCHORS.visit,
  delivery: HUB_SHOP_ANCHORS.delivery,
  detail: (code: string) => batteryDetailHref(code),
} as const;

/** 카드 상단 보조 CTA 2개 — 매장·출장 / 택배주문 */
export function homeSpecCardSecondaryCtas(code: string) {
  return [
    { key: "store", label: "매장·출장 안내", href: HUB_STORE_DETAIL },
    {
      key: "delivery",
      label: "택배주문",
      href: `${HOME_SPEC_CARD_ACTIONS.detail(code)}#battery-order`,
    },
  ] as const;
}

export function homeSpecCardDetailHref(code: string) {
  return HOME_SPEC_CARD_ACTIONS.detail(code);
}
