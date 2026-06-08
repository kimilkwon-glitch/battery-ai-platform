import {
  BUSINESS_INFO,
  CUSTOMER_CENTER,
  formatBusinessHoursOneLine,
} from "@/lib/business-config";

export type BusinessInfo = {
  tradeName: string;
  representative: string;
  businessRegistrationNumber: string;
  mailOrderReportNumber: string;
  address: string;
  email: string;
  privacyOfficer: string;
  businessHours: string;
  businessHoursLines: readonly string[];
  customerPhones: { label: string; phone: string; tel: string }[];
};

function envOrNull(key: string): string | null {
  const v = process.env[key]?.trim();
  return v || null;
}

/** 사업자 정보 — business-config 기본값, 환경변수로 선택적 덮어쓰기 */
export function getBusinessInfo(): BusinessInfo {
  return {
    tradeName: envOrNull("NEXT_PUBLIC_COMPANY_TRADE_NAME") ?? BUSINESS_INFO.tradeName,
    representative: envOrNull("NEXT_PUBLIC_COMPANY_CEO") ?? BUSINESS_INFO.representative,
    businessRegistrationNumber:
      envOrNull("NEXT_PUBLIC_COMPANY_BUSINESS_NO") ?? BUSINESS_INFO.businessRegistrationNumber,
    mailOrderReportNumber:
      envOrNull("NEXT_PUBLIC_COMPANY_MAIL_ORDER_NO") ?? BUSINESS_INFO.mailOrderReportNumber,
    address: envOrNull("NEXT_PUBLIC_COMPANY_ADDRESS") ?? BUSINESS_INFO.address,
    email: envOrNull("NEXT_PUBLIC_COMPANY_EMAIL") ?? BUSINESS_INFO.email,
    privacyOfficer:
      envOrNull("NEXT_PUBLIC_COMPANY_PRIVACY_OFFICER") ?? BUSINESS_INFO.privacyOfficer,
    businessHours: envOrNull("NEXT_PUBLIC_COMPANY_HOURS") ?? formatBusinessHoursOneLine(),
    businessHoursLines: [
      BUSINESS_INFO.hours.weekday,
      BUSINESS_INFO.hours.saturday,
      BUSINESS_INFO.hours.sunday,
    ],
    customerPhones: [
      {
        label: CUSTOMER_CENTER.label,
        phone: CUSTOMER_CENTER.phone,
        tel: CUSTOMER_CENTER.tel,
      },
    ],
  };
}

export function formatBusinessField(value: string | null | undefined): string {
  return value?.trim() || "";
}
