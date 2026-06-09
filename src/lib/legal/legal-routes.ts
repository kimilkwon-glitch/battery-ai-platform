/** 토스 심사·고객 신뢰용 정책/회사 정보 URL */

export const LEGAL_TERMS_PAGE = "/terms" as const;
export const LEGAL_PRIVACY_PAGE = "/privacy" as const;
export const LEGAL_SHIPPING_PAGE = "/shipping" as const;
export const LEGAL_REFUND_PAGE = "/refund" as const;
export const LEGAL_SHIPPING_RETURNS_PAGE = "/shipping-returns" as const;
export const LEGAL_COMPANY_PAGE = "/company" as const;
export const LEGAL_CUSTOMER_CENTER_PAGE = "/customer-center" as const;
/** @deprecated — LEGAL_CUSTOMER_CENTER_PAGE 사용 */
export const LEGAL_SUPPORT_PAGE = LEGAL_CUSTOMER_CENTER_PAGE;

export const LEGAL_FOOTER_LINKS = [
  { label: "이용약관", href: LEGAL_TERMS_PAGE },
  { label: "개인정보처리방침", href: LEGAL_PRIVACY_PAGE },
  { label: "배송·교환·반품·환불", href: LEGAL_SHIPPING_RETURNS_PAGE },
  { label: "고객센터", href: LEGAL_CUSTOMER_CENTER_PAGE },
  { label: "회사/사업자 정보", href: LEGAL_COMPANY_PAGE },
] as const;
