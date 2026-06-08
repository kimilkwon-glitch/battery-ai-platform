import {
  CUSTOMER_CENTER_DELIVERY,
  CUSTOMER_CENTER_FAQ,
  CUSTOMER_CENTER_HUB,
  CUSTOMER_CENTER_MESSAGE_GUIDE,
  CUSTOMER_CENTER_ORDER_GUIDE,
  CUSTOMER_CENTER_RETURN_EXCHANGE,
  CUSTOMER_CENTER_USED_BATTERY,
} from "@/lib/customer-center-routes";

export type GuideSectionBlock = {
  heading: string;
  /** 페이지 내 앵커 (예: guest-order) */
  anchorId?: string;
  /** 무통장 48시간 정책 전용 UI 블록 */
  variant?: "bank-transfer-policy" | "used-battery-precheck";
  paragraphs?: string[];
  bullets?: string[];
  callout?: string;
  cta?: { label: string; href: string };
};

export type CustomerGuidePageData = {
  slug: string;
  title: string;
  description: string;
  intro?: string;
  sections: GuideSectionBlock[];
};

export const CUSTOMER_CENTER_HUB_COPY = {
  headline: "고객센터",
  subline: "주문, 배송, 교환·반품, 배터리 문의를 한곳에서 확인하세요.",
} as const;

export type CustomerCenterHeroAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type CustomerCenterHeroCard = {
  id: string;
  title: string;
  description: string;
  actions: CustomerCenterHeroAction[];
};

/** 상단 핵심 CTA 3개 */
export const CUSTOMER_CENTER_HERO_CARDS: CustomerCenterHeroCard[] = [
  {
    id: "lookup",
    title: "주문내역 조회",
    description: "로그인 후 주문·배송·장착 진행상태를 확인할 수 있습니다.",
    actions: [
      { label: "로그인하고 주문내역 보기", href: "/login?redirect=%2Fmypage", variant: "primary" },
      { label: "배송 안내", href: CUSTOMER_CENTER_DELIVERY, variant: "secondary" },
    ],
  },
  {
    id: "delivery-return",
    title: "배송·반납 안내",
    description: "택배 배송, 폐배터리 반납, 포장 주의사항을 확인하세요.",
    actions: [
      { label: "배송 안내", href: CUSTOMER_CENTER_DELIVERY, variant: "primary" },
      { label: "폐배터리 반납 안내", href: CUSTOMER_CENTER_USED_BATTERY, variant: "secondary" },
    ],
  },
  {
    id: "contact",
    title: "전화 상담 / 매장 안내",
    description: "장착 가능 여부나 규격이 애매하면 가까운 지점으로 문의하세요.",
    actions: [
      { label: "매장·출장 안내", href: "/service-center", variant: "primary" },
      { label: "배터리 점검 문의", href: "/support?tab=inquiry", variant: "secondary" },
    ],
  },
];

export type CustomerCenterDetailLink = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export type CustomerCenterDetailGroup = {
  id: string;
  title: string;
  items: CustomerCenterDetailLink[];
};

