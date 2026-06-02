"use client";

import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { bm } from "@/lib/design-tokens";
import { getSearchHref } from "@/lib/battery-search";
import { HUB_PHOTO, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

const REVIEW_CASES = [
  "장기주차가 잦은 차량",
  "블랙박스 상시녹화 사용",
  "캠핑/전장품 사용이 많은 차량",
  "반복 방전 이력이 있는 차량",
] as const;

const MUST_CHECK = [
  "배터리 트레이 공간",
  "단자 방향 L/R",
  "고정쇠 위치",
  "배터리 높이 간섭",
  "충전 전압 상태",
] as const;

const AVOID_UPGRADE = [
  "공간이 맞지 않는 경우",
  "단자 방향이 다른 경우",
  "고정이 불안정한 경우",
  "차량 충전계통 점검이 필요한 경우",
] as const;

const UPGRADE_EXAMPLES = [
  { from: "AGM60L", to: "AGM70L" },
  { from: "AGM70L", to: "AGM80L" },
  { from: "DIN74L", to: "DIN80L" },
  { from: "90R", to: "100R" },
  { from: "CMF80L", to: "CMF90L" },
] as const;

export function UpgradeGuideClient() {
  return (
    <div className="upgrade-guide space-y-8 pb-10" data-page="upgrade-guide">
      <section className={`${bm.heroPanel} p-6 sm:p-8`}>
        <p className={bm.intentBadge}>용량 업그레이드</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          배터리 용량 업그레이드
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
          장기주차, 블랙박스 사용, 전장품 사용이 많다면 용량 업그레이드를 검토할 수 있습니다. 단,
          차량 구조에 맞는 경우에만 안전하게 장착해야 합니다.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link href={HUB_STORE_DETAIL} className={`${bm.btnPrimary} min-h-[3rem] justify-center text-sm font-black`}>
            내 차 업그레이드 가능 여부 상담하기
          </Link>
          <Link href={getSearchHref("AGM70L")} className={`${bm.btnNavy} min-h-[3rem] justify-center text-sm font-black`}>
            배터리 규격 검색하기
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className={`${bm.card} ${bm.cardPad}`}>
          <AppIcon iconKey="batterySpec" size="md" />
          <h2 className="mt-2 text-base font-black text-slate-900">이런 경우 검토</h2>
          <ul className="mt-3 space-y-2 text-sm font-medium text-slate-700">
            {REVIEW_CASES.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-blue-600" aria-hidden>
                  ·
                </span>
                {line}
              </li>
            ))}
          </ul>
        </article>
        <article className={`${bm.card} ${bm.cardPad}`}>
          <AppIcon iconKey="checklist" size="md" />
          <h2 className="mt-2 text-base font-black text-slate-900">반드시 확인할 것</h2>
          <ul className="mt-3 space-y-2 text-sm font-medium text-slate-700">
            {MUST_CHECK.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-blue-600" aria-hidden>
                  ·
                </span>
                {line}
              </li>
            ))}
          </ul>
        </article>
        <article className={`${bm.card} ${bm.cardPad} border-amber-100 bg-amber-50/30`}>
          <AppIcon iconKey="warning" size="md" />
          <h2 className="mt-2 text-base font-black text-amber-950">무조건 업그레이드하면 안 되는 경우</h2>
          <ul className="mt-3 space-y-2 text-sm font-medium text-amber-950/90">
            {AVOID_UPGRADE.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden>·</span>
                {line}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-lg font-black text-slate-950">대표적인 용량 업그레이드 예시</h2>
        <p className="mt-2 text-sm font-medium text-slate-600">
          아래는 가능성이 있는 조합 예시입니다. 차종·연식·트레이에 따라 달라질 수 있습니다.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {UPGRADE_EXAMPLES.map((ex) => (
            <article
              key={`${ex.from}-${ex.to}`}
              className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 ring-1 ring-slate-100"
            >
              <p className="text-sm font-black text-slate-900">
                {ex.from} → {ex.to}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">차량별 장착 공간 확인 필요</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-4`}>
        <h2 className="text-lg font-black text-slate-950">
          업그레이드 가능 여부는 사진이나 차량 정보로 확인할 수 있습니다.
        </h2>
        <p className="text-sm font-medium leading-relaxed text-slate-600">
          공간과 단자 방향이 맞지 않으면 장착이 어려울 수 있습니다. 상담 시 차량명과 현재 배터리
          규격을 알려주시면 더 빠르게 확인할 수 있습니다.
        </p>
        <ul className="grid gap-2 text-sm font-bold text-slate-800 sm:grid-cols-3">
          <li className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">차량명</li>
          <li className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">연식</li>
          <li className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">현재 배터리 규격</li>
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href={HUB_PHOTO} className={`${bm.btnSecondary} min-h-[3rem] justify-center text-sm font-black`}>
            사진 확인하기
          </Link>
          <Link href={HUB_STORE_DETAIL} className={`${bm.btnPrimary} min-h-[3rem] justify-center text-sm font-black`}>
            상담하기
          </Link>
          <Link href={getSearchHref("")} className={`${bm.btnTertiary} min-h-[3rem] justify-center text-sm font-black`}>
            규격 검색
          </Link>
        </div>
      </section>
    </div>
  );
}
