"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BatteryThumbnail, batteryImageFit } from "@/components/BatteryThumbnail";
import { carImageForPlatformVehicleId } from "@/lib/car-data";
import type { BatteryBrandKey } from "@/lib/battery-alias-map";
import { SmartNextActions } from "@/components/common/SmartNextActions";
import {
  BRAND_HUB_LABEL,
  BRAND_LINKED_HINT_PREFIX,
  BRAND_LINKED_VEHICLES_LABEL,
  brandSelectorMeta,
  brandSpecMatchingTable,
  getBrandProfile,
} from "@/lib/brand-hub-data";
import { batteries, brands, getBattery, getVehicleName, searchHref } from "@/lib/platform-data";

export function BrandHubClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [active, setActive] = useState(brands[0].id);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const b = params.get("brand");
    if (b && brands.some((x) => x.id === b)) setActive(b);
  }, [params]);

  const brand = brands.find((b) => b.id === active) ?? brands[0];
  const profile = getBrandProfile(active);
  const allProducts = batteries.filter((b) => b.brandId === active);
  const featuredSet = new Set(profile.featuredCodes);
  const featuredProducts = profile.featuredCodes.map((code) => getBattery(code, profile.imageBrandKey));
  const restProducts = allProducts.filter((p) => !featuredSet.has(p.code));

  const selectBrand = (id: string) => {
    setActive(id);
    setExpanded(false);
    router.replace(`/brands?brand=${id}`, { scroll: false });
  };

  const imageBrandKey = profile.imageBrandKey;

  return (
    <div className="space-y-5">
      {/* 브랜드 선택 */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => {
          const meta = brandSelectorMeta[b.id];
          const selected = active === b.id;
          const thumb = meta ? getBattery(meta.cardThumbCode, meta.imageBrandKey) : null;
          return (
            <button
              type="button"
              key={b.id}
              onClick={() => selectBrand(b.id)}
              className={`overflow-hidden rounded-2xl border p-3 text-left transition ${
                selected
                  ? "border-blue-600 bg-blue-600 text-white shadow-md"
                  : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm"
              }`}
            >
              {thumb?.images?.main ? (
                <div className={`mb-2 overflow-hidden rounded-lg ${selected ? "bg-white/95" : "bg-slate-50"} p-1 ring-1 ring-slate-200/80`}>
                  <div className="h-16">
                    <BatteryThumbnail
                      code={meta.cardThumbCode}
                      imageSet={thumb.images}
                      role="main"
                      fit="contain"
                      ratio="16/9"
                      overlayLabel={false}
                      darkOverlay={false}
                      className="h-full"
                    />
                  </div>
                </div>
              ) : null}
              <p className="text-sm font-black">{b.displayName}</p>
              <p className={`mt-0.5 text-[11px] font-semibold ${selected ? "text-blue-100" : "text-slate-500"}`}>
                {meta?.categoryLabel ?? b.line}
              </p>
              <p className={`mt-2 text-[10px] font-bold leading-relaxed ${selected ? "text-blue-100" : "text-slate-600"}`}>
                {(meta?.displayCodes ?? b.popularCodes.slice(0, 4)).join(" · ")}
              </p>
            </button>
          );
        })}
      </section>

      {/* 브랜드 요약 */}
      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <div className="border-b border-blue-50/80 bg-blue-50/25 p-5 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-blue-600">{BRAND_HUB_LABEL}</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">{brand.displayName} 배터리</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{profile.description}</p>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-[10px] font-black text-slate-400">대표 규격</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{profile.featuredCodes.join(", ")}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400">{BRAND_LINKED_VEHICLES_LABEL}</p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">
                  아래는 실차 적합 확정이 아닌, 문의·검색에서 자주 함께 확인되는 예시입니다.
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400">확인 포인트</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {profile.checkPoints.map((p) => (
                    <span key={p} className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-4">
            {profile.heroImageCodes.slice(0, 2).map((code) => {
              const bat = getBattery(code, imageBrandKey);
              return (
                <div key={code} className="overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200">
                  <p className="px-2 pt-2 text-[10px] font-black text-slate-400">{code}</p>
                  <div className="h-28">
                    <BatteryThumbnail
                      code={code}
                      imageSet={bat.images}
                      role="main"
                      fit={batteryImageFit(code, imageBrandKey)}
                      ratio="16/9"
                      overlayLabel={false}
                      darkOverlay={false}
                      className="h-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 대표 규격 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-black text-slate-900">{brand.displayName} 대표 규격</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((p) => (
            <FeaturedProductCard key={p.code} product={p} imageBrandKey={imageBrandKey} />
          ))}
        </div>

        {expanded && restProducts.length > 0 ? (
          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            {restProducts.map((p) => (
              <FeaturedProductCard
                key={p.code}
                product={getBattery(p.code, imageBrandKey)}
                imageBrandKey={imageBrandKey}
                compact
              />
            ))}
          </div>
        ) : null}

        {restProducts.length > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-xs font-black text-slate-600 hover:bg-white"
          >
            {expanded ? "접기" : `전체 ${brand.displayName} 규격 보기 (${restProducts.length + featuredProducts.length}개)`}
          </button>
        ) : null}
      </section>

      {/* 규격 매칭표 — 로케트/쏠라이트 중심 */}
      {(active === "rocket" || active === "solite") && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-black text-slate-900">브랜드별 규격 표기</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">같은 규격도 브랜드마다 제품 코드·표기가 다를 수 있습니다.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black text-slate-400">
                  <th className="pb-3 pr-4">대표 규격</th>
                  <th className="pb-3 pr-4">로케트</th>
                  <th className="pb-3 pr-4">쏠라이트</th>
                  <th className="pb-3">설명</th>
                </tr>
              </thead>
              <tbody>
                {brandSpecMatchingTable.map((row) => (
                  <tr key={row.canonical} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-black text-blue-700">{row.canonical}</td>
                    <td className="py-3 pr-4 font-semibold text-slate-800">{row.rocket}</td>
                    <td className="py-3 pr-4 font-semibold text-slate-800">{row.solite}</td>
                    <td className="py-3 text-slate-600">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 적용 차량 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-black text-slate-900">{BRAND_LINKED_VEHICLES_LABEL}</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          특정 브랜드가 해당 차량에 무조건 맞는 것은 아닙니다. 연식·연료·단자 확인 후 주문하세요.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profile.linkedVehicles.map((v) => (
            <Link
              key={v.vehicleId}
              href={`/vehicle/${v.vehicleId}`}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:border-blue-200 hover:bg-white hover:shadow-sm"
            >
              <VehicleThumb vehicleId={v.vehicleId} />
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900">{getVehicleName(v.vehicleId)}</p>
                <p className="mt-0.5 text-xs font-bold text-slate-600">
                  {BRAND_LINKED_HINT_PREFIX}: {v.batteryHint}
                </p>
                <span className="mt-2 inline-block text-[11px] font-black text-slate-500">차종 확인 →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 관련 비교 · 가이드 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-black text-slate-900">관련 비교</h2>
          <div className="mt-3 space-y-2">
            {profile.relatedComparisons.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg bg-[#0F172A] px-3 py-2.5 text-sm font-black text-white hover:bg-blue-900"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-black text-slate-900">관련 가이드</h2>
          <div className="mt-3 space-y-2">
            {profile.relatedGuides.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50"
              >
                {item.label} →
              </Link>
            ))}
          </div>
        </section>
      </div>

      <SmartNextActions context={{ type: "brand", brandId: profile.id, batteryCode: profile.featuredCodes[0] }} limit={4} />
    </div>
  );
}

function VehicleThumb({ vehicleId }: { vehicleId: string }) {
  const src = carImageForPlatformVehicleId(vehicleId);
  return (
    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
      {src ? (
        <Image src={src} alt="" fill className="object-contain object-center p-1" sizes="80px" />
      ) : (
        <div className="flex h-full items-center justify-center text-slate-300">
          <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 14h16l-1.5-5H5.5L4 14z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

function FeaturedProductCard({
  product,
  imageBrandKey,
  compact,
}: {
  product: ReturnType<typeof getBattery>;
  imageBrandKey: BatteryBrandKey;
  compact?: boolean;
}) {
  const vehicles = product.vehicleIds.slice(0, 2).map(getVehicleName).join(", ");
  return (
    <Link
      href={searchHref(product.code)}
      className={`flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-md ${compact ? "" : "ring-1 ring-slate-100"}`}
    >
      <div className={`relative bg-slate-50 ${compact ? "h-28" : "h-36"}`}>
        <BatteryThumbnail
          code={product.code}
          imageSet={product.images}
          role="main"
          fit={batteryImageFit(product.code, imageBrandKey)}
          ratio="16/9"
          overlayLabel={false}
          darkOverlay={false}
          className="h-full"
        />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-base font-black text-slate-900">{product.code}</p>
        <p className="mt-1 text-xs font-bold text-slate-600">
          {product.capacity} · {product.cca} · {product.terminal}타입
        </p>
        {vehicles ? <p className="mt-1 flex-1 text-[10px] font-semibold text-slate-500">{vehicles}</p> : null}
        <span className="mt-2 inline-block text-xs font-black text-blue-600">상세 보기 →</span>
      </div>
    </Link>
  );
}