/** 상세 안내 — 그룹별 compact 카드 */
export const CUSTOMER_CENTER_DETAIL_GROUPS: CustomerCenterDetailGroup[] = [
  {
    id: "order",
    title: "주문 관련",
    items: [
      {
        id: "order-guide",
        title: "주문/결제 안내",
        description: "규격·폐전지 옵션·결제 방법을 주문 전에 확인",
        href: CUSTOMER_CENTER_ORDER_GUIDE,
      },
      {
        id: "mypage-orders",
        title: "주문내역 조회",
        description: "로그인 후 마이페이지에서 주문·배송 상태 확인",
        href: "/mypage",
      },
      {
        id: "message-guide",
        title: "주문 후 안내 메시지",
        description: "주문·입금·배송 단계별 안내 문구 예시",
        href: CUSTOMER_CENTER_MESSAGE_GUIDE,
      },
      {
        id: "bank-transfer",
        title: "무통장 입금 안내",
        description: "입금 기한·자동 취소·입금자명 확인",
        href: `${CUSTOMER_CENTER_ORDER_GUIDE}#bank-transfer`,
      },
    ],
  },
  {
    id: "delivery",
    title: "배송·반납",
    items: [
      {
        id: "delivery",
        title: "배송 안내",
        description: "배송기간, 운송장, 미수령 시 확인",
        href: CUSTOMER_CENTER_DELIVERY,
      },
      {
        id: "used-battery",
        title: "폐전지 반납 안내",
        description: "반납/미반납, 회수 절차, 미반납 비용",
        href: CUSTOMER_CENTER_USED_BATTERY,
      },
      {
        id: "packing",
        title: "포장 주의사항",
        description: "배터리·폐전지 발송 시 포장 방법",
        href: CUSTOMER_CENTER_USED_BATTERY,
      },
    ],
  },
  {
    id: "exchange",
    title: "교환·AS",
    items: [
      {
        id: "return-exchange",
        title: "교환/반품 안내",
        description: "맞교환 제한, 개봉·장착 후 처리 기준",
        href: CUSTOMER_CENTER_RETURN_EXCHANGE,
      },
      {
        id: "warranty",
        title: "제품 보증/AS 안내",
        description: "보증 범위·교환·상담 절차",
        href: "/guides?cat=as",
      },
      {
        id: "re-drain",
        title: "장착 후 재방전 안내",
        description: "교체 후 재방전 시 차량·배터리 점검 포인트",
        href: "/guides?cat=as",
      },
    ],
  },
  {
    id: "faq",
    title: "자주 묻는 질문",
    items: [
      {
        id: "faq",
        title: "자주 묻는 질문",
        description: "주문·배송·반품·폐전지·결제 FAQ",
        href: CUSTOMER_CENTER_FAQ,
      },
      {
        id: "spec",
        title: "배터리 규격 확인",
        description: "차종·연식·규격 검색과 사진 확인",
        href: "/guide/spec",
      },
      {
        id: "agm-diff",
        title: "AGM / 일반 배터리 차이",
        description: "AGM·DIN·일반형 선택 시 참고",
        href: "/guides/knowledge/bk-agm-vs-din",
      },
    ],
  },
];

export const CUSTOMER_CENTER_QUICK_LINKS: { label: string; href: string }[] = [
  { label: "주문 안내", href: CUSTOMER_CENTER_ORDER_GUIDE },
  { label: "배송 안내", href: CUSTOMER_CENTER_DELIVERY },
  { label: "교환·반품", href: CUSTOMER_CENTER_RETURN_EXCHANGE },
  { label: "마이페이지", href: "/mypage" },
  { label: "FAQ", href: CUSTOMER_CENTER_FAQ },
];

export type CustomerHubCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

export const CUSTOMER_CENTER_HUB_CARDS: CustomerHubCard[] = [
  {
    id: "order-guide",
    title: "주문/결제 안내",
    description: "주문 전 규격·폐전지 옵션·무통장 입금까지 한 번에 확인",
    href: CUSTOMER_CENTER_ORDER_GUIDE,
    cta: "주문 안내 보기",
  },
  {
    id: "delivery",
    title: "배송 안내",
    description: "택배 배송기간, 운송장 지연, 미수령 시 확인 방법",
    href: CUSTOMER_CENTER_DELIVERY,
    cta: "배송 안내 보기",
  },
  {
    id: "used-battery",
    title: "폐전지 반납 안내",
    description: "반납/미반납 가격 차이, 회수 절차, 포장 주의",
    href: CUSTOMER_CENTER_USED_BATTERY,
    cta: "폐전지 반납 안내 보기",
  },
  {
    id: "return-exchange",
    title: "교환/반품 안내",
    description: "맞교환 제한, 개봉·장착 후 처리, 오배송·불량 확인",
    href: CUSTOMER_CENTER_RETURN_EXCHANGE,
    cta: "교환/반품 안내 보기",
  },
  {
    id: "consultation-lookup",
    title: "마이페이지",
    description: "로그인 후 주문내역, 차량정보, 혜택을 확인합니다.",
    href: "/mypage",
    cta: "마이페이지로 이동",
  },
  {
    id: "mypage-orders",
    title: "주문내역 조회",
    description: "로그인 후 마이페이지에서 결제 주문·배송 상태 확인",
    href: "/mypage",
    cta: "마이페이지로 이동",
  },
  {
    id: "faq",
    title: "자주 묻는 질문 FAQ",
    description: "주문·배송·반품·폐전지·결제 등 자주 묻는 질문",
    href: CUSTOMER_CENTER_FAQ,
    cta: "FAQ 보기",
  },
  {
    id: "message-guide",
    title: "주문 후 안내 메시지",
    description: "주문·입금·배송·폐전지 단계별 문자/알림톡 문구 예시",
    href: CUSTOMER_CENTER_MESSAGE_GUIDE,
    cta: "안내 메시지 보기",
  },
  {
    id: "bank-transfer",
    title: "무통장 입금 48시간",
    description: "입금 기한·자동 취소 정책·주문 완료 화면 예시",
    href: `${CUSTOMER_CENTER_ORDER_GUIDE}#bank-transfer`,
    cta: "무통장 입금 안내",
  },
];

