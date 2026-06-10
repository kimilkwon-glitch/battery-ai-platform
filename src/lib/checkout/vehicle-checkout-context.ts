import { createCartItemFromBattery, createCartItemFromVehicleBattery } from "@/lib/cart/cart-item-factory";
import type { CreateCartItemInput } from "@/lib/cart/cart-item-factory";
import type { BatteryReturnOption } from "@/lib/shop-order-types";
import type { BatteryCartItem } from "@/types/cart";
import type { OrderRequestVehicle } from "@/types/order-request";

/** 차량 상세·검색 → 상품상세·주문서 공통 query 키 */
export type VehicleCheckoutContext = {
  vehicleSlug: string;
  vehicleTitle: string;
  fuel?: string;
  year?: string;
};

export function parseVehicleCheckoutContext(
  params: URLSearchParams | null | undefined,
): VehicleCheckoutContext | null {
  if (!params) return null;
  const vehicleSlug = params.get("vehicle")?.trim() ?? "";
  const vehicleTitle = params.get("vehicleTitle")?.trim() ?? "";
  if (!vehicleSlug && !vehicleTitle) return null;
  return {
    vehicleSlug: vehicleSlug || vehicleTitle,
    vehicleTitle: vehicleTitle || vehicleSlug,
    fuel: params.get("fuel")?.trim() || undefined,
    year: params.get("year")?.trim() || undefined,
  };
}

export function vehicleCheckoutContextToQuery(ctx: VehicleCheckoutContext): URLSearchParams {
  const p = new URLSearchParams();
  p.set("vehicle", ctx.vehicleSlug);
  p.set("vehicleTitle", ctx.vehicleTitle);
  if (ctx.fuel) p.set("fuel", ctx.fuel);
  if (ctx.year) p.set("year", ctx.year);
  return p;
}

/** 상품·배터리 상세·주문 링크에 차량 컨텍스트 유지 */
export function appendVehicleCheckoutQuery(href: string, ctx: VehicleCheckoutContext | null): string {
  if (!ctx) return href;
  const [path, hash = ""] = href.split("#");
  const [base, query = ""] = path.split("?");
  const merged = new URLSearchParams(query);
  const vehicleQ = vehicleCheckoutContextToQuery(ctx);
  vehicleQ.forEach((v, k) => merged.set(k, v));
  const q = merged.toString();
  const withQuery = q ? `${base}?${q}` : base;
  return hash ? `${withQuery}#${hash}` : withQuery;
}

export function vehicleContextToOrderVehicle(
  ctx: VehicleCheckoutContext,
  batterySpec?: string,
): OrderRequestVehicle {
  return {
    name: ctx.vehicleTitle,
    year: ctx.year,
    fuelType: ctx.fuel,
    currentBatterySpec: batterySpec,
  };
}

export function vehicleContextFromCartItem(item: BatteryCartItem): VehicleCheckoutContext | null {
  const v = item.vehicle;
  if (!v?.displayName?.trim() && !v?.vehicleId?.trim()) return null;
  return {
    vehicleSlug: v.vehicleId?.trim() || v.displayName!.trim(),
    vehicleTitle: v.displayName!.trim(),
    fuel: v.fuelType ?? v.generationName,
    year: v.year,
  };
}

export function orderVehicleFromCartItem(item: BatteryCartItem): OrderRequestVehicle {
  const v = item.vehicle;
  const name = v?.displayName?.trim() || item.customerMemo?.trim();
  if (!name) return {};
  return {
    name,
    year: v?.year,
    fuelType: v?.fuelType ?? v?.generationName,
    currentBatterySpec: item.batterySpec,
  };
}

export function createCartItemWithVehicleContext(
  input: CreateCartItemInput,
  ctx: VehicleCheckoutContext | null,
): BatteryCartItem {
  if (ctx?.vehicleSlug && ctx.vehicleTitle) {
    const item = createCartItemFromVehicleBattery({
      batteryCode: input.batteryCode,
      vehicleSlug: ctx.vehicleSlug,
      vehicleTitle: ctx.vehicleTitle,
      fuelLabel: ctx.fuel,
      year: ctx.year,
      usedBatteryReturnOption: input.usedBatteryReturnOption as BatteryReturnOption | undefined,
    });
    return {
      ...item,
      brandName: input.brandName ?? item.brandName,
      imageSrc: input.imageSrc ?? item.imageSrc,
      fulfillment: input.fulfillmentMethod
        ? { method: input.fulfillmentMethod }
        : item.fulfillment,
      quantity: input.quantity ?? item.quantity,
      source: input.source ?? item.source,
    };
  }
  return createCartItemFromBattery(input);
}

export function enrichCartItemWithVehicleContext(
  item: BatteryCartItem,
  ctx: VehicleCheckoutContext | null,
): BatteryCartItem {
  if (!ctx || item.vehicle?.displayName?.trim()) return item;
  return {
    ...item,
    vehicle: {
      vehicleId: ctx.vehicleSlug,
      displayName: ctx.vehicleTitle,
      generationName: ctx.fuel,
      year: ctx.year,
      fuelType: ctx.fuel,
    },
    fitmentStatus: "confirmed",
    recommendationStatus: "vehicle_recommended",
  };
}

export type CheckoutVehicleDisplay = {
  label: string;
  needsVehicleConfirm: boolean;
  vehicleSlug?: string;
};

export function formatCheckoutVehicleDisplay(
  vehicle: OrderRequestVehicle | undefined,
  item?: BatteryCartItem,
): CheckoutVehicleDisplay {
  const name = vehicle?.name?.trim() || item?.vehicle?.displayName?.trim() || item?.customerMemo?.trim();
  if (!name) {
    return { label: "차량 기준 확인 필요", needsVehicleConfirm: true };
  }
  const parts = [name, vehicle?.year || item?.vehicle?.year, vehicle?.fuelType || item?.vehicle?.fuelType || item?.vehicle?.generationName].filter(
    Boolean,
  );
  return {
    label: parts.join(" · "),
    needsVehicleConfirm: false,
    vehicleSlug: item?.vehicle?.vehicleId,
  };
}
