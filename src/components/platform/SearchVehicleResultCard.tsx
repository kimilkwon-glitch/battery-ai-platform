import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BatteryMiniThumb } from "@/components/BatteryThumbnail";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { getBattery } from "@/lib/platform-data";
import { cn } from "@/lib/utils";
import type { VehicleSearchRow } from "@/components/platform/SearchVehicleResults";

const CONCRETE_SPEC_RE = /^(AGM|DIN|GB|\d)/i;

function isConcreteSpec(value: string): boolean {
  const v = value.trim();
  if (!v || /확인|필요|사진/i.test(v)) return false;
  return CONCRETE_SPEC_RE.test(v);
}

function pickSpecLabel(row: VehicleSearchRow): { label: string; tone: "spec" | "hint" } {
  const candidate = row.recommend?.trim() || row.origin?.trim() || "";
  if (isConcreteSpec(candidate)) {
    return { label: candidate, tone: "spec" };
  }
  if (row.needsReview) {
    return { label: "대표 규격 확인", tone: "hint" };
  }
  return { label: "대표 규격 확인", tone: "hint" };
}

type Props = {
  row: VehicleSearchRow;
  showBatteryThumb?: boolean;
};

/** 검색 결과·세대 선택 전용 차량 카드 (자동완성 드롭다운과 분리) */
export function SearchVehicleResultCard({ row, showBatteryThumb }: Props) {
  const {
    model,
    year,
    fuel,
    note,
    href,
    imageSrc,
    batteryNotes,
    fuelHref,
    upgrade,
  } = row;
  const spec = pickSpecLabel(row);
  const agm60 = getBattery("AGM60L");
  const metaLine = [fuel, upgrade && upgrade !== "규격 확인" ? upgrade : null, note]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="bm-search-vehicle-card">
      <Link href={href} className="bm-search-vehicle-card__primary group">
      <div className="bm-search-vehicle-card__media">
        <VehicleCardMedia
          alt={model}
          commercial={/porter|봉고|마이티|k3|쿱|koup/i.test(model)}
          className="bm-vehicle-card-media--search-result"
          placeholderTitle={model}
          src={imageSrc?.trim() ? imageSrc : null}
          variant="card"
        />
        {showBatteryThumb ? (
          <span className="bm-search-vehicle-card__battery-thumb">
            <BatteryMiniThumb code="AGM60L" imageSet={agm60.images} role="main" className="h-11 w-11 shadow-md" />
          </span>
        ) : null}
      </div>

      <div className="bm-search-vehicle-card__body">
        <div className="bm-search-vehicle-card__main">
          <h3 className="bm-search-vehicle-card__title">{model}</h3>
          {year && year !== "-" ? (
            <span className="bm-search-vehicle-card__year">{year}</span>
          ) : null}
          {metaLine ? <p className="bm-search-vehicle-card__meta">{metaLine}</p> : null}
          {batteryNotes ? (
            <p className="bm-search-vehicle-card__notes">{batteryNotes}</p>
          ) : null}
          <div className="bm-search-vehicle-card__spec-row">
            <span
              className={cn(
                "bm-search-vehicle-card__spec",
                spec.tone === "spec" && "bm-search-vehicle-card__spec--code",
              )}
            >
              {spec.tone === "spec" ? `대표 ${spec.label}` : spec.label}
            </span>
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