export const ORDER_GUIDE_PAGE: CustomerGuidePageData = {
  slug: "order-guide",
  title: "배터리 주문 전후 확인 안내",
  description:
    "차량 규격, 폐전지 반납, 결제·배송까지 주문 전후에 확인할 내용을 정리했습니다.",
  intro:
    "배터리는 차량 규격, 단자 방향, 폐전지 반납 여부에 따라 주문 조건이 달라질 수 있습니다. 주문 전 차량 정보와 배터리 규격을 꼭 확인해 주세요.",
  sections: [
    {
      heading: "주문 전 차량 정보 확인",
      bullets: [
        "차종명, 연식, 연료, ISG(스마트충전) 여부를 확인합니다.",
        "검색 결과가 여러 개이면 라벨·단자 방향과 일치하는 규격만 선택합니다.",
      ],
    },
    {
      heading: "배터리 규격 확인",
      bullets: [
        "기존 배터리 라벨의 AGM·DIN·GB·CMF 표기, 용량, L/R 단자 방향을 확인합니다.",
        "애매하면 사진 확인 안내 또는 고객센터 상담을 먼저 이용해 주세요.",
      ],
      callout: "규격·단자 방향이 다르면 장착이 어렵거나 오주문이 될 수 있습니다.",
    },
    {
      heading: "폐전지 반납 여부 확인",
      anchorId: "used-battery-precheck",
      variant: "used-battery-precheck",
    },
    {
      heading: "배송지 및 연락처 확인",
      bullets: [
        "수령 주소, 연락처, 배송 메모를 주문 전에 다시 확인합니다.",
        "배터리는 무거운 상품이므로 수령 가능한 장소를 미리 확인해 주세요.",
      ],
    },
    {
      heading: "무통장 입금 주문 안내",
      anchorId: "bank-transfer",
      variant: "bank-transfer-policy",
    },
    {
      heading: "주문 완료 후 안내 메시지",
      bullets: [
        "주문 접수·무통장 입금·입금 확인 등 단계별 안내 메시지 예시를 확인할 수 있습니다.",
        "회원 주문은 마이페이지에서 주문번호와 진행 상태를 확인할 수 있습니다.",
      ],
      callout:
        "실제 문자·알림톡 자동 발송은 준비 중이며, 아래 페이지에서 문구 예시만 확인할 수 있습니다.",
      cta: { label: "주문/결제 안내 메시지 예시 보기", href: `${CUSTOMER_CENTER_MESSAGE_GUIDE}?group=주문/결제` },
    },
    {
      heading: "배송 시작 후 안내 메시지",
      bullets: [
        "배송 시작·운송장, 배송 지연, 배송 완료 안내 메시지 예시를 확인할 수 있습니다.",
        "운송장 등록 후에도 택배사 스캔 반영이 늦어질 수 있습니다.",
      ],
      cta: { label: "배송 안내 메시지 예시 보기", href: `${CUSTOMER_CENTER_MESSAGE_GUIDE}?group=배송` },
    },
    {
      heading: "주문내역 조회",
      anchorId: "member-orders",
      bullets: [
        "로그인 후 마이페이지에서 결제 주문·배송·장착 진행 상태를 확인할 수 있습니다.",
        "주문번호를 잊으셨다면 주문자명, 연락처, 상품 정보로 고객센터에서 조회를 도와드릴 수 있습니다.",
        "본인 확인을 위해 일부 정보 확인이 필요할 수 있습니다.",
      ],
    },
  ],
};

