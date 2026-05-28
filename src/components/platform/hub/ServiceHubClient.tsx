"use client";

import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { SectionHeader } from "@/components/common/SectionHeader";
import { PlatformHubLinks } from "@/components/platform/hub/PlatformHubLinks";
import { HubBadge } from "@/components/platform/hub/HubBadge";
import { bm } from "@/lib/design-tokens";
import { SERVICE_OPTIONS, SERVICE_SCENARIOS } from "@/lib/platform-hub-content";
import { HUB_ORDER_CHECKLIST, HUB_PHOTO_CHECK } from "@/lib/platform-hub-routes";
import { HUB_STORE } from "@/lib/customer-hub-routes";
import { resolveServiceOptionIcon } from "@/lib/icon-map";

export function ServiceHubClient() {
  return (
    <div className={`${bm.hubServicePage} overflow-x-hidden`} data-page="service-hub">
      <section className={`${bm.reportCard} ${bm.cardPad}`}>
        <p className={bm.intentBadge}>이용 방법 선택</p>
        <SectionHeader
          title="매장·출장·택배 안내"
          description="상황에 맞는 방법을 고르세요. 규격이 확실하지 않으면 먼저 검색·사진 확인을 권장합니다."
          iconKey="store"
        />
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {SERVICE_OPTIONS.map((opt) => {
          const iconKey = resolveServiceOptionIcon(opt.title);
          const preferTabler = iconKey === "outbound";
          return (
            <article className={`${bm.cardServiceStore} flex flex-col p-4`} key={opt.title}>
              <div className="flex items-start gap-2">
                <span className="bm-icon-pill shrink-0" aria-hidden>
                  <AppIcon iconKey={iconKey} size="md" preferTabler={preferTabler} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900">{opt.title}</h3>
                  {opt.region ? (
                    <span className={`${bm.badge} ${bm.badgeBlue} mt-1.5 inline-flex items-center gap-1`}>
                      <AppIcon iconKey="location" size="xs" />
                      {opt.region}
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-700">{opt.desc}</p>
              <p className="mt-1.5 text-[10px] font-semibold text-slate-600">{opt.when}</p>
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
          );
        })}
      </div>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="상황별 추천" iconKey="route" />
        <ul className="mt-3 space-y-2">
          {SERVICE_SCENARIOS.map((row) => (
            <li className={`${bm.surfaceMuted} rounded-xl p-3`} key={row.situation}>
              <p className="text-xs font-bold text-slate-900">{row.situation}</p>
              <p className="mt-1 text-[11px] font-medium text-slate-700">추천: {row.pick}</p>
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
          <Link className={`${bm.btnGhost} inline-flex items-center gap-1 text-xs`} href={HUB_ORDER_CHECKLIST}>
            <AppIcon iconKey="checklist" size="sm" />
            오주문 체크리스트
          </Link>
          <Link className={`${bm.btnGhost} inline-flex items-center gap-1 text-xs`} href={HUB_PHOTO_CHECK}>
            <AppIcon iconKey="photoCheck" size="sm" />
            사진 확인 안내
          </Link>
          <Link className={`${bm.btnSecondary} inline-flex items-center gap-1 text-xs`} href={HUB_STORE}>
            <AppIcon iconKey="store" size="sm" />
            상세 매장 안내
          </Link>
        </div>
      </section>

      <PlatformHubLinks title="다른 허브" limit={4} />
    </div>
  );
}
