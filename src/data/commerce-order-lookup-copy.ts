import {
  COMMERCE_ORDER_LOOKUP_PAGE,
  CUSTOMER_CENTER_HUB,
  ORDER_REQUEST_LOOKUP_PAGE,
} from "@/lib/customer-center-routes";
import { CUSTOMER_MYPAGE } from "@/lib/customer-auth-routes";

export const COMMERCE_ORDER_LOOKUP_COPY = {
  pageTitle: "주문 조회",
  pageDescription: "주문 시 입력하신 주문자명과 연락처로 조회할 수 있습니다.",
  nameLabel: "주문자명",
  namePlaceholder: "홍길동",
  phoneLabel: "연락처",
  phonePlaceholder: "010-1234-5678",
  hint: "주문 시 입력하신 이름과 연락처가 정확히 일치해야 합니다.",
  submitLabel: "조회하기",
  loading: "확인 중…",
  notFoundTitle: "주문을 찾을 수 없습니다",
  notFoundBody: "입력하신 정보와 일치하는 주문을 찾을 수 없습니다.",
  anotherLookup: "다른 정보로 조회",
  listTitle: "조회된 주문",
  listCount: (n: number) => `${n}건`,
  viewDetail: "상세 보기",
} as const;

export const COMMERCE_ORDER_LOOKUP_CTAS = {
  consultationLookup: {
    label: "상담 접수 조회",
    href: ORDER_REQUEST_LOOKUP_PAGE,
  },
  mypage: { label: "마이페이지", href: `${CUSTOMER_MYPAGE}#orders` },
  customerHub: { label: "고객센터 문의", href: CUSTOMER_CENTER_HUB },
  retry: { label: "다시 조회", href: COMMERCE_ORDER_LOOKUP_PAGE },
  home: { label: "메인으로", href: "/" },
} as const;