export const DELIVERY_GUIDE_PAGE: CustomerGuidePageData = {
  slug: "delivery",
  title: "배송 안내",
  description: "택배 배송기간, 운송장 확인, 수령 시 주의사항을 안내합니다.",
  intro:
    "운송장 등록 후에도 택배사 집하 및 스캔 상황에 따라 이동 정보 반영이 늦어질 수 있습니다.",
  sections: [
    {
      heading: "택배 배송 기본 안내",
      bullets: [
        "결제 확인 후 순차 발송되며, 상품·지역·택배사 사정에 따라 일정이 달라질 수 있습니다.",
        "배송 상태는 주문 내역 또는 운송장 조회로 확인할 수 있습니다.",
      ],
    },
    {
      heading: "배송기간 안내",
      paragraphs: [
        "지역과 택배사 물량에 따라 배송기간이 달라질 수 있습니다.",
        "정확한 도착 예정일은 운송장 정보와 택배사 안내를 함께 확인해 주세요.",
      ],
    },
    {
      heading: "배송중인데 이동이 없을 때",
      bullets: [
        "운송장 등록 직후에는 집하·스캔 반영이 지연될 수 있습니다.",
        "일정 시간 이후에도 이동이 없으면 고객센터로 문의해 주시면 확인을 도와드립니다.",
      ],
    },
    {
      heading: "배송완료인데 수령하지 못했을 때",
      bullets: [
        "문 앞, 경비실, 택배 보관함, 대리수령 여부를 먼저 확인해 주세요.",
        "확인 후에도 수령하지 못한 경우 고객센터로 문의해 주시면 택배사 확인을 도와드립니다.",
      ],
    },
    {
      heading: "배터리 수령·포장 주의",
      bullets: [
        "배터리는 무거운 상품이므로 수령 시 포장 상태를 확인해 주세요.",
        "외관 손상이 보이면 개봉·장착 전 사진을 남기고 고객센터로 먼저 문의해 주세요.",
      ],
      callout: "임의 장착 후 불량·오배송 신고는 확인이 어려울 수 있습니다.",
    },
    {
      heading: "배송 알림 메시지 예시",
      paragraphs: ["발송·운송장·배송완료·지연 안내 등 배송 단계별 메시지 문구를 확인할 수 있습니다."],
      cta: { label: "배송 안내 메시지 보기", href: `${CUSTOMER_CENTER_MESSAGE_GUIDE}?group=배송` },
    },
  ],
};

export const RETURN_EXCHANGE_GUIDE_PAGE: CustomerGuidePageData = {
  slug: "return-exchange",
  title: "교환/반품 안내",
  description:
    "배터리 특성에 맞는 교환·반품 기준과 접수 전 확인 사항을 안내합니다.",
  intro:
    "배터리는 제품 특성상 장착 여부, 단자 방향, 사용 흔적, 폐전지 반납 여부에 따라 교환/반품 가능 여부가 달라질 수 있습니다.",
  sections: [
    {
      heading: "교환/반품 접수 전 확인",
      bullets: [
        "주문번호, 수령일, 개봉·장착 여부, 폐전지 반납 진행 여부를 확인합니다.",
        "오배송·불량이 의심되면 장착·발송 전에 고객센터로 먼저 문의해 주세요.",
      ],
    },
    {
      heading: "맞교환 불가 또는 제한",
      paragraphs: [
        "배터리는 무게·회수·상태 확인이 필요해 일반 상품처럼 맞교환이 어려울 수 있습니다.",
        "상태 확인 후 교환 또는 회수 절차를 안내드립니다.",
      ],
    },
    {
      heading: "단순 변심",
      bullets: [
        "단순 변심은 개봉·장착 여부에 따라 접수가 제한되거나 비용이 달라질 수 있습니다.",
        "접수 전 고객센터에서 가능 여부를 확인해 주세요.",
      ],
    },
    {
      heading: "개봉·장착 후",
      callout:
        "개봉·장착·사용 흔적이 있으면 교환/반품이 어려울 수 있습니다. 장착 전 사진·라벨을 준비해 주세요.",
    },
    {
      heading: "오배송·불량",
      bullets: [
        "제품 사진, 라벨, 단자 방향, 장착 전 상태 사진을 보내주시면 확인 후 절차를 안내드립니다.",
        "확인 결과에 따라 교환·반품·회수 방식이 달라질 수 있습니다.",
      ],
    },
    {
      heading: "임의 발송 전 문의",
      paragraphs: [
        "고객님이 직접 택배 발송하시기 전에 반드시 고객센터와 접수·주소·포장 방법을 확인해 주세요.",
        "임의 발송 시 처리 지연 또는 추가 비용이 발생할 수 있습니다.",
      ],
    },
    {
      heading: "교환/반품 안내 메시지",
      paragraphs: ["불량·오배송·교환/반품 접수 시 고객에게 안내되는 메시지 예시입니다."],
      cta: {
        label: "교환/반품 안내 메시지 보기",
        href: `${CUSTOMER_CENTER_MESSAGE_GUIDE}?group=교환/반품`,
      },
    },
  ],
};

