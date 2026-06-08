"use client";

import Link from "next/link";
import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import { useCart } from "@/components/platform/CartContext";
import { formatBatteryPriceWon } from "@/lib/battery-prices";
import { getBattery, getShopProduct, shopProducts, serviceHref } from "@/lib/platform-data";

export function CartPageClient() {
  const { items, remove, setQty, count } = useCart();

  const lines = items.map((item) => {
    const product = getShopProduct(item.productId) ?? shopProducts[0];
    const battery = getBattery(product.batteryCode, product.brandId);
    const imageSet = product.brandId === "rocket" ? battery.images : undefined;
    return { item, product, battery, imageSet };
  });

  const total = lines.reduce((s, l) => s + (l.product.price ?? 0) * l.item.qty, 0);

  return (
    <div className="space-y-3">
      {lines.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center ring-1 ring-slate-200">
          <p className="text-sm font-black">장바구니가 비어 있습니다</p>
          <Link href="/search" className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white">
            차량·배터리 검색하기
          </Link>
        </div>
      ) : (
        <>
          {lines.map(({ item, product, battery, imageSet }) => (
            <div key={item.productId} className="grid gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200 md:grid-cols-[140px_1fr_auto]">
              <BatteryThumbnail code={battery.code} imageSet={imageSet} role="main" capacity={battery.capacity} cca={battery.cca} ratio="16/9" />
              <div>
                <p className="text-sm font-black">{product.name}</p>
                <p className="text-xs font-bold text-slate-500">{product.capacity} · {product.cca}</p>
                <p className="mt-1 text-xs font-black text-blue-600">
                  {formatBatteryPriceWon(product.price)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button type="button" onClick={() => setQty(item.productId, item.qty - 1)} className="size-7 rounded bg-slate-100 text-xs font-black">
                    −
                  </button>
                  <span className="text-xs font-black">{item.qty}</span>
                  <button type="button" onClick={() => setQty(item.productId, item.qty + 1)} className="size-7 rounded bg-slate-100 text-xs font-black">
                    +
                  </button>
                  <button type="button" onClick={() => remove(item.productId)} className="ml-2 text-[10px] font-black text-red-600">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-xl bg-blue-50 p-4 ring-1 ring-blue-100">
            <p className="text-sm font-black">합계 {total.toLocaleString()}원 · {count}개</p>
            <Link href={serviceHref()} className="mt-2 inline-block rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white">
              교체 문의하기
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
