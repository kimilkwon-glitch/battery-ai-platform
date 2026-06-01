"use client";

import Link from "next/link";
import { useState } from "react";
import { BatteryGallery } from "@/components/BatteryGallery";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { BuyNowButton } from "@/components/cart/BuyNowButton";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { getBatteryImageSet } from "@/lib/battery-alias-map";
import { batteryImageSetForCode } from "@/lib/battery-image";
import { bm } from "@/lib/design-tokens";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import {
  BATTERY_RETURN_OPTIONS,
  type BatteryReturnOption,
} from "@/lib/shop-order-types";
import { getBattery, getBrand, getVehicleName, type ShopProduct } from "@/lib/platform-data";

function typeLabel(product: ShopProduct): string {
  const t = product.type.toUpperCase();
  if (t.includes("AGM")) return "AGM";
  if (t.includes("DIN")) return "DIN";
  if (t.includes("EV")) return "EV 보조 12V";
  if (t.includes("CMF")) return "일반형";
  return "일반형";
}

export function ShopProductOrderPanel({
  product,
  onClose,
}: {
  product: ShopProduct;
  onClose?: () => void;
}) {
  const [returnOption, setReturnOption] = useState<BatteryReturnOption>("return");
  const b = getBattery(product.batteryCode, product.brandId);
  const brand = getBrand(product.brandId);
  const imageSet =
    product.brandId === "rocket"
      ? b.images?.main
        ? b.images
        : batteryImageSetForCode(product.batteryCode)
      : getBatteryImageSet(product.batteryCode, "solite");
  const parsed = parseBatterySpecDisplay(product.batteryCode);
  const vehicleChips = product.vehicleIds.slice(0, 5).map(getVehicleName);
  const specLine = `${brand.displayName} · ${typeLabel(product)} · ${product.capacity} · ${product.cca} · ${product.terminal}타입`;

  return (
    <section
      className="shop-order-panel overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md ring-1 ring-slate-100"
      id="shop-order-panel"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-blue-600">상품 주문</p>
          <h2 className="text-xl font-black text-slate-950 sm:text-2xl">{product.batteryCode}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">{specLine}</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700"
          >
            닫기
          </button>
        ) : null}
      </div>

      <div className="grid gap-5 p-4 sm:grid-cols-[minmax(0,200px)_1fr] sm:p-5 lg:grid-cols-[minmax(0,240px)_1fr]">
        <BatteryGallery
          code={product.batteryCode}
          imageSet={imageSet?.main ? imageSet : undefined}
          minHeightClass="min-h-[200px] sm:min-h-[240px]"
        />

        <div className="space-y-4">
          {vehicleChips.length > 0 ? (
            <div>
              <p className="text-xs font-black text-slate-500">대표 적용 차량</p>
              <p className="mt-1.5 text-sm font-semibold text-slate-700">{vehicleChips.join(" · ")}</p>
            </div>
          ) : null}

          <p className="text-lg font-black text-slate-900">상담 후 안내</p>

          <div>
            <p className="text-xs font-black text-slate-700">폐배터리 반납</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {BATTERY_RETURN_OPTIONS.map((opt) => {
                const selected = returnOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setReturnOption(opt.id)}
                    className={`rounded-lg px-3 py-2 text-sm font-black ring-1 transition ${
                      selected
                        ? "bg-blue-600 text-white ring-blue-600"
                        : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <BuyNowButton
              batteryCode={product.batteryCode}
              returnOption={returnOption}
              className="w-full py-3 sm:col-span-2"
            />
            <AddToCartButton
              mode="battery"
              variant="secondary"
              className="w-full sm:col-span-2"
              input={{
                batteryCode: product.batteryCode,
                usedBatteryReturnOption: returnOption,
                source: "battery_detail",
              }}
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link href={HUB_STORE_DETAIL} className="text-sm font-bold text-slate-600 hover:text-blue-700">
              매장·출장 상담
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
