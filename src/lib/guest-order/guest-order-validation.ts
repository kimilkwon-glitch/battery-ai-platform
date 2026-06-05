import { PHONE_RE } from "@/lib/order-request/order-request-validation";
import type { GuestOrderFormValues } from "@/lib/guest-order/guest-order-input";

export function validateGuestOrderForm(values: GuestOrderFormValues): string[] {
  const errors: string[] = [];

  if (!values.name.trim()) errors.push("이름을 입력해 주세요.");
  if (!values.phone.trim()) errors.push("연락처를 입력해 주세요.");
  else if (!PHONE_RE.test(values.phone.replace(/\s/g, ""))) {
    errors.push("연락처 형식을 확인해 주세요.");
  }

  if (!values.vehicleName.trim()) errors.push("차량명을 입력해 주세요.");
  if (!values.vehicleYear.trim()) errors.push("연식을 입력해 주세요.");
  if (!values.fuelType.trim()) errors.push("연료를 선택해 주세요.");
  if (!values.batterySpec.trim()) errors.push("배터리 규격을 입력해 주세요.");

  if (values.usedBattery !== "return" && values.usedBattery !== "no_return") {
    errors.push("폐전지 반납 여부를 선택해 주세요.");
  }

  if (
    values.fulfillmentMethod === "store_pickup" &&
    !values.storeId
  ) {
    errors.push("내방 장착 시 지점을 선택해 주세요.");
  }

  if (
    values.fulfillmentMethod === "visit_install" &&
    !values.address?.trim() &&
    !values.region?.trim()
  ) {
    errors.push("출장 장착 시 주소 또는 지역을 입력해 주세요.");
  }

  if (values.memo && values.memo.length > 2000) {
    errors.push("요청사항은 2000자 이하로 입력해 주세요.");
  }

  return errors;
}
