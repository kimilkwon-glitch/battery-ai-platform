"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BatterySpecBadge } from "@/components/common/BatterySpecBadge";
import { bm } from "@/lib/design-tokens";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import {
  normalizeVehicleFuelParam,
  resolveVehicleFuelPrimaryBattery,
} from "@/lib/vehicle-fuel-primary-battery";
import {
  getRecordFuelLabel,
  groupRecordsByFuel,
  normalizeBatteryCode,
  type BatteryAlternative,
  type FuelBatteryGroup,
  type VehicleDbProfile,
  type YearChip,
} from "@/lib/vehicleBattery";

type Props = {
  slug: string;
  profile: VehicleDbProfile | null;
  fuelGroups: FuelBatteryGroup[];
  yearChips: YearChip[];
  relatedVehicles: { slug: string; title: string; battery: string }[];
  vehicleTitle: string;
  embedded?: boolean;
};

const FUEL_TABS = ["전체", "가솔린", "디젤", "LPG", "하이브리드", "전기"] as const;


function AlternativeBatteryChips({ alternatives }: { alternatives: BatteryAlternative[] }) {
  if (!alternatives.length) return null;
  const upgrades = alternatives.filter((a) => a.kind === "upgrade");
  const alternates = alternatives.filter((a) => a.kind === "alternate");

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {upgrades.map((alt) => (
        <Link
          key={alt.code}
          className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-800 ring-1 ring-blue-100"
          href={`/batteries/${encodeURIComponent(alt.code)}`}
        >
          {alt.code}
        </Link>
      ))}
      {alternates.map((alt) => (
        <Link
          key={alt.code}
          className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200"
          href={`/batteries/${encodeURIComponent(alt.code)}`}
        >
          {alt.code}
        </Link>
      ))}
    </div>
  );
}

function recordStatusLabel(status: string): string {
  if (status === "confirmed") return "확정";
  if (status === "needs_review" || status === "raw") return "재확인";
  return "검수";
}

