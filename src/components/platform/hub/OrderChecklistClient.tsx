"use client";

import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { IconBadge } from "@/components/common/IconBadge";
import { SectionHeader } from "@/components/common/SectionHeader";
import { PlatformHubLinks } from "@/components/platform/hub/PlatformHubLinks";
import { HubBadge } from "@/components/platform/hub/HubBadge";
import { bm } from "@/lib/design-tokens";
import { BrandNoteStrip } from "@/components/battery/BrandNoteStrip";
import { UPGRADE_PRINCIPLES } from "@/lib/battery-knowledge";
import { ORDER_CHECKLIST_ITEMS, ORDER_CHECKLIST_SECTIONS } from "@/lib/platform-hub-content";
import { HUB_PHOTO_CHECK, HUB_SYMPTOMS } from "@/lib/platform-hub-routes";
import { HUB_PHOTO, HUB_QA, HUB_SHOP_ANCHORS } from "@/lib/customer-hub-routes";
import { ORDER_CHECKLIST_STEP_ICONS, ORDER_SECTION_ICON_FROM_TITLE } from "@/lib/icon-map";
import type { IconKey } from "@/lib/icon-map";

function sectionIconKey(title: string): IconKey {
  for (const [needle, key] of Object.entries(ORDER_SECTION_ICON_FROM_TITLE)) {
    if (title.includes(needle)) return key;
  }
  return "warning";
}

export function OrderChecklistClient() {
  return (
    <div className={`${bm.hubOrder} overflow-x-hidden`} data-page="order-checklist">
      <section className={`${bm.reportCard} ${bm.cardPad}`}>
        <p className={bm.intentBadge}>오주문 방지</p>
        <SectionHeader
          title="배터리 주문 전, 딱 세 가지만 먼저 보세요"
          description="차종·연식·단자 방향만 봐도 실수는 크게 줄어듭니다. 규격을 알아도 L/R 단자가 다르면 장착이 안 될 수 있습니다."
          iconKey="checklist"
        />
        <ul className="mt-4 list-none space-y-3 p-0">
          {ORDER_CHECKLIST_ITEMS.map((item, i) => {
            const iconKey = (ORDER_CHECKLIST_STEP_ICONS[i] ?? "verify") as IconKey;
            return (
              <li className={bm.stepItem} key={item.title}>
                <span className={bm.stepNum}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <AppIcon iconKey={iconKey} size="sm" />
                    <h3 className="text-sm font-bold text-[var(--bm-text)]">{item.title}</h3>
                    <HubBadge label={item.badge} tone={item.tone} />
                  </div>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-[var(--bm-muted)]">{item.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="업그레이드·호환 기준" description="용량만 보지 마세요" iconKey="batterySpec" />
        <ul className="mt-3 space-y-1.5">
          {UPGRADE_PRINCIPLES.slice(0, 4).map((p) => (
            <li key={p} className="text-xs font-medium text-slate-600">
              · {p}
            </li>
          ))}
        </ul>
        <Link className={`${bm.btnTertiary} mt-3 inline-flex text-xs`} href="/guides/knowledge/bk-upgrade-conditions">
          업그레이드 조건 자세히 →
        </Link>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="헷갈리기 쉬운 주제" description="단자·타입·연식" iconKey="terminal" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {ORDER_CHECKLIST_SECTIONS.map((s) => (
            <article className={`${bm.cardInteractive} p-4`} key={s.title}>
              <div className="flex flex-wrap items-center gap-2">
                <IconBadge iconKey={sectionIconKey(s.title)} size="sm" />
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
        <SectionHeader title="다음 단계" description="확인 후 이렇게 이어가 보세요" iconKey="route" />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link className={`${bm.btnNavy} inline-flex items-center gap-1.5 text-xs`} href={HUB_PHOTO}>
            <AppIcon iconKey="photoCheck" size="sm" className="!text-white" />
            사진으로 확인
          </Link>
          <Link className={`${bm.btnSecondary} inline-flex items-center gap-1.5 text-xs`} href="/compare">
            <AppIcon iconKey="compare" size="sm" />
            규격 비교
          </Link>
          <Link className={`${bm.btnGhost} inline-flex items-center gap-1.5 text-xs`} href={HUB_SYMPTOMS}>
            <AppIcon iconKey="symptom" size="sm" />
            증상별 안내
          </Link>
          <Link className={`${bm.btnGhost} hidden items-center gap-1.5 text-xs sm:inline-flex`} href={HUB_QA}>
            <AppIcon iconKey="qna" size="sm" />
            Q&A
          </Link>
          <Link className={`${bm.btnGhost} inline-flex items-center gap-1.5 text-xs`} href={HUB_SHOP_ANCHORS.orderCheck}>
            <AppIcon iconKey="delivery" size="sm" />
            택배 주문 전 보기
          </Link>
        </div>
      </section>

      <BrandNoteStrip compact />

      <PlatformHubLinks title="관련 안내" limit={4} />
    </div>
  );
}
