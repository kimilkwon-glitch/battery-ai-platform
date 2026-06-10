"use client";

import { FULFILLMENT_PRICE_LABELS } from "@/lib/pricing/order-price";
import type { FulfillmentMethodCardMeta } from "@/lib/pricing/fulfillment-method-card-meta";

type Props = {
  meta: FulfillmentMethodCardMeta;
  active: boolean;
  priceLabel?: string | null;
  onSelect: () => void;
  dataAttr?: string;
};

export function FulfillmentMethodCardButton({
  meta,
  active,
  priceLabel,
  onSelect,
  dataAttr,
}: Props) {
  const label = FULFILLMENT_PRICE_LABELS[meta.priceType];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      data-checkout-fulfillment={dataAttr ?? meta.value}
      className={`product-fulfillment-card checkout-fulfillment-card ${meta.cardClass}${
        active ? " product-fulfillment-card--active checkout-fulfillment-card--active" : ""
      }`}
    >
      <span className="product-fulfillment-card__inner">
        <span className="product-fulfillment-card__row product-fulfillment-card__row--top">
          <span className="product-fulfillment-card__icon" aria-hidden>
            <Icon className="size-4" />
          </span>
          <span className="product-fulfillment-card__label-wrap">
            <span className="product-fulfillment-card__label">{label}</span>
            {meta.recommended ? (
              <span className="product-fulfillment-card__badge">추천</span>
            ) : null}
          </span>
        </span>
        {priceLabel ? (
          <span className="product-fulfillment-card__price">{priceLabel}</span>
        ) : null}
      </span>
    </button>
  );
}
