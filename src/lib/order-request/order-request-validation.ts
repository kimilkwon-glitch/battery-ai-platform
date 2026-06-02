import type { CreateOrderRequestInput } from "@/types/order-request";

const PHONE_RE = /^01[0-9][-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4}$/;

export type ValidationResult =
  | { ok: true; data: CreateOrderRequestInput }
  | { ok: false; errors: string[] };

export function validateCreateOrderRequestInput(
  body: unknown,
): ValidationResult {
  const errors: string[] = [];
  if (!body || typeof body !== "object") {
    return { ok: false, errors: ["요청 본문이 올바르지 않습니다."] };
  }
  const b = body as Record<string, unknown>;

  if (b.website && String(b.website).trim()) {
    errors.push("스팸으로 판단되어 접수할 수 없습니다.");
  }

  const name = String(b.customerName ?? "").trim();
  if (!name) errors.push("이름은 필수입니다.");

  const phone = String(b.customerPhone ?? "").trim();
  if (!phone) errors.push("연락처는 필수입니다.");
  else if (!PHONE_RE.test(phone.replace(/\s/g, ""))) {
    errors.push("연락처 형식을 확인해 주세요.");
  }

  const items = b.items;
  if (!Array.isArray(items) || items.length === 0) {
    errors.push("장바구니 상품이 1개 이상 필요합니다.");
  }

  const usedBattery = b.usedBatteryReturnOption;
  if (usedBattery !== "return" && usedBattery !== "no_return") {
    errors.push("폐전지 반납 여부를 선택해 주세요.");
  }

  const confirmations = b.confirmations as Record<string, boolean> | undefined;
  if (!confirmations) {
    errors.push("필수 확인 항목이 누락되었습니다.");
  } else {
    const required = [
      "fitmentNeedsFinalCheck",
      "usedBatteryPriceMayDiffer",
      "bankTransferDeadlineAware",
      "orderWillBeGuidedSeparately",
    ] as const;
    for (const key of required) {
      if (!confirmations[key]) {
        errors.push("필수 확인 항목을 모두 체크해 주세요.");
        break;
      }
    }
  }

  const memo = b.memo != null ? String(b.memo) : "";
  if (memo.length > 2000) errors.push("요청사항은 2000자 이하로 입력해 주세요.");

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: body as CreateOrderRequestInput,
  };
}

export { PHONE_RE };
