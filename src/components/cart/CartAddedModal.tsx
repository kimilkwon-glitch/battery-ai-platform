"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { resolveCartItemBrandKey, resolveCartItemImageSrc } from "@/lib/cart/cart-item-brand";
import { batteryImageSetForCode } from "@/lib/battery-image";
import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import { BATTERY_RETURN_OPTIONS, type BatteryReturnOption } from "@/lib/shop-order-types";
import { CART_PAGE } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";
import type { BatteryCartItem } from "@/types/cart";

function returnLabel(option: BatteryCartItem["usedBatteryReturn"]["option"]): string {
  if (option === "return") return "폐배터리 반납";
  if (option === "no_return") return "폐배터리 미반납";
  return BATTERY_RETURN_OPTIONS.find((o) => o.id === "return")?.label ?? "반납 조건 상담";
}

function terminalLine(dir?: BatteryCartItem["terminalDirection"]): string {
  if (dir === "L") return "L단자";
  if (dir === "R") return "R단자";
  return "단자 확인 필요";
}

export function CartAddedModal({
  item,
  returnOption,
  onClose,
}: {
  item: BatteryCartItem | null;
  returnOption?: BatteryReturnOption;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [item, onClose]);

  if (!item) return null;

  const returnText =
    returnOption != null
      ? BATTERY_RETURN_OPTIONS.find((o) => o.id === returnOption)?.label ?? returnLabel(item.usedBatteryReturn.option)
      : returnLabel(item.usedBatteryReturn.option);

  const specLine = [
    item.brandName,
    item.batterySpec,
    terminalLine(item.terminalDirection),
  ]
    .filter(Boolean)
    .join(" · ");
  const imageSrc = resolveCartItemImageSrc(item);
  const imageSet = batteryImageSetForCode(
    item.batterySpec,
    resolveCartItemBrandKey({
      brandId: item.brandId,
      brandName: item.brandName,
      batteryCode: item.batterySpec,
    }),
  );

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-added-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className={`${bm.card} relative z-10 w-full max-w-md overflow-hidden p-5 shadow-2xl sm:p-6`}>
        <h2 id="cart-added-title" className="text-lg font-black text-slate-950">
          {item.batterySpec}이 장바구니에 담겼습니다.
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-600">
          수량·수령 방식은 장바구니에서 확인할 수 있습니다.
        </p>

        <div className="mt-4 flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-slate-100">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt=""
                width={64}
                height={64}
                className="size-full object-contain"
              />
            ) : (
              <BatteryThumbnail
                code={item.batterySpec}
                imageSet={imageSet}
                role="main"
                ratio="1/1"
                className="size-full"
              />
            )}
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-black text-slate-900">{item.productName}</p>
            <p className="mt-0.5 font-bold text-slate-600">{specLine}</p>
            <p className="mt-1 text-xs font-semibold text-blue-800">{returnText}</p>
            {item.quantity > 1 ? (
              <p className="mt-0.5 text-xs font-bold text-slate-500">수량 {item.quantity}개</p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button type="button" className={`${bm.btnSecondary} min-h-[3rem] w-full text-sm font-black`} onClick={onClose}>
            계속 둘러보기
          </button>
          <Link
            href={CART_PAGE}
            className={`${bm.btnPrimary} min-h-[3rem] w-full justify-center text-sm font-black`}
            onClick={onClose}
          >
            장바구니 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
