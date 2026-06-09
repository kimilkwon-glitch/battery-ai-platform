import { batteryDetailHref } from "@/lib/canonical-battery-code";
import { resolveBatteryImageSetForCode } from "@/lib/batteryImages";
import { batteryTalkCountByPhone } from "@/lib/battery-talk/battery-talk-store";
import { getVehicle, getVehicleName } from "@/lib/platform-data";
import {
  storeCommerceOrderGet,
  storeCommerceOrderLookupByRef,
} from "@/lib/payment/commerce-order-store";
import { CUSTOMER_FULFILLMENT_LABELS } from "@/lib/pricing/order-price";
import type { CommerceOrderRecord } from "@/types/commerce-payment";
import type { BatteryTalkContext, BatteryTalkThread } from "@/types/battery-talk";

export type BatteryTalkEnrichedOrder = {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  productName: string;
  batteryCode: string;
  finalAmount: number | null;
  fulfillmentLabel: string;
  returnBatteryOption: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
};

export type BatteryTalkEnrichedProduct = {
  productCode?: string;
  batteryCode?: string;
  productName?: string;
  imageUrl?: string;
  customerHref?: string;
};

export type BatteryTalkEnrichedVehicle = {
  vehicleSlug?: string;
  vehicleName?: string;
  selectedFuel?: string;
  customerHref?: string;
};

export type BatteryTalkThreadDetail = {
  thread: BatteryTalkThread;
  inquiryCount: number;
  order: BatteryTalkEnrichedOrder | null;
  product: BatteryTalkEnrichedProduct | null;
  vehicle: BatteryTalkEnrichedVehicle | null;
};

function fulfillmentLabel(type: CommerceOrderRecord["fulfillmentType"]): string {
  if (type in CUSTOMER_FULFILLMENT_LABELS) {
    return CUSTOMER_FULFILLMENT_LABELS[type as keyof typeof CUSTOMER_FULFILLMENT_LABELS];
  }
  return type;
}

async function resolveOrder(ctx: BatteryTalkContext): Promise<BatteryTalkEnrichedOrder | null> {
  let record: CommerceOrderRecord | null = null;
  if (ctx.orderId) {
    record = await storeCommerceOrderGet(ctx.orderId);
  }
  if (!record && ctx.orderNumber) {
    record = await storeCommerceOrderLookupByRef(ctx.orderNumber);
  }
  if (!record) return null;
  return {
    orderId: record.orderId,
    orderNumber: record.orderNumber,
    orderStatus: record.orderStatus,
    paymentStatus: record.paymentStatus,
    productName: record.productName,
    batteryCode: record.batteryCode,
    finalAmount: record.finalAmount,
    fulfillmentLabel: fulfillmentLabel(record.fulfillmentType),
    returnBatteryOption: record.returnBatteryOption,
    createdAt: record.createdAt,
    customerName: record.customerName,
    customerPhone: record.customerPhone,
  };
}

function resolveProduct(ctx: BatteryTalkContext): BatteryTalkEnrichedProduct | null {
  const code = ctx.batteryCode ?? ctx.productCode;
  if (!code && !ctx.productName) return null;
  const imageSet = code ? resolveBatteryImageSetForCode(code) : null;
  const href = code ? batteryDetailHref(code) : undefined;
  return {
    productCode: ctx.productCode,
    batteryCode: ctx.batteryCode ?? ctx.productCode,
    productName: ctx.productName,
    imageUrl: imageSet?.main ?? imageSet?.productBox ?? undefined,
    customerHref: href,
  };
}

function resolveVehicle(ctx: BatteryTalkContext): BatteryTalkEnrichedVehicle | null {
  if (!ctx.vehicleSlug && !ctx.vehicleName) return null;
  const name = ctx.vehicleName ?? (ctx.vehicleSlug ? getVehicleName(ctx.vehicleSlug) : undefined);
  const slug = ctx.vehicleSlug;
  const href = slug ? `/vehicles/${encodeURIComponent(slug)}` : undefined;
  return {
    vehicleSlug: slug,
    vehicleName: name ?? (slug ? getVehicle(slug).displayName : undefined),
    selectedFuel: ctx.selectedFuel,
    customerHref: href,
  };
}

export async function enrichBatteryTalkThread(
  thread: BatteryTalkThread,
): Promise<BatteryTalkThreadDetail> {
  const inquiryCount = await batteryTalkCountByPhone(thread.phone);
  const order = await resolveOrder(thread.context);
  const product = resolveProduct(thread.context);
  const vehicle = resolveVehicle(thread.context);
  return { thread, inquiryCount, order, product, vehicle };
}
