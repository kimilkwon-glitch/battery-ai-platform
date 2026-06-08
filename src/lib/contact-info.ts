/** 고객센터·매장 전화번호 — 사이트 전체 단일 소스 */

export const CUSTOMER_CENTER_PHONE = "070-7954-2143";
export const CUSTOMER_CENTER_PHONE_TEL = "tel:07079542143";

export const STORE_PHONES = {
  deokcheon: {
    id: "deokcheon" as const,
    label: "덕천점",
    phone: "010-8339-8316",
    tel: "tel:01083398316",
  },
  hakjang: {
    id: "hakjang" as const,
    label: "학장점",
    phone: "010-8896-8316",
    tel: "tel:01088968316",
  },
} as const;

export const CONTACT = {
  customerCenter: {
    label: "고객센터",
    phone: CUSTOMER_CENTER_PHONE,
    tel: CUSTOMER_CENTER_PHONE_TEL,
  },
  stores: STORE_PHONES,
} as const;
