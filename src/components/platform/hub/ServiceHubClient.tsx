"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/common/SectionHeader";
import { PlatformHubLinks } from "@/components/platform/hub/PlatformHubLinks";
import { HubBadge } from "@/components/platform/hub/HubBadge";
import { bm } from "@/lib/design-tokens";
import { SERVICE_OPTIONS, SERVICE_SCENARIOS } from "@/lib/platform-hub-content";
import { HUB_ORDER_CHECKLIST, HUB_PHOTO_CHECK } from "@/lib/platform-hub-routes";
import { HUB_STORE } from "@/lib/customer-hub-routes";

export function ServiceHubClient() {
  return (
    <div className="space-y-5 overflow-x-hidden" data-page="service-hub">
      <section className={`${bm.reportCard} ${bm.cardPad}`}>
        <p className={bm.intentBadge}>이용 방법 선택</p>
        <SectionHeader
          title="매장·출장·택배 안내"
          description="상황에 맞는 방법을 고르세요. 규격이 확실하지 않으면 먼저 검색·사진 확인을 권장합니다."
        />
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {SERVICE_OPTIONS.map((opt) => (
          <article className={`${bm.cardInteractive} flex flex-col p-4`} key={opt.title}>
            <h3 className="text-sm font-bold text-slate-950">{opt.title}</h3>
            {opt.region ? (
              <span className={`${bm.badge} ${bm.badgeGray} mt-1.5 w-fit`}>{opt.region}</span>
            ) : null}
            <p className="mt-1 text-xs font-medium text-slate-600">{opt.desc}</p>
            <p className="mt-2 text-[10px] font-semibold leading-relaxed text-[var(--bm-muted)]">{opt.when}</p>
            <Link
              className={`mt-auto pt-3 ${
                opt.tone === "primary"
                  ? bm.btnNavy
                  : opt.tone === "secondary"
                    ? bm.btnSecondary
                    : bm.btnGhost
              } inline-flex w-full justify-center text-[10px] sm:w-auto`}
              href={opt.href}
            >
              안내 보기 →
            </Link>
          </article>
        ))}
      </div>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="상황별 추천" />
        <ul className="mt-3 space-y-2">
          {SERVICE_SCENARIOS.map((row) => (
            <li className={`${bm.surfaceMuted} rounded-xl p-3`} key={row.situation}>
              <p className="text-xs font-bold text-slate-800">{row.situation}</p>
              <p className="mt-1 text-[11px] font-medium text-slate-600">
                추천: {row.pick}
              </p>
              <Link className={`${bm.btnTertiary} mt-2 inline-flex text-[10px]`} href={row.href}>
                바로가기 →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={bm.platformStrip}>
        <div className="flex flex-wrap gap-2">
          <HubBadge label="직영" tone="ok" />
          <HubBadge label="택배" tone="check" />
          <HubBadge label="사진확인 권장" tone="warn" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className={`${bm.btnGhost} text-xs`} href={HUB_ORDER_CHECKLIST}>
            오주문 체크리스트
          </Link>
          <Link className={`${bm.btnGhost} text-xs`} href={HUB_PHOTO_CHECK}>
            사진 확인 안내
          </Link>
          <Link className={`${bm.btnSecondary} text-xs`} href={HUB_STORE}>
            상세 매장 안내
          </Link>
        </div>
      </section>

      <PlatformHubLinks title="다른 허브" limit={4} />
    </div>
  );
}
