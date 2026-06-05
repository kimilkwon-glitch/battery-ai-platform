import { BUSAN_STORES } from "@/lib/busan-service-hub-data";

export type BusinessInfo = {
  tradeName: string;
  representative: string | null;
  businessRegistrationNumber: string | null;
  mailOrderReportNumber: string | null;
  address: string | null;
  email: string | null;
  privacyOfficer: string | null;
  businessHours: string | null;
  customerPhones: { label: string; phone: string; tel: string }[];
};

function envOrNull(key: string): string | null {
  const v = process.env[key]?.trim();
  return v || null;
}

/** 사업자 정보 — 환경변수 또는 심사 전 기본값(연락처만 확정) */
export function getBusinessInfo(): BusinessInfo {
  return {
    tradeName: envOrNull("NEXT_PUBLIC_COMPANY_TRADE_NAME") ?? "배터리매니저",
    representative: envOrNull("NEXT_PUBLIC_COMPANY_CEO"),
    businessRegistrationNumber: envOrNull("NEXT_PUBLIC_COMPANY_BUSINESS_NO"),
    mailOrderReportNumber: envOrNull("NEXT_PUBLIC_COMPANY_MAIL_ORDER_NO"),
    address: envOrNull("NEXT_PUBLIC_COMPANY_ADDRESS"),
    email: envOrNull("NEXT_PUBLIC_COMPANY_EMAIL"),
    privacyOfficer: envOrNull("NEXT_PUBLIC_COMPANY_PRIVACY_OFFICER"),
    businessHours: envOrNull("NEXT_PUBLIC_COMPANY_HOURS"),
    customerPhones: BUSAN_STORES.map((s) => ({
      label: s.name,
      phone: s.phone,
      tel: s.phoneTel,
    })),
  };
}

export function formatBusinessField(value: string | null, fallback = "고객센터 문의"): string {
  return value?.trim() || fallback;
}
