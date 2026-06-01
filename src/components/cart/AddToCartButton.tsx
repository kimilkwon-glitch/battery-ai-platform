"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  createCartItemFromBattery,
  createCartItemFromVehicleBattery,
  type CreateCartItemInput,
} from "@/lib/cart/cart-item-factory";
import { CART_PAGE } from "@/lib/customer-center-routes";
import type { BatteryReturnOption } from "@/lib/shop-order-types";
import { bm } from "@/lib/design-tokens";
import { useBatteryCart } from "@/components/cart/BatteryCartProvider";
import { CartToast } from "@/components/cart/CartToast";

type Props = {
  className?: string;
  label?: string;
  variant?: "primary" | "secondary" | "tertiary";
  showViewCartLink?: boolean;
} & (
  | {
      mode: "battery";
      input: CreateCartItemInput;
    }
  | {
      mode: "vehicle";
      batteryCode: string;
      vehicleSlug: string;
      vehicleTitle: string;
      fuelLabel?: string;
      usedBatteryReturnOption?: BatteryReturnOption;
    }
);

export function AddToCartButton({
  className,
  label = "장바구니 담기",
  variant = "secondary",
  showViewCartLink = false,
  ...props
}: Props) {
  const { addItem } = useBatteryCart();
  const [toast, setToast] = useState(false);

  const onAdd = useCallback(() => {
    const item =
      props.mode === "vehicle"
        ? createCartItemFromVehicleBattery({
            batteryCode: props.batteryCode,
            vehicleSlug: props.vehicleSlug,
            vehicleTitle: props.vehicleTitle,
            fuelLabel: props.fuelLabel,
            usedBatteryReturnOption: props.usedBatteryReturnOption,
          })
        : createCartItemFromBattery(props.input);
    addItem(item);
    setToast(true);
  }, [addItem, props]);

  const btnClass =
    variant === "primary"
      ? bm.btnPrimary
      : variant === "tertiary"
        ? bm.btnTertiary
        : bm.btnSecondary;

  return (
    <>
      <div className={className ?? "flex flex-col gap-2"}>
        <button type="button" className={`${btnClass} text-xs sm:text-sm`} onClick={onAdd}>
          {label}
        </button>
        {showViewCartLink ? (
          <Link href={CART_PAGE} className="text-center text-[10px] font-bold text-blue-700 hover:underline">
            장바구니 보기 →
          </Link>
        ) : null}
      </div>
      <CartToast message="장바구니에 담았습니다." visible={toast} onDismiss={() => setToast(false)} />
    </>
  );
}
