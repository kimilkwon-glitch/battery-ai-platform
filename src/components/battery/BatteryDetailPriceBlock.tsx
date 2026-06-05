import { getBatteryPrices, formatBatteryPriceWon } from "@/lib/battery-prices";
import type { BatteryBrandKey } from "@/lib/battery-alias-map";

type Props = {
  code: string;
  brandId: string;
  compact?: boolean;
};

/** 배터리 상세 — 택배발송가·출장교체가 분리 표시 */
export function BatteryDetailPriceBlock({ code, brandId, compact = false }: Props) {
  const brand = (brandId === "solite" ? "solite" : "rocket") as BatteryBrandKey;
  const { internetPriceWon, onsitePriceWon } = getBatteryPrices(brand, code);

  if (internetPriceWon == null && onsitePriceWon == null) {
    return (
      <p className={compact ? "text-base font-black text-slate-900" : "mt-5 text-xl font-black text-slate-900"}>
        상담 후 안내
      </p>
    );
  }

  return (
    <div
      className={compact ? "space-y-2" : "mt-5 space-y-3"}
      aria-label="가격 안내"
      data-battery-prices
    >
      {internetPriceWon != null ? (
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-bold text-slate-500">택배발송가</span>
          <span className="text-xl font-black text-slate-950 sm:text-2xl">
            {formatBatteryPriceWon(internetPriceWon)}
          </span>
        </div>
      ) : null}
      {onsitePriceWon != null ? (
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-bold text-slate-500">출장교체가</span>
          <span className="text-lg font-black text-blue-900 sm:text-xl">
            {formatBatteryPriceWon(onsitePriceWon)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
