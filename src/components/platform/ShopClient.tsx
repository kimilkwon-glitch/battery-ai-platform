"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BatteryThumbnail, batteryImageFit } from "@/components/BatteryThumbnail";
import { BatteryWishlistButton } from "@/components/battery/BatteryWishlistButton";
import { BatteryProductCardActions } from "@/components/product/BatteryProductCardActions";
import { useCart } from "@/components/platform/CartContext";
import { ShopFindBatteryBar } from "@/components/platform/ShopFindBatteryBar";
import { ShopProductOrderPanel } from "@/components/platform/ShopProductOrderPanel";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { HUB_SHOP_ANCHORS } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";
import {
  BRAND_SHOP_LABEL,
  badgeToneClass,
  featuredSpecs,
  filterShopProducts,
  findShopProductByCode,
  getProductMeta,
  shopBasicFilters,
  shopDetailFilters,
  shopOrderBriefChecklist,
  specNotationRows,
  SHOP_PAGE_SIZE,
  type ShopBasicFilter,
  type ShopDetailFilter,
} from "@/lib/shop-hub-data";
import {
  getBattery,
  getBrand,
  getVehicleName,
  searchHref,
  serviceHref,
  shopProducts,
  type ShopProduct,
} from "@/lib/platform-data";
import { getBatteryImageSet } from "@/lib/battery-alias-map";

function ShopHero() {
  return null;
}