export const USED_BATTERY_GUIDE_PAGE: CustomerGuidePageData = {
  slug: "used-battery-return",
  title: "폐전지 반납 안내",
  description: "반납/미반납 조건, 회수 절차, 미반납 시 비용 안내입니다.",
  intro:
    "폐전지 반납 조건으로 주문한 경우, 기존 배터리 회수가 필요합니다. 반납이 어려운 경우 미반납 조건 상품을 선택해 주세요.",
  sections: [
    {
      heading: "폐전지 반납이 필요한 이유",
      paragraphs: [
        "자동차 배터리 교체 시 기존 폐전지 회수·재활용 절차가 필요할 수 있습니다.",
        "반납 조건 상품은 새 배터리 수령 후 기존 배터리를 회수하는 방식으로 안내됩니다.",
      ],
    },
    {
      heading: "반납/미반납 가격 차이",
      bullets: [
        "반납 조건과 미반납 조건은 판매 가격·회수 절차가 다를 수 있습니다.",
        "주문 전 상품 옵션에서 반납/미반납을 정확히 선택해 주세요.",
      ],
    },
    {
      heading: "반납 절차",
      bullets: [
        "새 배터리 수령 후 기존 배터리를 안전하게 포장합니다.",
        "주문 후 안내되는 회수 신청 절차에 따라 반납 일정을 맞춰 주세요.",
      ],
    },
    {
      heading: "회수 신청",
      paragraphs: [
        "회수 일정·포장 방법·수거 주소는 주문 후 안내 또는 고객센터 상담으로 확인할 수 있습니다.",
        "회수 전 연락처와 수거 가능 장소를 다시 확인해 주세요.",
      ],
    },
    {
      heading: "포장 주의",
      bullets: [
        "단자·측면이 손상되지 않도록 완충재로 감싸 박스에 넣어 주세요.",
        "누액·균열이 있는 배터리는 별도 안내가 필요할 수 있으니 문의해 주세요.",
      ],
    },
    {
      heading: "미반납 시",
      callout:
        "반납 조건으로 주문 후 반납이 진행되지 않으면 추가 비용이 발생할 수 있습니다. 반납이 어렵다면 미반납 조건으로 주문해 주세요.",
    },
    {
      heading: "폐전지 반납 안내 메시지",
      paragraphs: ["반납·회수 신청·미반납 확인 등 폐전지 관련 안내 메시지 예시를 확인할 수 있습니다."],
      cta: { label: "폐전지 안내 메시지 보기", href: `${CUSTOMER_CENTER_MESSAGE_GUIDE}?group=폐전지` },
    },
  ],
};

export const CUSTOMER_GUIDE_NAV: { label: string; href: string }[] = [
  { label: "고객센터", href: CUSTOMER_CENTER_HUB },
  { label: "주문 안내", href: CUSTOMER_CENTER_ORDER_GUIDE },
  { label: "배송", href: CUSTOMER_CENTER_DELIVERY },
  { label: "폐전지 반납", href: CUSTOMER_CENTER_USED_BATTERY },
  { label: "교환/반품", href: CUSTOMER_CENTER_RETURN_EXCHANGE },
  { label: "FAQ", href: CUSTOMER_CENTER_FAQ },
  { label: "안내 메시지", href: CUSTOMER_CENTER_MESSAGE_GUIDE },
];
