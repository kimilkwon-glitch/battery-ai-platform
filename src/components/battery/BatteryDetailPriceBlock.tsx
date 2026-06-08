import { getBatteryPrices, formatBatteryPriceWon } from "@/lib/battery-prices";
import { CUSTOMER_DETAIL_PRICE_LABELS } from "@/lib/pricing/customer-price-labels";
import type { BatteryBrandKey } from "@/lib/battery-alias-map";

type Props = {
  code: string;
  brandId: string;
  compact?: boolean;
};

/** 배터리 상세 — 제품 구매가·출장 교체가 */
export function BatteryDetailPriceBlock({ code, brandId, compact = false }: Props) {
  const brand = (brandId === "solite" ? "solite" : "rocket") as BatteryBrandKey;
  const { internetPriceWon, onsitePriceWon } = getBatteryPrices(brand, code);

  if (internetPriceWon == null && onsitePriceWon == null) {
    return (
      <p className={compact ? "text-base font-black text-slate-900" : "mt-5 text-xl font-black text-slate-900"}>
        가격 문의
      </p>
    );
  }

  return (
    <div
      className={compact ? "battery-detail-prices space-y-2.5" : "battery-detail-prices mt-5 space-y-3"}
      aria-label="가격 안내"
      data-battery-prices
    >
      {internetPriceWon != null ? (
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-bold text-[#64748B]">
            {CUSTOMER_DETAIL_PRICE_LABELS.productPurchase}
          </span>
          <span className="text-xl font-black text-[#0F172A] sm:text-2xl">
            {formatBatteryPriceWon(internetPriceWon)}
          </span>
        </div>
      ) : null}
      {onsitePriceWon != null ? (
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-bold text-[#64748B]">
            {CUSTOMER_DETAIL_PRICE_LABELS.mobileInstall}
          </span>
          <span className="text-lg font-black text-[#1E3A8A] sm:text-xl">
            {formatBatteryPriceWon(onsitePriceWon)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
