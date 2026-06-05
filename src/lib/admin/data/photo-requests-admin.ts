import type { AdminOrderRequestListItem, PhotoCheckRequestItem, PhotoCheckRequestStatus } from "@/types/order-request";

function mapPhotoStatus(flags: AdminOrderRequestListItem["reviewFlags"]): PhotoCheckRequestStatus {
  if (flags.includes("photo_check_needed")) return "received";
  return "on_hold";
}

export function buildPhotoCheckRequestItems(
  orders: AdminOrderRequestListItem[],
): PhotoCheckRequestItem[] {
  return orders
    .filter((o) => o.reviewFlags.includes("photo_check_needed"))
    .map((o) => ({
      id: o.id,
      requestNumber: o.requestNumber,
      requestedAt: o.createdAt,
      customerName: o.customerName,
      customerPhoneMasked: o.customerPhoneMasked,
      vehicleName: o.vehicleSummary.split(" · ")[0] ?? o.vehicleSummary,
      vehicleYear: o.vehicleSummary.split(" · ")[1],
      photoCount: 0,
      status: mapPhotoStatus(o.reviewFlags),
      hasInternalMemo: o.hasInternalMemo,
      reviewFlags: o.reviewFlags,
    }));
}
