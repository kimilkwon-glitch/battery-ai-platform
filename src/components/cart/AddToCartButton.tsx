"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  createCartItemFromBattery,
  createCartItemFromVehicleBattery,
  type CreateCartItemInput,
} from "@/lib/cart/cart-item-factory";
import { cartItemMergeKey, getCartItems } from "@/lib/cart/cart-storage";
import { CART_PAGE } from "@/lib/customer-center-routes";
import type { BatteryReturnOption } from "@/lib/shop-order-types";
import { bm } from "@/lib/design-tokens";
import { useBatteryCart } from "@/components/cart/BatteryCartProvider";
import { CartAddedModal } from "@/components/cart/CartAddedModal";
import type { BatteryCartItem, FulfillmentMethod } from "@/types/cart";

type Props = {
  className?: string;
  label?: string;
  variant?: "primary" | "secondary" | "tertiary" | "navy";
  showViewCartLink?: boolean;
  returnOption?: BatteryReturnOption;
  fulfillmentMethod?: FulfillmentMethod;
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

function resolveAddedLine(item: BatteryCartItem): BatteryCartItem {
  const key = cartItemMergeKey(item);
  const stored = getCartItems().find((i) => cartItemMergeKey(i) === key);
  return stored ?? item;
}

export function AddToCartButton({
  className,
  label = "장바구니 담기",
  variant = "secondary",
  showViewCartLink = false,
  returnOption,
  fulfillmentMethod,
  ...props
}: Props) {
  const { addItem } = useBatteryCart();
  const [modalItem, setModalItem] = useState<BatteryCartItem | null>(null);

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
        : createCartItemFromBattery({
            ...props.input,
            fulfillmentMethod: props.input.fulfillmentMethod ?? fulfillmentMethod,
          });
    addItem(item);
    setModalItem(resolveAddedLine(item));
  }, [addItem, props]);

  const btnClass =
    variant === "primary"
      ? bm.btnPrimary
      : variant === "navy"
        ? bm.btnNavy
        : variant === "tertiary"
          ? bm.btnTertiary
          : bm.btnSecondary;

  const modalReturnOption =
    returnOption ??
    (props.mode === "battery"
      ? (props.input.usedBatteryReturnOption === "no-return" ||
        props.input.usedBatteryReturnOption === "no_return"
          ? "no-return"
          : props.input.usedBatteryReturnOption === "return"
            ? "return"
            : undefined)
      : props.mode === "vehicle"
        ? props.usedBatteryReturnOption
        : undefined);

  return (
    <>
      <div className={className ?? "flex flex-col gap-2"}>
        <button
          type="button"
          className={`${btnClass} cursor-pointer justify-center font-black ${variant === "navy" || variant === "primary" ? "" : "text-sm"}`}
          onClick={onAdd}
        >
          {label}
        </button>
        {showViewCartLink ? (
          <Link href={CART_PAGE} className="text-center text-[10px] font-bold text-blue-700 hover:underline">
            장바구니 보기 →
          </Link>
        ) : null}
      </div>
      <CartAddedModal
        item={modalItem}
        returnOption={modalReturnOption}
        onClose={() => setModalItem(null)}
      />
    </>
  );
}
