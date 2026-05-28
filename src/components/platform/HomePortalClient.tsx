"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExploreVehicleCard } from "@/components/platform/ExploreVehicleCard";
import {
  getVehicleAssetsByBrand,
  vehicleAssetHref,
  vehicleAssets,
  type CarBrandKey,
  type VehicleAsset,
} from "@/lib/car-assets";
import { getBattery, diagnosisHref, guideHref, searchHref, vehicles } from "@/lib/platform-data";
import { getVehicleCardHints } from "@/lib/vehicle-card-hints";
import { bm } from "@/lib/design-tokens";

const PREVIEW_PAGE_SIZE = 12;
const PREVIEW_LOAD_INCREMENT = 12;
const MAX_MAIN_PREVIEW = 24;

const problemCards = [
  { title: "시동이 늦게 걸려요", href: diagnosisHref("slow-engine-start"), meta: "CCA·SOH 확인" },
  { title: "블랙박스 때문에 방전돼요", href: diagnosisHref("blackbox-drain"), meta: "대기전류" },
  { title: "AGM 꼭 써야 하나요?", href: guideHref("agm-vs-din"), meta: "AGM vs DIN" },
  { title: "겨울철 방전이 자주 돼요", href: diagnosisHref("winter-discharge"), meta: "저온 CCA" },
];

const featureLinks = [
  ["통합검색", "/search", "차량·규격·증상"],
  ["증상 확인", "/diagnosis", "원인·긴급도"],
  ["배터리 Q&A", "/community", "호환·교체"],
  ["사진 규격 확인", "/analysis/photo", "OCR·단자"],
  ["배터리 비교", "/compare", "2종 비교"],
  ["차종별 가이드", "/guides", "연료·연식"],
  ["규격 가이드", "/guide/spec", "AGM/DIN"],
  ["매장·출장", "/service-center", "직영·출장·상담"],
  ["택배·쇼핑", "/shop", "주문 전 확인"],
];

const brandFilters = ["전체", "현대", "기아", "제네시스", "수입차"] as const;
const typeFilters = ["전체", "승용", "SUV", "상용", "하이브리드", "EV"] as const;
const batteryTypeFilters = ["전체", "AGM", "DIN", "일반"] as const;
const fuelFilters = ["전체", "가솔린", "디젤", "LPG", "하이브리드"] as const;

type BrandFilter = (typeof brandFilters)[number];
type TypeFilter = (typeof typeFilters)[number];
type BatteryTypeFilter = (typeof batteryTypeFilters)[number];
type FuelFilter = (typeof fuelFilters)[number];

function matchesType(asset: VehicleAsset, type: TypeFilter): boolean {
  if (type === "전체") return true;
  const tags = asset.tags ?? [];
  if (type === "승용") return tags.includes("세단");
  if (type === "SUV") return tags.includes("SUV");
  if (type === "상용") return tags.some((t) => ["상용차", "트럭", "밴"].includes(t));
  if (type === "하이브리드") return tags.includes("하이브리드");
  if (type === "EV") return tags.includes("EV");
  return true;
}

function matchesBatteryType(vehicleId: string, filter: BatteryTypeFilter): boolean {
  if (filter === "전체") return true;
  const hints = getVehicleCardHints(vehicleId);
  const code = hints.primaryCode;
  if (code === "정보 준비중" || code === "사진 확인 필요") return filter === "일반";
  const bat = getBattery(code);
  if (filter === "AGM") return bat.type === "AGM";
  if (filter === "DIN") return bat.type === "DIN";
  if (filter === "일반") return bat.type !== "AGM" && bat.type !== "DIN";
  return true;
}

function matchesFuel(asset: VehicleAsset, filter: FuelFilter): boolean {
  if (filter === "전체") return true;
  const tags = asset.tags ?? [];
  const notes = `${asset.batteryNotes ?? ""} ${asset.displayName}`.toLowerCase();
  if (filter === "하이브리드") return tags.includes("하이브리드") || notes.includes("hev") || notes.includes("하이브리드");
  if (filter === "LPG") return notes.includes("lpg");
  if (filter === "디젤") return notes.includes("디젤");
  if (filter === "가솔린") return !tags.includes("하이브리드") && !tags.includes("EV") && !notes.includes("lpg");
  return true;
}

function FilterRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={bm.filterChipRowLabel}>{label}</span>
      <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`${bm.filterChip} ${value === opt ? bm.filterChipOn : bm.filterChipOff}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HomePortalClient() {
  const [brand, setBrand] = useState<BrandFilter>("전체");
  const [vehicleType, setVehicleType] = useState<TypeFilter>("전체");
  const [batteryType, setBatteryType] = useState<BatteryTypeFilter>("전체");
  const [fuel, setFuel] = useState<FuelFilter>("전체");
  const [visibleCount, setVisibleCount] = useState(PREVIEW_PAGE_SIZE);

  const filteredAssets = useMemo(() => {
    let list = vehicleAssets;

    if (brand === "현대") {
      list = getVehicleAssetsByBrand("hyundai" as CarBrandKey);
    } else if (brand === "기아") {
      list = getVehicleAssetsByBrand("kia" as CarBrandKey);
    } else if (brand === "제네시스") {
      list = [];
    } else if (brand === "수입차") {
      list = [];
    }

    return list.filter(
      (asset) =>
        matchesType(asset, vehicleType) &&
        matchesBatteryType(asset.catalogId ?? asset.id, batteryType) &&
        matchesFuel(asset, fuel),
    );
  }, [brand, vehicleType, batteryType, fuel]);

  const bmwVehicles = useMemo(
    () => (brand === "수입차" || brand === "전체" ? vehicles.filter((v) => v.brand === "BMW") : []),
    [brand],
  );

  const showBmw = brand === "수입차" || brand === "전체";

  const allPreviewItems = useMemo(() => {
    const items: { key: string; vehicleId: string; title: string; href: string }[] = [];
    if (showBmw) {
      for (const v of bmwVehicles) {
        items.push({
          key: v.id,
          vehicleId: v.id,
          title: v.displayName,
          href: searchHref(`${v.displayName} ${v.batteryCode}`),
        });
      }
    }
    for (const asset of filteredAssets) {
      items.push({
        key: asset.id,
        vehicleId: asset.catalogId ?? asset.id,
        title: asset.displayName,
        href: vehicleAssetHref(asset),
      });
    }
    return items;
  }, [showBmw, bmwVehicles, filteredAssets]);

  const visibleItems = allPreviewItems.slice(0, visibleCount);
  const cappedTotal = Math.min(allPreviewItems.length, MAX_MAIN_PREVIEW);
  const hasMore = visibleCount < cappedTotal;

  function resetVisibleOnFilter() {
    setVisibleCount(PREVIEW_PAGE_SIZE);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.06em] text-[#2563EB]">FAQ</p>
        <h2 className="mt-1 text-xl font-black text-[#0F172A]">자주 묻는 문제</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {problemCards.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-md"
            >
              <p className="text-sm font-black text-slate-900">{p.title}</p>
              <p className="mt-1 text-[11px] font-bold text-blue-600">{p.meta}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.06em] text-[#2563EB]">바로가기</p>
        <h2 className="mt-1 text-xl font-black text-[#0F172A]">빠른가기</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {featureLinks.map(([label, href, desc]) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl border border-slate-200 bg-white px-2 py-3 text-center shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <p className="text-[11px] font-black text-slate-900">{label}</p>
              <p className={`mt-0.5 ${bm.typoCaption}`}>{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wide text-blue-600">탐색</p>
            <h2 className="text-xl font-black text-slate-950">주요 차량 배터리 미리보기</h2>
            <p className="mt-1 text-xs font-semibold text-[#64748B]">
              일부 차종만 미리 보여드립니다. 더 많은 차량은 차종 검색에서 확인하세요.
            </p>
          </div>
          <Link
            className="shrink-0 whitespace-nowrap rounded-full bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700"
            href="/vehicles"
          >
            전체 차종 보기
          </Link>
        </div>

        <div className="mb-5 space-y-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <FilterRow
            label="브랜드"
            options={brandFilters}
            value={brand}
            onChange={(v) => {
              setBrand(v);
              resetVisibleOnFilter();
            }}
          />
          <FilterRow
            label="차종"
            options={typeFilters}
            value={vehicleType}
            onChange={(v) => {
              setVehicleType(v);
              resetVisibleOnFilter();
            }}
          />
          <FilterRow
            label="배터리"
            options={batteryTypeFilters}
            value={batteryType}
            onChange={(v) => {
              setBatteryType(v);
              resetVisibleOnFilter();
            }}
          />
          <FilterRow
            label="연료"
            options={fuelFilters}
            value={fuel}
            onChange={(v) => {
              setFuel(v);
              resetVisibleOnFilter();
            }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {visibleItems.map((item) => (
            <ExploreVehicleCard
              key={item.key}
              href={item.href}
              title={item.title}
              vehicleId={item.vehicleId}
            />
          ))}
        </div>

        {allPreviewItems.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-slate-500">
            선택한 조건에 맞는 차종이 없습니다. 필터를 조정해 보세요.
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {hasMore ? (
            <button
              type="button"
              onClick={() =>
                setVisibleCount((c) =>
                  Math.min(c + PREVIEW_LOAD_INCREMENT, MAX_MAIN_PREVIEW, allPreviewItems.length),
                )
              }
              className="rounded-full border border-blue-200 bg-white px-5 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-50"
            >
              더 보기 (+{PREVIEW_LOAD_INCREMENT})
            </button>
          ) : null}
          <Link className="text-xs font-black text-blue-600 hover:underline" href="/vehicles">
            전체 {allPreviewItems.length}개 차종 페이지 →
          </Link>
        </div>
      </section>
    </div>
  );
}
