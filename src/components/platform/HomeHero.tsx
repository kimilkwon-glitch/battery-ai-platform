"use client";

import Link from "next/link";
import { ConversionActions } from "@/components/common/ConversionActions";
import { VehicleSearchBox } from "@/components/platform/VehicleSearchBox";
import { BRAND_HERO_LABEL } from "@/lib/brand";
import { getSearchHref } from "@/lib/battery-search";
import { HUB_PHOTO, HUB_STORE } from "@/lib/customer-hub-routes";
import { LEGAL_SHIPPING_PAGE } from "@/lib/legal/legal-routes";
import { HERO_BATTERY_CODES, HERO_SEARCH_SUGGESTIONS } from "@/lib/home-page-data";
import { getBatteryHref } from "@/lib/content";
import { bm } from "@/lib/design-tokens";

const SPEC_SEARCH_CHIPS = ["AGM70L", "AGM80L", "DIN74L", "100R"] as const;

export function HomeHero() {
  return (
    <section className={bm.heroPanel}>
      <div className="border-b border-blue-50/80 bg-blue-50/30 px-5 py-2.5 lg:px-7">
        <p className="text-[11px] font-black tracking-wide text-[#2563EB]">{BRAND_HERO_LABEL}</p>
      </div>
      <div className="p-5 lg:p-7">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-black leading-[1.2] tracking-[-0.03em] text-[#0F172A] sm:text-[1.85rem]">
            내 차 배터리,
            <br />
            차종별로 바로 확인
          </h1>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
            부산 배터리 전문점(덕천·학장)이 운영하는 차량별·규격별 확인 서비스입니다.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              className="rounded-xl border-2 border-[var(--bm-primary)] bg-blue-50/40 px-3 py-3 transition hover:bg-blue-50"
              href="/vehicles"
            >
              <p className="text-xs font-black text-[var(--bm-primary)]">차량명으로 찾기</p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-600">연식·연료별 추천 규격</p>
            </Link>
            <Link
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/30"
              href={getSearchHref("AGM80L")}
            >
              <p className="text-xs font-black text-slate-900">규격명으로 찾기</p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-600">AGM · DIN · CMF 코드 검색</p>
            </Link>
          </div>

          <VehicleSearchBox
            className="mt-4"
            inputClassName={`${bm.input} h-12 font-bold`}
            placeholder="차량명 · 연식 · 규격 검색"
            showButton
            buttonLabel="검색"
          />

          <p className="mt-2 text-[10px] font-black text-slate-400">차량 검색 예시</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {HERO_SEARCH_SUGGESTIONS.slice(0, 4).map((keyword) => (
              <Link
                key={keyword}
                className={`${bm.filterChip} ${bm.filterChipOff} hover:border-blue-200 hover:text-blue-700`}
                href={getSearchHref(keyword)}
              >
                {keyword}
              </Link>
            ))}
          </div>

          <p className="mt-3 text-[10px] font-black text-slate-400">규격 검색</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {SPEC_SEARCH_CHIPS.map((code) => (
              <Link
                key={code}
                className={`${bm.filterChip} ${bm.filterChipOn} hover:opacity-90`}
                href={getSearchHref(code)}
              >
                {code}
              </Link>
            ))}
            {HERO_BATTERY_CODES.filter((c) => !SPEC_SEARCH_CHIPS.includes(c as (typeof SPEC_SEARCH_CHIPS)[number])).map(
              (code) => (
                <Link
                  key={code}
                  className={`${bm.filterChip} border border-blue-200 bg-blue-50 text-blue-800 ring-1 ring-blue-100`}
                  href={getBatteryHref(code)}
                >
                  {code} 상세
                </Link>
              ),
            )}
          </div>

          <ConversionActions
            className="mt-5"
            primary={{ label: "내 차 기준으로 확인", href: "/vehicles" }}
            secondary={{ label: "사진으로 확인", href: HUB_PHOTO }}
            tertiary={{ label: "문의하기", href: "/ai" }}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-blue-200 hover:bg-blue-50"
              href={HUB_STORE}
            >
              매장·출장 안내
            </Link>
            <Link
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-blue-200 hover:bg-blue-50"
              href={LEGAL_SHIPPING_PAGE}
            >
              배송 안내
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

