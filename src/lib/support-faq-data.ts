export type FaqCategory = "전체" | "규격" | "주문" | "출장" | "증상";

export type SupportFaqItem = {
  id: string;
  category: Exclude<FaqCategory, "전체">;
  question: string;
  answer: string;
  guideHref?: string;
};

export const SUPPORT_FAQ_CATEGORIES: FaqCategory[] = [
  "전체",
  "규격",
  "주문",
  "출장",
  "증상",
];

export const SUPPORT_FAQ_ITEMS: SupportFaqItem[] = [
  {
    id: "faq-spec-check",
    category: "규격",
    question: "배터리 규격은 어떻게 확인하나요?",
    answer:
      "차량명·연식으로 검색하거나 배터리 라벨의 규격명을 입력하세요. 헷갈릴 때는 사진 확인을 보조로 이용하세요.",
    guideHref: "/guides",
  },
  {
    id: "faq-agm",
    category: "규격",
    question: "AGM과 일반 배터리는 무엇이 다른가요?",
    answer: "AGM은 스마트충전·ISG 차량 등에 쓰이며 충전 방식이 다를 수 있습니다. 일반형과 혼용 주문은 피하세요.",
    guideHref: "/guides",
  },
  {
    id: "faq-din",
    category: "규격",
    question: "DIN 규격은 무엇인가요?",
    answer: "유럽식 표준 규격명입니다. DIN62L, DIN74L 등 차종·연식별로 다릅니다.",
    guideHref: "/guides",
  },
  {
    id: "faq-lr",
    category: "규격",
    question: "L/R 단자 방향은 어떻게 구분하나요?",
    answer: "단자(+) 위치가 운전석 기준 왼쪽이 L, 오른쪽이 R입니다. 라벨·사진으로 확인하세요.",
    guideHref: "/guides/knowledge/bk-lr-from-name",
  },
  {
    id: "faq-porter",
    category: "규격",
    question: "포터2는 왜 90R과 100R이 나뉘나요?",
    answer: "연식·차량 조건에 따라 규격이 다릅니다. AGM95L과 100R은 서로 다른 규격이므로 대체하지 마세요.",
    guideHref: "/guides/porter2-year-battery-guide",
  },
  {
    id: "faq-return",
    category: "주문",
    question: "폐배터리 반납과 미반납은 어떤 차이가 있나요?",
    answer: "반납은 기존 배터리 회수 조건, 미반납은 반납 없이 구매하는 조건입니다. 상담 시 안내드립니다.",
  },
  {
    id: "faq-order-mistake",
    category: "주문",
    question: "택배 주문 시 오주문을 줄이려면 무엇을 확인해야 하나요?",
    answer: "규격명·L/R·연식·ISG·반납 여부를 체크리스트로 확인하세요.",
    guideHref: "/order-checklist",
  },
  {
    id: "faq-outbound",
    category: "출장",
    question: "출장 교체 가능 지역은 어떻게 확인하나요?",
    answer: "동네명을 입력하거나 매장·출장 안내 지도에서 덕천점·학장점 권역을 확인하세요.",
    guideHref: "/service-center",
  },
  {
    id: "faq-blackbox",
    category: "증상",
    question: "블랙박스 때문에 배터리가 방전될 수 있나요?",
    answer: "장시간 주차·약전압 상태에서 방전이 잦을 수 있습니다. 증상진단과 가이드를 참고하세요.",
    guideHref: "/symptoms",
  },
  {
    id: "faq-ev12",
    category: "규격",
    question: "EV 보조 12V 배터리는 일반 배터리와 다른가요?",
    answer: "전기차 보조 12V는 별도 규격입니다. 일반 승용 규격과 혼동하지 마세요.",
    guideHref: "/guides/knowledge/bk-ev-aux-12v",
  },
];
