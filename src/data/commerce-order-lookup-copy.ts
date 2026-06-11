import {
  COMMERCE_ORDER_LOOKUP_PAGE,
  CUSTOMER_CENTER_HUB,
  ORDER_REQUEST_LOOKUP_PAGE,
} from "@/lib/customer-center-routes";
import { CUSTOMER_MYPAGE } from "@/lib/customer-auth-routes";

export const COMMERCE_ORDER_LOOKUP_COPY = {
  pageTitle: "주문 조회",
  pageDescription: "주문번호와 휴대폰 번호를 입력해 주세요.",
  orderRefLabel: "주문번호",
  orderRefPlaceholder: "BM-20260608-0001",
  phoneLabel: "휴대폰 번호",
  phonePlaceholder: "010-1234-5678",
  hint: "주문번호를 모르시면 고객센터로 문의해 주세요.",
  submitLabel: "조회하기",
  loading: "확인 중…",
  notFoundTitle: "주문을 찾을 수 없습니다",
  notFoundBody: "입력 정보를 다시 확인해 주세요.",
  anotherLookup: "다른 주문 조회",
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
