/** 토스 심사·고객 신뢰용 정책/회사 정보 URL */

export const LEGAL_TERMS_PAGE = "/terms" as const;
export const LEGAL_PRIVACY_PAGE = "/privacy" as const;
export const LEGAL_SHIPPING_PAGE = "/shipping" as const;
export const LEGAL_REFUND_PAGE = "/refund" as const;
export const LEGAL_COMPANY_PAGE = "/company" as const;
export const LEGAL_SUPPORT_PAGE = "/support" as const;

export const LEGAL_FOOTER_LINKS = [
  { label: "이용약관", href: LEGAL_TERMS_PAGE },
  { label: "개인정보처리방침", href: LEGAL_PRIVACY_PAGE },
  { label: "배송 안내", href: LEGAL_SHIPPING_PAGE },
  { label: "교환/환불 안내", href: LEGAL_REFUND_PAGE },
  { label: "고객센터", href: LEGAL_SUPPORT_PAGE },
  { label: "회사/매장 정보", href: LEGAL_COMPANY_PAGE },
] as const;