function FeaturedSpecsSection({ onSelect }: { onSelect: (code: string) => void }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-base font-black text-slate-900">2. 많이 찾는 배터리 상품</h2>
      <p className="mt-1 text-xs font-semibold text-slate-500">인기 규격 4종 — 추천 용도와 대표 차량을 확인하세요.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {featuredSpecs.map((spec) => {
          const imageSet = getBatteryImageSet(spec.productCode, spec.brandId === "solite" ? "solite" : "rocket");
          const parsed = parseBatterySpecDisplay(spec.productCode);
          return (
            <div
              key={spec.displayCode}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 ring-1 ring-slate-100"
            >
              <div className="relative h-36 bg-white">
                <BatteryThumbnail
                  code={spec.productCode}
                  imageSet={imageSet?.main ? imageSet : undefined}
                  role="main"
                  fit={batteryImageFit(spec.productCode, spec.brandId === "solite" ? "solite" : "rocket")}
                  ratio="16/9"
                  overlayLabel={false}
                  darkOverlay={false}
                  className="h-full"
                />
              </div>
              <div className="flex flex-1 flex-col p-3">
                <p className="text-sm font-black text-blue-700">{spec.displayCode}</p>
                <p className="mt-1 text-[10px] font-bold text-slate-600">
                  {parsed.typeLabel} · {parsed.seriesLabel}
                  {parsed.terminalLabel ? ` · ${parsed.terminalLabel}` : ""}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-500">
                  대표 차량: {spec.vehicles.join(", ")}
                </p>
                <div className="mt-auto flex flex-col gap-1.5 pt-3">
                  <button
                    type="button"
                    onClick={() => onSelect(spec.productCode)}
                    className={`${bm.btnPrimary} w-full py-2 text-[10px]`}
                  >
                    구매하기
                  </button>
                  <Link href={spec.href} className={`${bm.btnSecondary} text-center text-[10px]`}>
                    내 차 기준 검색
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SpecNotationGuide() {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-xs font-black text-slate-700">규격 표기 안내 (로케트 · 쏠라이트)</span>
        <span className="text-[10px] font-black text-blue-600">{open ? "접기" : "펼치기"}</span>
      </button>
      {open && (
        <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          {specNotationRows.map((row) => (
            <li key={row.label} className="text-xs font-semibold text-slate-600">
              <span className="font-black text-blue-700">{row.label}</span> — {row.detail}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ProductCard({
  product,
  onOrder,
}: {
  product: ShopProduct;
  onOrder: (p: ShopProduct) => void;
}) {
  const b = getBattery(product.batteryCode, product.brandId);
  const imageSet = product.brandId === "rocket" ? b.images : getBatteryImageSet(product.batteryCode, "solite");
  const meta = getProductMeta(product);
  const brand = getBrand(product.brandId);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
      <div className="relative h-[200px] shrink-0 bg-slate-50">
        <BatteryWishlistButton code={product.batteryCode} overlay size="sm" />
        <BatteryThumbnail
          code={product.batteryCode}
          imageSet={imageSet?.main ? imageSet : undefined}
          role="main"
          fit={batteryImageFit(product.batteryCode, product.brandId === "solite" ? "solite" : "rocket")}
          ratio="16/9"
          overlayLabel={false}
          darkOverlay={false}
          className="h-full"
        />
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-black text-slate-950">{product.batteryCode}</p>
            <p className="mt-0.5 text-[11px] font-bold text-slate-500">
              {product.capacity} · {product.cca} · {product.type} · {product.terminal}타입
            </p>
          </div>
          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-black text-slate-600">
            {brand.displayName}
          </span>
        </div>

        <p className="mt-2 text-[10px] font-semibold text-slate-600">
          대표 차량: {meta.featuredVehicles.slice(0, 3).join(", ")}
        </p>
        <p className="mt-1 text-[10px] font-medium text-slate-500">{meta.usage}</p>

        <div className="mt-2 flex flex-wrap gap-1">
          {meta.badges.map((badge) => (
            <span
              key={badge.label}
              className={`rounded px-1.5 py-0.5 text-[9px] font-black ring-1 ${badgeToneClass(badge.tone)}`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        <p className="mt-2 text-[10px] font-semibold text-slate-500">가격은 주문 상담 시 안내</p>

        <BatteryProductCardActions
          batteryCode={product.batteryCode}
          onOrder={() => onOrder(product)}
        />
      </div>
    </article>
  );
}

function ShopPageBottom() {
  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      id="order-check"
      data-ux="shop-page-bottom"
    >
      <h2 className="text-sm font-black text-slate-900">주문 전 3가지 확인</h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-xs font-semibold text-slate-700">
        {shopOrderBriefChecklist.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <Link
        className="mt-3 inline-block text-[11px] font-bold text-blue-700 hover:underline"
        href="/order-checklist"
      >
        주문 전 체크리스트 전체 보기 →
      </Link>
    </section>
  );
}

export function ShopClient() {
  const searchParams = useSearchParams();
  const { add, count } = useCart();
  const [basicFilter, setBasicFilter] = useState<ShopBasicFilter>("전체");
  const [detailFilters, setDetailFilters] = useState<Set<ShopDetailFilter>>(new Set());
  const [detailOpen, setDetailOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(SHOP_PAGE_SIZE);
  const [detail, setDetail] = useState<ShopProduct | null>(null);
  const [inquiry, setInquiry] = useState<ShopProduct | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;
    const product = findShopProductByCode(code);
    if (product) setDetail(product);
  }, [searchParams]);

  const filtered = useMemo(
    () => filterShopProducts(shopProducts, basicFilter, detailFilters),
    [basicFilter, detailFilters],
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const toggleDetailFilter = (f: ShopDetailFilter) => {
    setDetailFilters((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
    setVisibleCount(SHOP_PAGE_SIZE);
  };

  const handleBasicFilter = (f: ShopBasicFilter) => {
    setBasicFilter(f);
    setVisibleCount(SHOP_PAGE_SIZE);
  };

  const scrollToProduct = (code: string) => {
    const product = findShopProductByCode(code);
    if (product) {
      setDetail(product);
      setBasicFilter("전체");
      setDetailFilters(new Set());
      requestAnimationFrame(() => {
        document.getElementById("shop-order-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <ShopFindBatteryBar />
        {detail ? <ShopProductOrderPanel product={detail} onClose={() => setDetail(null)} /> : null}
        <section id="shop-products" className="scroll-mt-4">
          <FeaturedSpecsSection onSelect={scrollToProduct} />
        </section>

        {/* 필터 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {shopBasicFilters.map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => handleBasicFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${
                    basicFilter === f ? "bg-blue-700 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDetailOpen((v) => !v)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-50"
              >
                상세 필터 {detailOpen ? "▲" : "▼"}
              </button>
              <Link href="/shop/cart" className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-black text-white">
                담은 상품 {count > 0 ? `(${count})` : ""}
              </Link>
            </div>
          </div>

          {detailOpen && (
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
              {shopDetailFilters.map((f) => {
                const active = detailFilters.has(f);
                return (
                  <button
                    type="button"
                    key={f}
                    onClick={() => toggleDetailFilter(f)}
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-black transition ${
                      active
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
              {detailFilters.size > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setDetailFilters(new Set());
                    setVisibleCount(SHOP_PAGE_SIZE);
                  }}
                  className="rounded-full px-2.5 py-1 text-[10px] font-black text-slate-500 hover:text-slate-800"
                >
                  초기화
                </button>
              )}
            </div>
          )}

          <p className="mt-3 text-[11px] font-semibold text-slate-500">
            {filtered.length}개 규격 · {basicFilter !== "전체" ? `${basicFilter} 필터 적용` : "전체"}
            {detailFilters.size > 0 ? ` · 상세 ${detailFilters.size}개` : ""}
          </p>
        </section>

        {/* 상품 목록 */}
        <section>
          <h2 className="mb-1 text-base font-black text-slate-900">전체 배터리 규격</h2>
          <p className="mb-3 text-[11px] font-semibold text-slate-500">기본 8개만 표시 · 더보기로 전체 확인</p>
          {visible.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center ring-1 ring-slate-200">
              <p className="text-sm font-black text-slate-700">조건에 맞는 상품이 없습니다</p>
              <button
                type="button"
                onClick={() => {
                  setBasicFilter("전체");
                  setDetailFilters(new Set());
                }}
                className="mt-3 rounded-lg bg-blue-700 px-4 py-2 text-xs font-black text-white"
              >
                필터 초기화
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onOrder={(prod) => {
                    setDetail(prod);
                    requestAnimationFrame(() => {
                      document.getElementById("shop-order-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    });
                  }}
                />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + SHOP_PAGE_SIZE)}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50"
              >
                더보기 ({filtered.length - visibleCount}개 남음)
              </button>
            </div>
          )}
        </section>

        <SpecNotationGuide />

        <ShopPageBottom />
      </div>

      {/* 문의 모달 */}
      {inquiry && (
        <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
            <h3 className="text-sm font-black">{inquiry.batteryCode} 문의</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {inquiry.capacity} · {inquiry.terminal}타입 · {getBrand(inquiry.brandId).displayName}
            </p>
            <textarea
              className="mt-3 w-full rounded-lg bg-slate-50 p-3 text-sm ring-1 ring-slate-200"
              rows={4}
              defaultValue={`${inquiry.batteryCode} · ${inquiry.capacity} · 장착 차종·단자 방향 확인 요청`}
            />
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => setInquiry(null)} className="flex-1 rounded-lg bg-slate-100 py-2.5 text-xs font-black">
                닫기
              </button>
              <button
                type="button"
                onClick={() => {
                  add(inquiry);
                  setInquiry(null);
                }}
                className="flex-1 rounded-lg border border-slate-300 py-2.5 text-xs font-black text-slate-700"
              >
                상품 담기
              </button>
              <Link
                href={serviceHref(inquiry.vehicleIds[0], inquiry.batteryCode)}
                onClick={() => setInquiry(null)}
                className="flex-1 rounded-lg bg-blue-700 py-2.5 text-center text-xs font-black text-white"
              >
                작업 가능점 연결
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
