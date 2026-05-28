import { ROCKET_SPECS } from "./brands/rocket-specs";
import { DELKOR_SPECS } from "./brands/delkor-specs";
import { ATLAS_SPECS } from "./brands/atlas-specs";
import { SOLITE_SPECS } from "./brands/solite-specs";

/** 4브랜드 배터리 제원 DB — 검색 매칭과 분리, 상세·비교·카드·가이드용 */
export const BATTERY_SPECS_BY_BRAND = [
  ...ROCKET_SPECS,
  ...DELKOR_SPECS,
  ...ATLAS_SPECS,
  ...SOLITE_SPECS,
];

export { ROCKET_SPECS, DELKOR_SPECS, ATLAS_SPECS, SOLITE_SPECS };
