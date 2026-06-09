import { Car, Package, ShoppingBag, Wrench, type LucideIcon } from "lucide-react";
import type { FulfillmentMethod } from "@/types/cart";
import type { OrderRequestFulfillmentMethod } from "@/types/order-request";
import type { FulfillmentPriceType } from "@/lib/pricing/order-price";

export type FulfillmentCardMethod = FulfillmentMethod | OrderRequestFulfillmentMethod;

export type FulfillmentMethodCardMeta = {
  value: FulfillmentCardMethod;
  priceType: Exclude<FulfillmentPriceType, "undecided">;
  icon: LucideIcon;
  cardClass: string;
  recommended?: boolean;
};

export const FULFILLMENT_METHOD_CARD_META: FulfillmentMethodCardMeta[] = [
  {
    value: "delivery",
    priceType: "delivery",
    icon: Package,
    cardClass: "product-fulfillment-card--delivery",
    recommended: true,
  },
  {
    value: "visit_install",
    priceType: "onsite_install",
    icon: Car,
    cardClass: "product-fulfillment-card--visit",
  },
  {
    value: "store_install",
    priceType: "store_install",
    icon: Wrench,
    cardClass: "product-fulfillment-card--store-install",
  },
  {
    value: "store_pickup_self",
    priceType: "store_pickup_self",
    icon: ShoppingBag,
    cardClass: "product-fulfillment-card--pickup",
  },
];
