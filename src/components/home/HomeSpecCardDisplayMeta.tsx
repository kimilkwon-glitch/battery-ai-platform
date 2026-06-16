import Link from "next/link";
import { Star } from "lucide-react";
import {
  formatCatalogPriceWon,
  type HomeCatalogCardDisplay,
} from "@/lib/home-catalog-card-display";
import {
  buildPriceInquiryHref,
  isCatalogPriceMissing,
} from "@/lib/pricing/price-inquiry-link";
import { CUSTOMER_DETAIL_PRICE_LABELS } from "@/lib/pricing/customer-price-labels";

type Props = {
  display: HomeCatalogCardDisplay;
  productCode: string;
  productName: string;
  brandLabel: string;
};

function PriceInquiryLink({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: "internet" | "onsite";
}) {
  return (
    <Link
      href={href}
      className={`home-spec-card-price home-spec-card-price--${tone} home-spec-card-price--clickable`}
      aria-label={`${label} 가격문의`}
    >
      <span className="home-spec-card-price__label">{label}</span>
      <span className="home-spec-card-price__amount home-spec-card-price__inquiry-link">
        가격문의 <span className="home-spec-card-price__inquiry-hint">(클릭)</span>
      </span>
    </Link>
  );
}

/** 메인 라인업 카드 — 평점·차종·가격 메타 */
export function HomeSpecCardDisplayMeta({ display, productCode, productName, brandLabel }: Props) {
  const internetMissing = isCatalogPriceMissing(display.internetPriceWon);
  const onsiteMissing = isCatalogPriceMissing(display.onsitePriceWon);

  const priceInquiryHref = buildPriceInquiryHref({
    searchCode: productCode,
    displayName: productName,
    brandLabel,
  });

  return (
    <div className="home-spec-card-meta">
      <p className="home-spec-card-rating" aria-label={`평점 ${display.rating}, 후기 ${display.reviewCount}건`}>
        <Star className="home-spec-card-rating__icon" strokeWidth={2} aria-hidden />
        <span className="home-spec-card-rating__score">{display.rating.toFixed(1)}</span>
        <span className="home-spec-card-rating__reviews">(후기 {display.reviewCount})</span>
      </p>

      <p className="home-spec-card-vehicles">
        <span className="home-spec-card-vehicles__label">대표 적용:</span>{" "}
        <span className="home-spec-card-vehicles__list">{display.representativeVehicles}</span>
      </p>

      <div className="home-spec-card-prices" aria-label="가격 안내">
        {internetMissing ? (
          <PriceInquiryLink
            href={priceInquiryHref}
            label={CUSTOMER_DETAIL_PRICE_LABELS.productPurchase}
            tone="internet"
          />
        ) : (
          <div className="home-spec-card-price home-spec-card-price--internet">
            <span className="home-spec-card-price__label">
              {CUSTOMER_DETAIL_PRICE_LABELS.productPurchase}
            </span>
            <span className="home-spec-card-price__amount">
              {formatCatalogPriceWon(display.internetPriceWon)}
            </span>
          </div>
        )}
        {onsiteMissing ? (
          <PriceInquiryLink
            href={priceInquiryHref}
            label={CUSTOMER_DETAIL_PRICE_LABELS.mobileInstall}
            tone="onsite"
          />
        ) : (
          <div className="home-spec-card-price home-spec-card-price--onsite">
            <span className="home-spec-card-price__label">
              {CUSTOMER_DETAIL_PRICE_LABELS.mobileInstall}
            </span>
            <span className="home-spec-card-price__amount">
              {formatCatalogPriceWon(display.onsitePriceWon)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