export function VehicleBatteryPanel({
  slug,
  profile,
  fuelGroups,
  yearChips,
  vehicleTitle,
  embedded = false,
}: Props) {
  const searchParams = useSearchParams();
  const highlightFuel = normalizeVehicleFuelParam(searchParams.get("fuel"));
  const highlightYear = searchParams.get("year");
  const initialFuel = highlightFuel ?? "전체";
  const [fuelTab, setFuelTab] = useState<string>(initialFuel);
  const [yearChip, setYearChip] = useState<string | null>(null);
  const [tableOpen, setTableOpen] = useState(false);

  useEffect(() => {
    if (highlightFuel) {
      setFuelTab(highlightFuel);
    }
    if (highlightYear && yearChips.some((c) => c.id === highlightYear)) {
      setYearChip(highlightYear);
    }
    if (highlightFuel || highlightYear) {
      const el = document.getElementById("fuel-card-focus");
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [highlightFuel, highlightYear, yearChips]);

  const fuelCards = useMemo(() => {
    const seen = new Set<string>();
    return fuelGroups.filter((g) => {
      if (!g.primaryBattery || seen.has(g.fuelLabel)) return false;
      seen.add(g.fuelLabel);
      return true;
    });
  }, [fuelGroups]);

  const filteredGroups = useMemo(() => {
    const seen = new Set<string>();
    let recs = fuelGroups.flatMap((g) => g.records).filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    if (fuelTab !== "전체") {
      recs = recs.filter((r) => getRecordFuelLabel(r) === fuelTab);
    }

    if (yearChip && yearChips.length) {
      const chip = yearChips.find((c) => c.id === yearChip);
      if (chip) {
        recs = recs.filter((r) => {
          if (chip.maxEndYear != null) {
            return (r.endYear !== null && r.endYear <= chip.maxEndYear) || (r.years?.includes("19") ?? false);
          }
          if (chip.minStartYear != null) {
            return (r.startYear !== null && r.startYear >= chip.minStartYear) || (r.years?.includes("20") ?? false);
          }
          return true;
        });
      }
    }

    return groupRecordsByFuel(recs);
  }, [fuelGroups, fuelTab, yearChip, yearChips]);

  const activeFuel =
    highlightFuel ?? (fuelTab !== "전체" ? fuelTab : null);
  const unifiedPrimaryForFuel = activeFuel
    ? resolveVehicleFuelPrimaryBattery(slug, activeFuel, { yearChipId: yearChip })
    : null;

  if (fuelGroups.length === 0) {
    return (
      <section className={`${bm.card} ${bm.cardPad}`} id="fuel-batteries">
        <p className="text-sm font-black text-slate-800">배터리 정보 준비 중</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          아직 등록된 차량 규격 정보가 없습니다. 차량 정보를 보내주시면 확인 후 반영할 수 있습니다.
        </p>
        <Link className={`${bm.btnPrimary} mt-3 inline-flex text-xs`} href="/ai">
          DB 등록 요청
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4" id={embedded ? undefined : "fuel-batteries"}>
      <div className={`${bm.card} ${bm.cardPad}`}>
        {embedded ? (
          <p className="mb-3 text-sm font-black text-slate-800">상세 규격 · 연료별 데이터</p>
        ) : null}

        {fuelCards.length > 1 ? (
          <>
            <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FUEL_TABS.filter((t) => t === "전체" || fuelGroups.some((g) => g.fuelLabel === t)).map((tab) => (
                <button
                  className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-black transition ${
                    fuelTab === tab ? "bg-[var(--bm-primary)] text-white shadow-sm" : `${bm.badge} ${bm.badgeGray}`
                  }`}
                  key={tab}
                  onClick={() => setFuelTab(tab)}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>
            {yearChips.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {yearChips.map((chip) => (
                  <button
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-black ring-1 transition ${
                      yearChip === chip.id
                        ? "bg-[var(--bm-primary)] text-white ring-[var(--bm-primary)]"
                        : "bg-white text-slate-700 ring-[var(--bm-border)] hover:ring-blue-200"
                    }`}
                    key={chip.id}
                    onClick={() => setYearChip(yearChip === chip.id ? null : chip.id)}
                    type="button"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {fuelCards.length > 1 && filteredGroups.length > 0 && fuelTab !== "전체" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredGroups.map((group) => (
            <article key={`detail-${group.fuelLabel}`} className={`${bm.card} ${bm.cardPad}`}>
              <BatterySpecBadge tone="blue">{group.fuelLabel}</BatterySpecBadge>
              <p className="mt-2 text-sm font-bold text-slate-600">{group.yearSummary}</p>
              <AlternativeBatteryChips alternatives={group.alternatives} />
            </article>
          ))}
        </div>
      ) : null}

      <div className={bm.card}>
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-left"
          onClick={() => setTableOpen((v) => !v)}
          type="button"
        >
          <span className="text-sm font-black text-slate-950">전체 상세표</span>
          <span className="text-xs font-black text-[var(--bm-primary)]">{tableOpen ? "접기" : "펼치기"}</span>
        </button>
        {tableOpen ? (
          <div className="border-t border-slate-100 px-4 pb-4 pt-2">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-[11px]">
                <thead className="text-slate-400">
                  <tr>
                    {["연료", "연식", "추천", "상태"].map((h) => (
                      <th className="px-2 py-1 font-black" key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fuelGroups.flatMap((g) =>
                    g.records.map((r) => (
                      <tr className="border-t border-slate-100" key={r.id}>
                        <td className="px-2 py-2 font-bold">{g.fuelLabel}</td>
                        <td className="px-2 py-2">{r.years ?? "-"}</td>
                        <td className="px-2 py-2 font-black text-[var(--bm-primary)]">
                          {unifiedPrimaryForFuel && getRecordFuelLabel(r) === activeFuel
                            ? unifiedPrimaryForFuel
                            : canonicalBatteryCode(r.primaryBattery)}
                        </td>
                        <td className="px-2 py-2 text-slate-500">{recordStatusLabel(r.status)}</td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
