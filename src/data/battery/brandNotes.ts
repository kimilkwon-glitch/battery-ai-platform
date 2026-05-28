import type { BrandNote } from "./types";

export const BRAND_SECTION_TITLE = "브랜드보다 먼저 봐야 할 것은 규격입니다";

export const BRAND_SECTION_LEAD =
  "로케트·델코·아트라스BX·쏠라이트는 선택지일 뿐입니다. 차량 장착 규격·단자·트레이 조건이 우선입니다.";

export const BRAND_NOTES: BrandNote[] = [
  {
    id: "rocket",
    displayName: "로케트",
    positioning:
      "국내 교체 시장에서 많이 접하는 브랜드이며, 일반·상용·AGM 등 규격 선택지가 넓은 편입니다.",
    checkReminder: "같은 AGM80L이라도 브랜드별 CCA·치수는 제원표·라벨로 확인하세요.",
  },
  {
    id: "delkor",
    displayName: "델코",
    positioning:
      "AGM·DIN·일반 계열에서 제원 표기가 비교적 명확하며, 브랜드별 CCA 차이 확인에 유용합니다.",
    checkReminder: "ISG·수입차는 순정 규격·BMS 등록 여부를 차종과 함께 봅니다.",
  },
  {
    id: "atlasbx",
    displayName: "아트라스BX",
    positioning:
      "국내에서 오래 사용된 브랜드 중 하나로, 일반·DIN·AGM 규격에서 폭넓게 확인됩니다.",
    checkReminder: "MF·AGM 품번(57412·58020 등)과 표준 규격명을 함께 보세요.",
  },
  {
    id: "solite",
    displayName: "쏠라이트",
    positioning:
      "국산차 교체 수요에서 익숙한 브랜드로, 일반 CMF와 AGM 계열이 함께 사용됩니다.",
    checkReminder: "CMF 품번(57412·58014 등)은 DIN·Ah 계열과 매핑해 확인하세요.",
  },
];
