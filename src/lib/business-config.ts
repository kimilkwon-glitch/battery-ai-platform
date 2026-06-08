/**
 * 사업자·고객센터 정보 — 푸터, 정책, 회사소개 단일 소스
 * 환경변수(NEXT_PUBLIC_COMPANY_*)로 운영 시 덮어쓸 수 있음
 */

import { CONTACT, STORE_PHONES } from "@/lib/contact-info";

export const BUSINESS_INFO = {
  tradeName: "부산배터리매니저 학장점",
  representative: "김일권",
  businessRegistrationNumber: "840-44-01060",
  mailOrderReportNumber: "제 2026-부산사상구-0197 호",
  address: "부산광역시 사상구 학감대로 171 1층",
  email: "batterymanager7787@naver.com",
  privacyOfficer: "김일권",
  hours: {
    weekday: "평일 09시 ~ 18시",
    saturday: "토요일 09시 ~ 15시",
    sunday: "일요일 정기 휴무",
  },
  branches: {
    deokcheon: {
      name: STORE_PHONES.deokcheon.label,
      phone: STORE_PHONES.deokcheon.phone,
      tel: STORE_PHONES.deokcheon.tel,
    },
    hakjang: {
      name: STORE_PHONES.hakjang.label,
      phone: STORE_PHONES.hakjang.phone,
      tel: STORE_PHONES.hakjang.tel,
    },
  },
} as const;

export const CUSTOMER_CENTER = CONTACT.customerCenter;

/** 푸터·회사정보용 운영시간 한 줄 */
export function formatBusinessHoursOneLine(): string {
  const { weekday, saturday, sunday } = BUSINESS_INFO.hours;
  return `${weekday} · ${saturday} · ${sunday}`;
}

/** 푸터·회사정보용 운영시간 여러 줄 */
export function formatBusinessHoursLines(): readonly string[] {
  return [
    BUSINESS_INFO.hours.weekday,
    BUSINESS_INFO.hours.saturday,
    BUSINESS_INFO.hours.sunday,
  ];
}
