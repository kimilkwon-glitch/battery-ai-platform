/** 고객센터 FAQ — 주문·배송·반품·폐전지·결제 (규격/증상 FAQ는 support-faq-data 유지) */

export type CustomerServiceFaqCategory =
  | "계정"
  | "조회"
  | "배송"
  | "교환·반품"
  | "폐전지"
  | "결제";

export type CustomerServiceFaqItem = {
  id: string;
  category: CustomerServiceFaqCategory;
  question: string;
  answer: string;
};

export const CUSTOMER_SERVICE_FAQ_CATEGORIES: CustomerServiceFaqCategory[] = [
  "계정",
  "조회",
  "배송",
  "교환·반품",
  "폐전지",
  "결제",
];

export const CUSTOMER_SERVICE_FAQ_ITEMS: CustomerServiceFaqItem[] = [
  {
    id: "cs-faq-account-rejoin",
    category: "계정",
    question: "탈회 후 재회원가입이 가능한가요?",
    answer:
      "탈회 후에도 재회원가입은 가능합니다. 다만 기존 주문 내역, 쿠폰, 적립 혜택 등은 복구되지 않을 수 있으므로 탈회 전 주문 처리 상태를 먼저 확인해 주세요.",
  },
  {
    id: "cs-faq-guest-order-lookup",
    category: "조회",
    question: "비회원 주문은 어디서 확인하나요?",
    answer:
      "고객센터의 비회원 주문조회에서 주문번호와 연락처로 주문 상태를 확인할 수 있습니다. 주문번호를 모르시면 고객센터로 문의해 주세요.",
  },
  {
    id: "cs-faq-order-number-lost",
    category: "조회",
    question: "주문번호를 잊어버렸어요.",
    answer:
      "주문자명, 연락처, 주문 상품 정보를 확인한 뒤 고객센터에서 조회를 도와드릴 수 있습니다. 본인 확인을 위해 일부 정보 확인이 필요할 수 있습니다.",
  },
  {
    id: "cs-faq-member-vs-guest-lookup",
    category: "조회",
    question: "회원 주문과 비회원 주문 조회는 어떻게 다른가요?",
    answer:
      "회원 주문은 로그인 후 마이페이지에서 확인할 수 있습니다. 비회원 주문은 고객센터의 비회원 주문조회에서 주문번호와 연락처로 확인할 수 있습니다.",
  },
  {
    id: "cs-faq-order-where",
    category: "조회",
    question: "주문 내역은 어디서 확인하나요?",
    answer:
      "로그인 후 마이페이지에서 결제 주문·배송·장착 진행 상태를 확인할 수 있습니다. 주문번호를 잊으셨다면 고객센터로 문의해 주세요.",
  },
  {
    id: "cs-faq-member-lookup",
    category: "조회",
    question: "로그인 없이 주문 내역을 볼 수 있나요?",
    answer:
      "주문·결제는 회원 로그인 후 진행됩니다. 주문 내역은 마이페이지에서 확인해 주세요. 로그인이 어려우시면 고객센터로 문의해 주세요.",
  },
  {
    id: "cs-faq-order-forgot",
    category: "조회",
    question: "주문번호를 기억하지 못하면 어떻게 하나요?",
    answer:
      "마이페이지에서 주문 내역을 확인하거나, 주문자명·연락처·주문 상품 정보로 고객센터에서 조회를 도와드릴 수 있습니다. 본인 확인을 위해 일부 정보 확인이 필요할 수 있습니다.",
  },
  {
    id: "cs-faq-delivery-time",
    category: "배송",
    question: "배송기간은 얼마나 걸리나요?",
    answer:
      "택배 주문은 결제 확인 후 순차 발송되며, 지역과 택배사 사정에 따라 배송기간이 달라질 수 있습니다. 정확한 일정은 주문 상태와 운송장 정보를 기준으로 확인해 주세요.",
  },
  {
    id: "cs-faq-delivery-stuck",
    category: "배송",
    question: "배송중으로 뜨는데 이동이 없어요.",
    answer:
      "택배사 집하 또는 물류 이동 과정에서 운송장 정보 반영이 지연될 수 있습니다. 일정 시간 이후에도 이동이 없으면 고객센터로 문의해 주세요.",
  },
  {
    id: "cs-faq-delivery-not-received",
    category: "배송",
    question: "배송완료로 뜨는데 수령하지 못했어요.",
    answer:
      "문 앞, 경비실, 택배 보관장소, 대리수령 여부를 먼저 확인해 주세요. 확인 후에도 수령하지 못한 경우 고객센터로 문의해 주시면 택배사 확인을 도와드리겠습니다.",
  },
  {
    id: "cs-faq-exchange-blocked",
    category: "교환·반품",
    question: "교환 접수가 안 되는 이유가 있나요?",
    answer:
      "배터리는 제품 특성상 맞교환이 어렵고, 개봉·장착·사용 여부에 따라 교환 가능 여부가 달라질 수 있습니다. 오배송이나 불량이 의심되는 경우 사진 확인 후 안내드립니다.",
  },
  {
    id: "cs-faq-swap",
    category: "교환·반품",
    question: "맞교환이 가능한가요?",
    answer:
      "배터리는 무게와 회수 절차, 제품 상태 확인이 필요한 상품이라 일반 상품처럼 맞교환이 어려울 수 있습니다. 상태 확인 후 교환 또는 회수 절차를 안내드립니다.",
  },
  {
    id: "cs-faq-return-how",
    category: "교환·반품",
    question: "반품 접수는 어떻게 하나요?",
    answer:
      "반품은 주문 내역 또는 고객센터를 통해 접수할 수 있습니다. 단순 변심, 개봉 여부, 장착 여부, 폐전지 반납 여부에 따라 처리 방식과 비용이 달라질 수 있습니다.",
  },
  {
    id: "cs-faq-defect-wrong",
    category: "교환·반품",
    question: "불량이나 오배송인 경우 어떻게 하나요?",
    answer:
      "제품 사진, 라벨, 단자 방향, 장착 전 상태를 확인할 수 있는 자료를 보내주시면 확인 후 교환/반품 절차를 안내드립니다. 임의 장착이나 임의 발송 전 먼저 고객센터로 문의해 주세요.",
  },
  {
    id: "cs-faq-used-price-diff",
    category: "폐전지",
    question: "폐전지 반납과 미반납 금액이 왜 다른가요?",
    answer:
      "자동차 배터리는 기존 폐전지 회수 여부에 따라 판매 조건이 달라질 수 있습니다. 반납 조건 상품과 미반납 상품은 금액이 다를 수 있으므로 주문 전 옵션을 확인해 주세요.",
  },
  {
    id: "cs-faq-used-how",
    category: "폐전지",
    question: "폐전지는 어떻게 반납하나요?",
    answer:
      "새 배터리를 받은 뒤 기존 배터리를 안전하게 포장하고, 안내된 회수 절차에 따라 반납해 주세요. 자세한 방법은 주문 후 안내 메시지 또는 고객센터 안내를 확인해 주세요.",
  },
  {
    id: "cs-faq-used-not-returned",
    category: "폐전지",
    question: "폐전지를 반납하지 않으면 어떻게 되나요?",
    answer:
      "폐전지 반납 조건으로 주문한 뒤 반납이 진행되지 않으면 추가 비용이 발생할 수 있습니다. 반납이 어렵다면 미반납 조건 상품을 선택해 주세요.",
  },
  {
    id: "cs-faq-used-packing-box",
    category: "폐전지",
    question: "폐전지는 아무 박스에 담아도 되나요?",
    answer:
      "배터리는 무겁고 누액 위험이 있을 수 있어 단단한 박스에 세워서 포장해야 합니다. 흔들리지 않게 고정하고, 단자가 금속과 닿지 않도록 주의해 주세요.",
  },
  {
    id: "cs-faq-used-leak-damage",
    category: "폐전지",
    question: "폐전지가 파손되거나 누액이 있으면 어떻게 하나요?",
    answer:
      "파손, 누액, 부풀음이 있는 경우 임의로 발송하지 말고 고객센터로 먼저 문의해 주세요. 상태 확인 후 안내드리겠습니다.",
  },
  {
    id: "cs-faq-used-trash",
    category: "폐전지",
    question: "폐전지를 일반 쓰레기로 버려도 되나요?",
    answer:
      "폐전지는 일반 쓰레기로 버리면 안 됩니다. 반드시 적절한 회수 절차를 통해 처리해 주세요.",
  },
  {
    id: "cs-faq-bank-transfer",
    category: "결제",
    question: "무통장 입금은 언제까지 해야 하나요?",
    answer:
      "무통장 입금 주문은 주문 후 48시간 이내 입금이 필요합니다. 기한 내 입금 확인이 되지 않으면 주문이 자동 취소될 수 있습니다.",
  },
  {
    id: "cs-faq-depositor-name",
    category: "결제",
    question: "입금자명이 주문자명과 다르면 어떻게 하나요?",
    answer:
      "입금자명이 다르면 확인이 지연될 수 있습니다. 주문번호, 입금자명, 입금 금액을 고객센터로 알려주시면 확인을 도와드리겠습니다.",
  },
  {
    id: "cs-faq-auto-cancel-reorder",
    category: "결제",
    question: "48시간이 지나 자동 취소되면 다시 살 수 있나요?",
    answer:
      "자동 취소 후 구매를 원하시면 상품을 다시 확인한 뒤 새로 주문해 주세요. 재고나 가격은 재주문 시점 기준으로 달라질 수 있습니다.",
  },
  {
    id: "cs-faq-deposit-pending",
    category: "결제",
    question: "입금했는데 주문이 입금 대기로 보여요.",
    answer:
      "입금 확인은 순차적으로 처리됩니다. 입금자명, 금액, 주문번호가 다르거나 확인 시간이 지난 경우 고객센터로 문의해 주세요.",
  },
];
