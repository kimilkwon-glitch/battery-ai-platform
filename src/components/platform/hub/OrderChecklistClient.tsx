"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/common/SectionHeader";
import { PlatformHubLinks } from "@/components/platform/hub/PlatformHubLinks";
import { HubBadge } from "@/components/platform/hub/HubBadge";
import { bm } from "@/lib/design-tokens";
import { ORDER_CHECKLIST_ITEMS, ORDER_CHECKLIST_SECTIONS } from "@/lib/platform-hub-content";
import { HUB_PHOTO_CHECK, HUB_SYMPTOMS } from "@/lib/platform-hub-routes";
import { HUB_PHOTO, HUB_QA, HUB_SHOP_ANCHORS } from "@/lib/customer-hub-routes";

export function OrderChecklistClient() {
  return (
    <div className={`${bm.hubOrder} overflow-x-hidden`} data-page="order-checklist">
      <section className={`${bm.reportCard} ${bm.cardPad}`}>
        <p className={bm.intentBadge}>오주문 방지 센터</p>
        <SectionHeader
          title="배터리 주문 전 확인 체크리스트"
          description="택배·자가장착·전화 문의 전에 확인하면 반품·재주문을 줄일 수 있습니다. DB 매칭 결과와 함께 사용하세요."
        />
        <ul className="mt-4 list-none space-y-3 p-0">
          {ORDER_CHECKLIST_ITEMS.map((item, i) => (
            <li className={bm.stepItem} key={item.title}>
              <span className={bm.stepNum}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--bm-text)]">{item.title}</h3>
                  <HubBadge label={item.badge} tone={item.tone} />
                </div>
                <p className="mt-1 text-xs font-medium leading-relaxed text-[var(--bm-muted)]">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="꼭 확인할 주제" description="헷갈리기 쉬운 규격·단자·타입" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {ORDER_CHECKLIST_SECTIONS.map((s) => (
            <article className={`${bm.cardInteractive} p-4`} key={s.title}>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                <HubBadge label={s.badge} tone={s.tone} />
              </div>
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">{s.body}</p>
              <Link className={`${bm.btnTertiary} mt-3 inline-flex text-[11px]`} href={s.href}>
                {s.cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={bm.platformStrip}>
        <SectionHeader title="다음 행동" description="확인 후 이렇게 이어가세요" />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link className={`${bm.btnNavy} text-xs`} href={HUB_PHOTO}>
            사진으로 최종 확인
          </Link>
          <Link className={`${bm.btnSecondary} text-xs`} href="/compare">
            규격 비교
          </Link>
          <Link className={`${bm.btnGhost} text-xs`} href={HUB_SYMPTOMS}>
            증상 진단
          </Link>
          <Link className={`${bm.btnGhost} text-xs`} href={HUB_QA}>
            Q&A 허브
          </Link>
          <Link className={`${bm.btnGhost} text-xs`} href={HUB_SHOP_ANCHORS.orderCheck}>
            택배 주문 전 확인
          </Link>
        </div>
      </section>

      <PlatformHubLinks title="다른 허브" limit={4} />
    </div>
  );
}
