import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { searchVehicleCardLabels } from "@/lib/search/search-vehicle-card-display";
import type { VehicleSearchRow } from "@/components/platform/SearchVehicleResults";

type Props = {
  row: VehicleSearchRow;
};

/** 검색 결과·세대 선택 — 차량명·브랜드·연식·이미지만 표시 */
export function SearchVehicleResultCard({ row }: Props) {
  const { title, brand, yearRange, imageSrc } = searchVehicleCardLabels(row);
  const { href, fuelHref } = row;

  return (
    <article className="bm-search-vehicle-card">
      <Link href={href} className="bm-search-vehicle-card__primary group">
        <div className="bm-search-vehicle-card__media">
          <VehicleCardMedia
            alt={title}
            commercial={/porter|봉고|마이티|k3|쿱|koup/i.test(title)}
            className="bm-vehicle-card-media--search-result"
            placeholderTitle={title}
            src={imageSrc}
            variant="card"
          />
        </div>

        <div className="bm-search-vehicle-card__body">
          <div className="bm-search-vehicle-card__main">
            <h3 className="bm-search-vehicle-card__title">{title}</h3>
            <div className="bm-search-vehicle-card__identity">
              {brand ? <span className="bm-search-vehicle-card__brand">{brand}</span> : null}
              {yearRange ? (
                <span className="bm-search-vehicle-card__year">{yearRange}</span>
              ) : null}
            </div>
          </div>

          <div className="bm-search-vehicle-card__footer">
            <span className="bm-search-vehicle-card__cta">
              내 차 배터리 확인하기
              <ChevronRight className="size-4 shrink-0" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
      {fuelHref ? (
        <Link href={fuelHref} className="bm-search-vehicle-card__fuel-link">
          연료별 배터리
        </Link>
      ) : null}
    </article>
  );
}
