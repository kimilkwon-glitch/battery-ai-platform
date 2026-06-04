/** 브랜드 안내 하단 — 참고 브랜드(고객 UI 미판매 탭) */
export type ReferenceBrandCard = {
  id: string;
  title: string;
  headline: string;
  description: string;
  advantageBullets: string[];
  fieldComment: string;
};

export const BRAND_HUB_REFERENCE_BRANDS: ReferenceBrandCard[] = [
  {
    id: "delco",
    title: "델코",
    headline: "DIN·AGM 계열 상담에서 함께 비교하기 좋은 브랜드",
    description:
      "델코는 DIN과 AGM 계열 교체 상담에서 자주 비교되는 브랜드입니다. 수입차와 국산차 일부 차종에서 규격명 기준으로 확인하기 쉬워, 장착 공간과 단자 방향을 함께 안내하기 좋습니다.",
    advantageBullets: [
      "DIN·AGM 계열 비교에 적합",
      "규격명 기준 확인이 수월함",
      "장착 공간·단자 안내와 연계하기 좋음",
    ],
    fieldComment:
      "수입차·국산 일부 차종에서 순정 규격과 나란히 비교해 설명하기 편한 편입니다.",
  },
  {
    id: "atlas",
    title: "아트라스BX",
    headline: "기본 교체부터 대용량 규격까지 폭넓게 비교 가능한 브랜드",
    description:
      "아트라스는 일반형 배터리부터 대용량 규격까지 폭넓게 비교할 수 있어, 상용차나 SUV 교체 상담에서도 함께 검토하기 좋습니다. 동일 규격 내 가격대와 브랜드 선택지를 넓히는 용도로 활용하기 좋습니다.",
    advantageBullets: [
      "일반형부터 대용량까지 비교 가능",
      "상용·SUV 상담에서 함께 검토",
      "가격대·브랜드 선택지 확장에 유용",
    ],
    fieldComment:
      "동일 규격 안에서 브랜드 옵션을 넓혀 설명할 때 비교용으로 쓰기 좋습니다.",
  },
];
