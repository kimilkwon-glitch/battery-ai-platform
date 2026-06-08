import { SearchBatteryFocusBlock } from "@/components/platform/SearchBatteryFocusBlock";
import { bm } from "@/lib/design-tokens";
import { buildVehicleDetailSearchParity } from "@/lib/vehicle-detail-search-parity";

type Props = {
  slug: string;
  fuel?: string | null;
  yearChipId?: string | null;
  vehicleTitle: string;
};

export function VehicleDetailBatteryRecommendation({
  slug,
  fuel,
  yearChipId,
  vehicleTitle,
}: Props) {
  let parity;
  try {
    parity = buildVehicleDetailSearchParity(slug, { fuel, yearChipId });
  } catch (err) {
    console.error("[vehicle-detail-battery]", slug, err);
    return (
      <section className={`${bm.card} ${bm.cardPad}`}>
        <p className="text-sm font-medium text-slate-600">
          배터리 추천 정보를 불러오지 못했습니다. 고객센터로 문의해 주세요.
        </p>
      </section>
    );
  }

  const { recognizedVehicle, ux, intentLabel, displayQuery } = parity;

  return (
    <section className="vehicle-detail-battery-recommendation space-y-3" id="fuel-batteries">
      <div>
        <h2 className="text-lg font-black tracking-tight text-slate-950">추천 배터리</h2>
        <p className="mt-1 text-sm font-medium text-slate-600">
          {vehicleTitle} — 메인 검색과 동일한 규격·후보 기준으로 안내합니다.
        </p>
      </div>
      <SearchBatteryFocusBlock
        displayQuery={displayQuery}
        intentLabel={intentLabel}
        vehicle={recognizedVehicle}
        specOnly={null}
        compareBatteryCodes={parity.compareBatteryCodes}
        ux={ux}
        embedMode
      />
    </section>
  );
}
