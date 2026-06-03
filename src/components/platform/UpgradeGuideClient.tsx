"use client";

import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { UpgradeBatteryLookup } from "@/components/platform/UpgradeBatteryLookup";
import { bm } from "@/lib/design-tokens";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

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
          장기주차, 블랙박스 사용, 전장품 사용이 많다면 용량 업그레이드를 검토할 수 있습니다. 차량명으로
          먼저 조회한 뒤, 공간·단자가 맞는 경우에만 안전하게 장착하세요.
        </p>
      </section>

      <UpgradeBatteryLookup />

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

      <section className={`${bm.card} ${bm.cardPad} flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <h2 className="text-lg font-black text-slate-950">추가 확인이 필요하신가요?</h2>
          <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-600">
            조회 결과로 확인이 어려우면 차량명·현재 규격을 알려주시면 장착 공간과 단자 방향을 함께
            점검해 드립니다.
          </p>
        </div>
        <Link
          href={HUB_STORE_DETAIL}
          className={`${bm.btnPrimary} min-h-[3rem] w-full shrink-0 justify-center text-sm font-black sm:w-auto`}
        >
          상담하기
        </Link>
      </section>
    </div>
  );
}
