"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VehicleCardImage } from "@/components/media/VehicleCardImage";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { BatteryDetailBodyImages } from "@/components/battery/BatteryDetailBodyImages";
import { BATTERY_DETAIL_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import { getNormalizedBatterySummary, formatDimensions } from "@/lib/battery-knowledge";
import { getBattery } from "@/lib/platform-data";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { CUSTOMER_CENTER_HUB } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";
type VehicleChip = { slug: string; title: string };

const TABS = [
  { id: "detail", label: "상품상세정보" },
  { id: "reviews", label: "리뷰" },
  { id: "qna", label: "상품문의" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Props = {
  code: string;
  vehicles: VehicleChip[];
};

export function BatteryDetailProductTabs({ code, vehicles }: Props) {
  const [tab, setTab] = useState<TabId>("detail");
  const spec = parseBatterySpecDisplay(code);
  const summary = getNormalizedBatterySummary(code);
  const catalogBattery = getBattery(code);
  const detailAsset = `/assets/battery-detail/${code.toLowerCase()}.png`;
  const reviewsHref = `/reviews?battery=${encodeURIComponent(code)}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (hash === "battery-reviews") setTab("reviews");
  }, []);

  return (
    <section className="scroll-mt-24 space-y-4" data-battery-product-tabs={code}>
      <nav
        className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
        role="tablist"
        aria-label="상품 정보 탭"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              id={`battery-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`min-h-[44px] flex-1 shrink-0 rounded-lg px-4 text-sm font-black transition ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      {tab === "detail" ? (
        <div
          role="tabpanel"
          id="battery-detail-info"
          aria-labelledby="battery-tab-detail"
          className={`${bm.card} ${bm.cardPad} space-y-6`}
        >
          {vehicles.length > 0 ? (
            <div id="battery-vehicles">
              <h2 className="text-base font-black text-slate-900">이 규격이 많이 들어가는 차량</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                대표 적용 차량 — 연식·트림에 따라 다를 수 있습니다.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {vehicles.slice(0, 6).map((v) => (
                  <Link
                    key={v.slug}
                    href={`/vehicle/${v.slug}`}
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-md"
                  >
                    <VehicleCardImage slug={v.slug} title={v.title} layout="stack" heightClass="h-28" />
                    <div className="border-t border-slate-100 p-3">
                      <p className="text-sm font-black text-slate-900 group-hover:text-blue-700">{v.title}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{code}</p>
                      <span className="mt-2 inline-block text-xs font-black text-blue-600">차량 상세 보기 →</span>
                    </div>
                  </Link>
                ))}
              </div>
              {vehicles.length > 6 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {vehicles.slice(6).map((v) => (
                    <Link
                      key={v.slug}
                      href={`/vehicle/${v.slug}`}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-800"
                    >
                      {v.title}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div>
            <h3 className="text-sm font-black text-slate-900">제품 기본 스펙</h3>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <dt className="text-xs font-bold text-slate-400">타입</dt>
                <dd className="font-black text-slate-900">{spec.typeLabel}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <dt className="text-xs font-bold text-slate-400">용량</dt>
                <dd className="font-black text-slate-900">{spec.capacity ?? "—"}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <dt className="text-xs font-bold text-slate-400">CCA</dt>
                <dd className="font-black text-slate-900">{spec.cca ?? summary?.cca ?? "—"}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <dt className="text-xs font-bold text-slate-400">RC</dt>
                <dd className="font-black text-slate-900">{summary?.rc ?? "—"}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100 sm:col-span-2">
                <dt className="text-xs font-bold text-slate-400">사이즈 (mm)</dt>
                <dd className="font-black text-slate-900">
                  {formatDimensions(summary?.dimensionsMm ?? null) ?? "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div id="battery-detail-body-guide">
            <h3 className="text-sm font-black text-slate-900">상품 안내</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">
              정품·주문·배송·회수·A/S 안내입니다. 브랜드에 따라 2번 안내 이미지가 달라집니다.
            </p>
            <div className="mt-4">
              <BatteryDetailBodyImages code={code} brandId={catalogBattery.brandId} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900">상세 이미지</h3>
            <DetailImageBlock code={code} assetPath={detailAsset} />
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900">확인 포인트</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm font-medium text-slate-600">
              <li>라벨 규격 코드·L/R 단자</li>
              <li>트레이·고정 방식</li>
            </ul>
            <MediaImageSlot
              slot={BATTERY_DETAIL_IMAGE_SLOTS.labelTerminal(code)}
              className="mt-3 max-h-[120px]"
            />
          </div>
        </div>
      ) : null}

      {tab === "reviews" ? (
        <div
          role="tabpanel"
          id="battery-reviews"
          aria-labelledby="battery-tab-reviews"
          className={`${bm.card} ${bm.cardPad}`}
        >
          <p className="text-sm font-medium text-slate-500">아직 등록된 리뷰가 없습니다.</p>
          <Link href={reviewsHref} className={`${bm.btnSecondary} mt-4 inline-flex text-sm`}>
            리뷰 페이지 보기
          </Link>
        </div>
      ) : null}

      {tab === "qna" ? (
        <div
          role="tabpanel"
          id="battery-qna"
          aria-labelledby="battery-tab-qna"
          className={`${bm.card} ${bm.cardPad} space-y-3`}
        >
          <p className="text-sm font-medium text-slate-600">
            규격·장착 문의는 고객센터 또는 Q&amp;A에서 도와드립니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href={CUSTOMER_CENTER_HUB} className={`${bm.btnSecondary} text-sm`}>
              고객센터
            </Link>
            <Link href="/community" className={`${bm.btnTertiary} text-sm`}>
              Q&amp;A 보기
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function DetailImageBlock({ code, assetPath }: { code: string; assetPath: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setReady(true);
    img.onerror = () => setReady(false);
    img.src = assetPath;
  }, [assetPath]);

  if (!ready) {
    return (
      <p className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
        상세 이미지는 준비 중입니다.
      </p>
    );
  }

  return (
    <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={assetPath} alt={`${code} 상세`} className="h-full w-full object-contain p-2" />
    </div>
  );
}
