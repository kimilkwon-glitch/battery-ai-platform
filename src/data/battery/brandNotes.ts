import type { BrandNote } from "./types";

export const BRAND_SECTION_TITLE = "브랜드보다 먼저 봐야 할 것은 규격입니다";

export const BRAND_SECTION_LEAD =
  "로케트·쏠라이트·델코·아트라스BX는 선택지일 뿐입니다. 차량 장착 규격·단자·트레이 조건이 우선입니다.";

export const BRAND_NOTES: BrandNote[] = [
  {
    id: "rocket",
    displayName: "로케트",
    positioning:
      "국내 교체 시장에서 많이 접하는 브랜드이며, 일반·상용·AGM 등 다양한 규격 선택지가 있습니다.",
    checkReminder: "같은 AGM80L이라도 브랜드별 CCA·치수는 확인이 필요할 수 있습니다.",
  },
  {
    id: "solite",
    displayName: "쏠라이트",
    positioning:
      "국산차 교체 수요에서 익숙한 브랜드로, CMF·DIN 품번(57412·57820 등)으로도 표기됩니다.",
    checkReminder: "품번과 표준 규격(DIN74L 등) 매핑을 함께 확인하세요.",
  },
  {
    id: "delco",
    displayName: "델코",
    positioning:
      "AGM·수입차·ISG 관련 수요에서 자주 언급되며, 차량별 순정 규격 확인이 중요합니다.",
    checkReminder: "BMS·IBS 등록 필요 여부를 차종과 함께 봅니다.",
  },
  {
    id: "atlasbx",
    displayName: "아트라스BX",
    positioning:
      "국내에서 오래 사용된 배터리 브랜드 중 하나로, 일반 승용·상용 규격에서 접할 수 있습니다.",
    checkReminder: "브랜드보다 라벨 규격 코드·L/R·장착 사진이 우선입니다.",
  },
];
