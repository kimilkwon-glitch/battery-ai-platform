export type DeliveryCarrier = {
  code: string;
  name: string;
};

/** 스윗트래커 t_code — 문자열 유지 (앞자리 0 보존) */
export const DELIVERY_CARRIERS: DeliveryCarrier[] = [
  { code: "04", name: "CJ대한통운" },
  { code: "08", name: "롯데택배" },
  { code: "05", name: "한진택배" },
  { code: "06", name: "로젠택배" },
  { code: "01", name: "우체국택배" },
  { code: "23", name: "경동택배" },
  { code: "22", name: "대신택배" },
  { code: "46", name: "CU편의점택배" },
  { code: "53", name: "농협택배" },
];

const CARRIER_BY_CODE = new Map(DELIVERY_CARRIERS.map((c) => [c.code, c]));
const CARRIER_BY_NAME = new Map(DELIVERY_CARRIERS.map((c) => [c.name, c]));

export function isKnownDeliveryCarrierCode(code: string): boolean {
  return CARRIER_BY_CODE.has(code.trim());
}

export function deliveryCarrierName(code: string): string | undefined {
  return CARRIER_BY_CODE.get(code.trim())?.name;
}

export function deliveryCarrierCodeByName(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return undefined;
  const exact = CARRIER_BY_NAME.get(trimmed);
  if (exact) return exact.code;
  const hit = DELIVERY_CARRIERS.find(
    (c) => c.name.includes(trimmed) || trimmed.includes(c.name.replace("택배", "")),
  );
  return hit?.code;
}

export function resolveDeliveryCarrier(input: {
  courierCode?: string | null;
  courierName?: string | null;
}): { code: string; name: string } | null {
  const code = input.courierCode?.trim();
  if (code && isKnownDeliveryCarrierCode(code)) {
    return { code, name: deliveryCarrierName(code)! };
  }
  const name = input.courierName?.trim();
  if (name) {
    const fromName = deliveryCarrierCodeByName(name);
    if (fromName) {
      return { code: fromName, name: deliveryCarrierName(fromName)! };
    }
  }
  return null;
}

/** 운송장번호 — 숫자·하이픈·영문, 4~30자 */
const INVOICE_RE = /^[0-9A-Za-z-]{4,30}$/;

export function normalizeInvoiceNumber(raw: string): string {
  return raw.trim().replace(/\s+/g, "");
}

export function isValidInvoiceNumber(raw: string): boolean {
  const v = normalizeInvoiceNumber(raw);
  return INVOICE_RE.test(v);
}
