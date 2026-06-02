import { SearchVehicleResultCard } from "@/components/platform/SearchVehicleResultCard";

export type VehicleSearchRow = {
  model: string;
  year: string;
  fuel: string;
  origin: string;
  recommend: string;
  upgrade: string;
  note?: string;
  href: string;
  imageSrc?: string | null;
  batteryNotes?: string;
  fuelHref?: string;
  needsReview?: boolean;
};

type Props = {
  rows: VehicleSearchRow[];
  /** 검색 결과 헤더 — 쿼리 표시 */
  query?: string;
  /** 전체 결과 수 (더보기 전) */
  totalCount?: number;
};

export function SearchVehicleResults({ rows, query, totalCount }: Props) {
  const count = totalCount ?? rows.length;
  const displayQuery = query?.trim();

  return (
    <div className="bm-search-vehicles" data-search-vehicle-results>
      {displayQuery ? (
        <header className="bm-search-vehicles__header">
          <div className="bm-search-vehicles__header-top">
            <h2 className="bm-search-vehicles__title">
              <span className="bm-search-vehicles__query">&ldquo;{displayQuery}&rdquo;</span> 검색 결과
            </h2>
            <span className="bm-search-vehicles__count">{count}개 모델</span>
          </div>
          <p className="bm-search-vehicles__hint">이미지와 연식으로 내 차량을 선택하세요.</p>
        </header>
      ) : null}

      <div className="bm-search-vehicles__grid">
        {rows.map((row, index) => {
          const showBatteryThumb =
            row.recommend === "AGM60L" || row.origin === "AGM60L";
          return (
            <SearchVehicleResultCard
              key={`${row.model}-${row.href}-${index}`}
              row={row}
              showBatteryThumb={showBatteryThumb}
            />
          );
        })}
      </div>
    </div>
  );
}
