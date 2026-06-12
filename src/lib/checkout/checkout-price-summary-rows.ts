import { CUSTOMER_PRICE_LABELS } from "@/lib/pricing/customer-price-labels";
import type { CommerceOrderPriceSnapshot } from "@/types/commerce-order";
import type { OrderRequestFulfillmentMethod } from "@/types/order-request";

export type CheckoutPriceSummaryRow = {
  label: string;
  amount: number | null;
  prefix?: string;
  highlight?: boolean;
};

export function buildCheckoutPriceSummaryRows(
  priceLines: CommerceOrderPriceSnapshot[],
  method: OrderRequestFulfillmentMethod,
  batteryReturnFee: number,
): CheckoutPriceSummaryRow[] {
  const rows: CheckoutPriceSummaryRow[] = [];

  if (method === "delivery") {
    let productTotal = 0;
    let deliveryFee = 0;
    let hasProduct = false;
    for (const line of priceLines) {
      if (line.lineTotal == null) continue;
      const qty = line.quantity ?? 1;
      const unitProduct = line.internetPrice ?? line.productAmount ?? 0;
      productTotal += unitProduct * qty;
      deliveryFee += (line.deliveryFee ?? 0) * qty;
      hasProduct = true;
    }
    rows.push({
      label: CUSTOMER_PRICE_LABELS.productPurchase,
      amount: hasProduct ? productTotal : null,
    });
    rows.push({ label: CUSTOMER_PRICE_LABELS.deliveryFee, amount: deliveryFee, prefix: "+" });
  } else if (method === "visit_install") {
    let onsiteTotal = 0;
    let hasOnsite = false;
    for (const line of priceLines) {
      if (line.lineTotal == null) continue;
      const qty = line.quantity ?? 1;
      const onsiteUnit = line.onsitePrice ?? line.productAmount ?? 0;
      onsiteTotal += onsiteUnit * qty;
      hasOnsite = true;
    }
    rows.push({
      label: CUSTOMER_PRICE_LABELS.mobileInstall,
      amount: hasOnsite ? onsiteTotal : null,
    });
  } else if (method === "store_install") {
    let onsiteTotal = 0;
    let discountTotal = 0;
    let hasOnsite = false;
    for (const line of priceLines) {
      if (line.lineTotal == null) continue;
      const qty = line.quantity ?? 1;
      const onsiteUnit = line.onsitePrice ?? line.productAmount ?? 0;
      onsiteTotal += onsiteUnit * qty;
      discountTotal += (line.storeInstallDiscount ?? 0) * qty;
      hasOnsite = true;
    }
    rows.push({
      label: CUSTOMER_PRICE_LABELS.mobileInstall,
      amount: hasOnsite ? onsiteTotal : null,
    });
    if (discountTotal > 0) {
      rows.push({
        label: CUSTOMER_PRICE_LABELS.storeVisitDiscount,
        amount: discountTotal,
        prefix: "-",
      });
    }
  } else if (method === "store_pickup_self") {
    let productTotal = 0;
    let hasProduct = false;
    for (const line of priceLines) {
      if (line.lineTotal == null) continue;
      const qty = line.quantity ?? 1;
      const unitProduct = line.internetPrice ?? line.productAmount ?? 0;
      productTotal += unitProduct * qty;
      hasProduct = true;
    }
    rows.push({
      label: CUSTOMER_PRICE_LABELS.productPurchase,
      amount: hasProduct ? productTotal : null,
    });
  }

  if (batteryReturnFee > 0) {
    rows.push({
      label: CUSTOMER_PRICE_LABELS.noReturnSurcharge,
      amount: batteryReturnFee,
      prefix: "+",
      highlight: true,
    });
  }

  return rows;
}
