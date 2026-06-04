import { Star } from "lucide-react";
import {
  formatCatalogPriceWon,
  type HomeCatalogCardDisplay,
} from "@/lib/home-catalog-card-display";

type Props = {
  display: HomeCatalogCardDisplay;
};

/** 메인 라인업 카드 — 평점·차종·가격 메타 */
export function HomeSpecCardDisplayMeta({ display }: Props) {
  return (
    <div className="home-spec-card-meta">
      <p className="home-spec-card-rating" aria-label={`평점 ${display.rating}, 후기 ${display.reviewCount}건`}>
        <Star className="home-spec-card-rating__icon" strokeWidth={2} aria-hidden />
        <span className="home-spec-card-rating__score">{display.rating.toFixed(1)}</span>
        <span className="home-spec-card-rating__reviews">(후기 {display.reviewCount})</span>
      </p>

      <p className="home-spec-card-vehicles">
        <span className="home-spec-card-vehicles__label">대표 적용</span>
        <span className="home-spec-card-vehicles__list">{display.representativeVehicles}</span>
      </p>

      <div className="home-spec-card-prices" aria-label="가격 안내">
        <div className="home-spec-card-price home-spec-card-price--onsite">
          <span className="home-spec-card-price__label">출장가</span>
          <span className="home-spec-card-price__amount">{formatCatalogPriceWon(display.onsitePriceWon)}</span>
        </div>
        <div className="home-spec-card-price home-spec-card-price--internet">
          <span className="home-spec-card-price__label">인터넷가</span>
          <span className="home-spec-card-price__amount">{formatCatalogPriceWon(display.internetPriceWon)}</span>
        </div>
      </div>
    </div>
  );
}
