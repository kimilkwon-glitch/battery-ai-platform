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
  let goodsAmount = 0;
  let hasGoods = false;

  for (const line of priceLines) {
    if (line.lineTotal == null) continue;
    const qty = line.quantity ?? 1;
    const unitProduct = line.productAmount ?? 0;
    const internetUnit = line.internetPrice ?? unitProduct;

    if (method === "delivery" || method === "store_pickup_self") {
      goodsAmount += unitProduct * qty;
      hasGoods = true;
    } else if (method === "visit_install" || method === "store_install") {
      goodsAmount += internetUnit * qty;
      hasGoods = true;
    }
  }

  rows.push({ label: "상품금액", amount: hasGoods ? goodsAmount : null });

  if (method === "delivery") {
    let fee = 0;
    for (const line of priceLines) {
      fee += (line.deliveryFee ?? 0) * (line.quantity ?? 1);
    }
    rows.push({ label: "택배비", amount: fee, prefix: "+" });
  } else if (method === "visit_install") {
    let fee = 0;
    for (const line of priceLines) {
      if (line.lineTotal == null) continue;
      const qty = line.quantity ?? 1;
      const productUnit = line.internetPrice ?? line.productAmount ?? 0;
      fee += line.lineTotal - productUnit * qty;
    }
    rows.push({ label: "출장/장착비", amount: fee, prefix: "+" });
  } else if (method === "store_install") {
    let fee = 0;
    for (const line of priceLines) {
      if (line.lineTotal == null) continue;
      const qty = line.quantity ?? 1;
      const productUnit = line.internetPrice ?? line.productAmount ?? 0;
      fee += line.lineTotal - productUnit * qty;
    }
    rows.push({ label: "매장 교체비", amount: fee, prefix: "+" });
  } else if (method === "store_pickup_self") {
    rows.push({ label: "수령비", amount: 0, prefix: "+" });
  }

  if (batteryReturnFee > 0) {
    rows.push({
      label: "폐배터리 미반납",
      amount: batteryReturnFee,
      prefix: "+",
      highlight: true,
    });
  }

  return rows;
}
