import { createCartItemFromBattery } from "@/lib/cart/cart-item-factory";
import type {
  CreateOrderRequestInput,
  GuestOrderExtras,
  OrderRequestConfirmations,
  OrderRequestFulfillment,
  OrderRequestVehicle,
} from "@/types/order-request";

export type GuestOrderFormValues = {
  name: string;
  phone: string;
  vehicleName: string;
  vehicleYear: string;
  fuelType: string;
  batterySpec: string;
  brand: "rocket" | "solite" | "battery_manager" | "undecided";
  usedBattery: "return" | "no_return";
  fulfillmentMethod: "delivery" | "store_pickup" | "visit_install" | "undecided";
  storeId?: "deokcheon" | "hakjang";
  region?: string;
  address?: string;
  memo?: string;
  plateSuffix?: string;
  preferredTime?: string;
  photoAttachmentCount?: number;
  hasExistingBatteryPhoto?: boolean;
  hasBatteryBayPhoto?: boolean;
};

function brandLabel(brand: GuestOrderFormValues["brand"]): string | undefined {
  if (brand === "rocket") return "로케트";
  if (brand === "solite") return "쏠라이트";
  if (brand === "battery_manager") return "배터리매니저";
  return undefined;
}

function buildGuestCartItem(values: GuestOrderFormValues) {
  const brandName = brandLabel(values.brand);
  const item = createCartItemFromBattery({
    batteryCode: values.batterySpec,
    brandName,
    productName: brandName
      ? `${brandName} ${values.batterySpec}`
      : values.batterySpec,
    vehicle: {
      displayName: values.vehicleName,
      year: values.vehicleYear,
      fuelType: values.fuelType,
    },
    fitmentStatus: values.hasExistingBatteryPhoto ? "needs_photo_check" : "needs_customer_confirm",
    usedBatteryReturnOption: values.usedBattery,
    source: "manual",
  });
  item.fulfillment = {
    method: values.fulfillmentMethod,
    storeId: values.storeId,
    requestedRegion: values.region ?? values.address,
  };
  item.customerMemo = values.memo;
  return item;
}

export function guestFormToCreateInput(
  values: GuestOrderFormValues,
): CreateOrderRequestInput {
  const fulfillment: OrderRequestFulfillment = {
    method: values.fulfillmentMethod,
    storeId:
      values.fulfillmentMethod === "store_pickup"
        ? values.storeId ?? "undecided"
        : undefined,
    region:
      values.fulfillmentMethod === "visit_install"
        ? values.address?.trim() || values.region?.trim()
        : values.region?.trim(),
    preferredTime: values.preferredTime,
  };

  const vehicle: OrderRequestVehicle = {
    name: values.vehicleName.trim(),
    year: values.vehicleYear.trim(),
    fuelType: values.fuelType.trim(),
    currentBatterySpec: values.batterySpec.trim(),
    photoCheckNeeded:
      Boolean(values.hasExistingBatteryPhoto) ||
      Boolean(values.hasBatteryBayPhoto) ||
      (values.photoAttachmentCount ?? 0) > 0,
  };

  const guestExtras: GuestOrderExtras = {
    plateSuffix: values.plateSuffix?.trim(),
    preferredTime: values.preferredTime?.trim(),
    photoAttachmentCount: values.photoAttachmentCount,
    hasExistingBatteryPhoto: values.hasExistingBatteryPhoto,
    hasBatteryBayPhoto: values.hasBatteryBayPhoto,
  };

  const confirmations: OrderRequestConfirmations = {
    fitmentNeedsFinalCheck: true,
    usedBatteryPriceMayDiffer: true,
    bankTransferDeadlineAware: true,
    orderWillBeGuidedSeparately: true,
  };

  return {
    customerName: values.name.trim(),
    customerPhone: values.phone.trim(),
    customerType: "guest",
    guestExtras,
    vehicle,
    usedBatteryReturnOption: values.usedBattery,
    fulfillment,
    items: [buildGuestCartItem(values)],
    memo: values.memo?.trim(),
    confirmations,
    website: "",
  };
}
