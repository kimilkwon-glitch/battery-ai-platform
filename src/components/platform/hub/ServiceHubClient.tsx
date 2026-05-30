"use client";

import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { SectionHeader } from "@/components/common/SectionHeader";
import { PlatformHubLinks } from "@/components/platform/hub/PlatformHubLinks";
import { HubBadge } from "@/components/platform/hub/HubBadge";
import { bm } from "@/lib/design-tokens";
import { SERVICE_OPTIONS, SERVICE_SCENARIOS } from "@/lib/platform-hub-content";
import { HUB_ORDER_CHECKLIST, HUB_PHOTO_CHECK } from "@/lib/platform-hub-routes";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { resolveServiceOptionIcon } from "@/lib/icon-map";

export function ServiceHubClient() {
  return (
    <div className={`${bm.hubServicePage} overflow-x-hidden`} data-page="service-hub">
      <section className={`${bm.reportCard} ${bm.cardPad}`}>
        <p className={bm.intentBadge}>이용 안내</p>
        <SectionHeader
          title="시동이 안 걸리면 출장, 규격을 알면 택배"
          description="지금 당장 시동이 안 걸리면 출장 문의, 규격을 알고 있다면 택배 주문, 헷갈리면 사진 확인부터 보시면 됩니다. 부산은 가까운 직영점 기준으로 안내드립니다."
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
              <p className="mt-1 text-[11px] font-medium text-slate-700">{row.pick}</p>
              <Link className={`${bm.btnTertiary} mt-2 inline-flex text-[10px]`} href={row.href}>
                안내 보기 →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="부산 직영점·지도" description="덕천·학장 지점 위치와 연락처" iconKey="mapPinned" />
        <Link className={`${bm.btnNavy} mt-3 inline-flex text-xs`} href="/service-center">
          매장·지점 안내 보기 →
        </Link>
      </section>

      <section className={bm.platformStrip}>
        <div className="flex flex-wrap gap-2">
          <HubBadge label="직영" tone="ok" />
          <HubBadge label="택배" tone="check" />
          <HubBadge label="사진 확인 권장" tone="warn" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className={`${bm.btnGhost} inline-flex items-center gap-1 text-xs`} href={HUB_ORDER_CHECKLIST}>
            <AppIcon iconKey="checklist" size="sm" />
            주문 전 체크리스트
          </Link>
          <Link className={`${bm.btnGhost} inline-flex items-center gap-1 text-xs`} href={HUB_PHOTO_CHECK}>
            <AppIcon iconKey="photoCheck" size="sm" />
            사진 확인 안내
          </Link>
          <Link className={`${bm.btnSecondary} inline-flex items-center gap-1 text-xs`} href={HUB_STORE_DETAIL}>
            <AppIcon iconKey="store" size="sm" />
            직영점·출장 상세
          </Link>
        </div>
      </section>

      <PlatformHubLinks title="관련 안내" limit={4} />
    </div>
  );
}
