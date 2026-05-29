"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { BatteryThumbnail, batteryImageFit } from "@/components/BatteryThumbnail";
import type { BatteryBrandKey } from "@/lib/battery-alias-map";
import {
  BRAND_HUB_MAIN_IDS,
  BRAND_HUB_REFERENCE_IDS,
  brandHubCardBlurbs,
  brandHubFeaturedByBrand,
  brandHubShortCopy,
} from "@/lib/brand-hub-display";
import {
  brandSelectorMeta,
  brandSpecMatchingTable,
  getBrandProfile,
} from "@/lib/brand-hub-data";
import { brands, getBattery, searchHref } from "@/lib/platform-data";

export function BrandHubClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [active, setActive] = useState<string>("rocket");
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const b = params.get("brand");
    if (b && brands.some((x) => x.id === b)) setActive(b);
  }, [params]);

  const brand = brands.find((b) => b.id === active) ?? brands[0];
  const profile = getBrandProfile(active);
  const copy = brandHubShortCopy[active] ?? brandHubShortCopy.rocket;
  const featured = brandHubFeaturedByBrand[active] ?? brandHubFeaturedByBrand.rocket;
  const isMainBrand = BRAND_HUB_MAIN_IDS.includes(active as (typeof BRAND_HUB_MAIN_IDS)[number]);

  const selectBrand = (id: string) => {
    setActive(id);
    setMoreOpen(false);
    router.replace(`/brands?brand=${id}`, { scroll: false });
  };

  const mainBrands = brands.filter((b) => BRAND_HUB_MAIN_IDS.includes(b.id as (typeof BRAND_HUB_MAIN_IDS)[number]));
  const refBrands = brands.filter((b) =>
    BRAND_HUB_REFERENCE_IDS.includes(b.id as (typeof BRAND_HUB_REFERENCE_IDS)[number]),
  );

  return (
    <div className="brand-hub space-y-6">
      {/* 메인 브랜드 */}
      <section className="grid gap-3 sm:grid-cols-2">
        {mainBrands.map((b) => {
          const meta = brandSelectorMeta[b.id];
          const selected = active === b.id;
          const thumb = meta ? getBattery(meta.cardThumbCode, meta.imageBrandKey) : null;
          return (
            <motion.button
              key={b.id}
              type="button"
              onClick={() => selectBrand(b.id)}
              className={clsx(
                "brand-hub-main-card overflow-hidden rounded-2xl border p-4 text-left transition",
                selected
                  ? "border-slate-800 bg-slate-900 text-white shadow-lg"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md",
              )}
              whileHover={{ y: selected ? 0 : -2 }}
              transition={{ duration: 0.18 }}
            >
              {thumb?.images?.main ? (
                <div
                  className={clsx(
                    "mb-3 overflow-hidden rounded-xl p-1.5 ring-1",
                    selected ? "bg-white/95 ring-white/30" : "bg-slate-50 ring-slate-200/80",
                  )}
                >
                  <div className="h-20">
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
              <p className="text-lg font-black">{b.displayName}</p>
              <p className={clsx("mt-1 text-xs font-bold", selected ? "text-slate-300" : "text-slate-500")}>
                {b.id === "rocket" ? "GB·AGM 표기 중심" : "CMF·DIN 표기 중심"}
              </p>
            </motion.button>
          );
        })}
      </section>

      {/* 참고 브랜드 */}
      <section>
        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">참고 브랜드</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {refBrands.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => selectBrand(b.id)}
              className={clsx(
                "rounded-full px-3 py-1.5 text-xs font-black transition",
                active === b.id
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-white",
              )}
            >
              {b.displayName}
            </button>
          ))}
        </div>
      </section>

      {/* 선택 브랜드 요약 */}
      <AnimatePresence mode="wait">
        <motion.section
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <h2 className="text-xl font-black text-slate-900">{copy.title}</h2>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">{copy.body}</p>
          <div className="mt-4">
            <p className="text-[10px] font-black text-slate-400">대표 표기</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{copy.notation}</p>
          </div>
          {isMainBrand && profile.heroImageCodes[0] ? (
            <div className="mt-4 max-w-[200px] overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200">
              <div className="h-24">
                <BatteryThumbnail
                  code={profile.heroImageCodes[0]}
                  imageSet={getBattery(profile.heroImageCodes[0], featured.imageBrandKey).images}
                  role="main"
                  fit={batteryImageFit(profile.heroImageCodes[0], featured.imageBrandKey)}
                  ratio="16/9"
                  overlayLabel={false}
                  darkOverlay={false}
                  className="h-full"
                />
              </div>
            </div>
          ) : null}
        </motion.section>
      </AnimatePresence>

      {/* 대표 규격 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-black text-slate-900">{brand.displayName} 대표 규격</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">자주 확인되는 규격만 먼저 보여드립니다.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.codes.map((code) => (
            <FeaturedProductCard
              key={code}
              code={code}
              imageBrandKey={featured.imageBrandKey}
              blurb={brandHubCardBlurbs[code] ?? ""}
            />
          ))}
        </div>
      </section>

      {/* 표기 차이표 — 로케트/쏠라이트 핵심 */}
      {(isMainBrand || active === "rocket" || active === "solite") && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-black text-slate-900">브랜드별 규격 표기 차이</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            같은 계열이라도 브랜드마다 제품 코드가 다를 수 있습니다.
          </p>
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
                    <td className="py-3 pr-4 font-black text-slate-800">{row.canonical}</td>
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

      {/* 더 알아보기 */}
      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-black text-slate-800"
        >
          더 알아보기
          <ChevronDown className={clsx("size-4 transition", moreOpen && "rotate-180")} />
        </button>
        <AnimatePresence>
          {moreOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-200"
            >
              <div className="grid gap-4 p-4 lg:grid-cols-2">
                <div>
                  <h3 className="text-xs font-black text-slate-500">관련 비교</h3>
                  <ul className="mt-2 space-y-1.5">
                    {profile.relatedComparisons.slice(0, 3).map((item) => (
                      <li key={item.href}>
                        <Link className="text-sm font-bold text-blue-700 hover:underline" href={item.href}>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-500">관련 가이드</h3>
                  <ul className="mt-2 space-y-1.5">
                    {profile.relatedGuides.slice(0, 3).map((item) => (
                      <li key={item.href}>
                        <Link className="text-sm font-bold text-slate-700 hover:text-blue-700" href={item.href}>
                          {item.label} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="border-t border-slate-200 px-4 pb-4 pt-3">
                <Link className="text-sm font-black text-slate-800 hover:text-blue-700" href="/compare">
                  배터리 용량 업그레이드 판단 →
                </Link>
                <span className="mx-2 text-slate-300">·</span>
                <Link className="text-sm font-black text-slate-800 hover:text-blue-700" href="/vehicles">
                  차량별 규격 확인 →
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    </div>
  );
}

function FeaturedProductCard({
  code,
  imageBrandKey,
  blurb,
}: {
  code: string;
  imageBrandKey: BatteryBrandKey;
  blurb: string;
}) {
  const product = getBattery(code, imageBrandKey === "solite" ? "solite" : "rocket");
  return (
    <Link
      href={searchHref(code)}
      className="brand-hub-spec-card flex h-full min-h-[280px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="relative h-32 bg-slate-50 sm:h-36">
        <BatteryThumbnail
          code={code}
          imageSet={product.images}
          role="main"
          fit={batteryImageFit(code, imageBrandKey)}
          ratio="16/9"
          overlayLabel={false}
          darkOverlay={false}
          className="h-full"
        />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="brand-spec-code text-base font-black tracking-tight text-slate-900">{product.code}</p>
        {blurb ? <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-600">{blurb}</p> : null}
        <span className="mt-auto pt-3 text-xs font-black text-blue-600">상세 보기 →</span>
      </div>
    </Link>
  );
}
