"use client";

import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { IconBadge } from "@/components/common/IconBadge";
import { SectionHeader } from "@/components/common/SectionHeader";
import { PlatformHubLinks } from "@/components/platform/hub/PlatformHubLinks";
import { bm } from "@/lib/design-tokens";
import { SYMPTOM_HUB_ITEMS, symptomDiagnosisHref } from "@/lib/platform-hub-content";
import { HUB_ORDER_CHECKLIST, HUB_PHOTO_CHECK } from "@/lib/platform-hub-routes";
import { SYMPTOM_ITEM_ICONS } from "@/lib/icon-map";
import type { IconKey } from "@/lib/icon-map";
import { searchHref } from "@/lib/platform-data";

export function SymptomsHubClient() {
  return (
    <div className={`${bm.hubSymptom} overflow-x-hidden`} data-page="symptoms-hub">
      <section className={`${bm.reportCard} ${bm.cardPad}`}>
        <p className={bm.intentBadge}>증상별 안내</p>
        <SectionHeader
          title="시동이 늦거나 방전됐을 때, 먼저 볼 증상들"
          description="증상에 맞는 검색·사진 확인·문의로 이어갑니다. 차종·연식·연료도 함께 보는 것이 안전합니다."
          iconKey="symptom"
        />
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {SYMPTOM_HUB_ITEMS.map((s) => {
          const iconKey = (SYMPTOM_ITEM_ICONS[s.id] ?? "symptom") as IconKey;
          return (
            <article className={`${bm.cardSymptom} flex flex-col`} key={s.id}>
              <div className="flex items-start gap-2">
                <IconBadge iconKey={iconKey} tone="amber" />
                <h3 className="text-sm font-bold text-slate-950">{s.title}</h3>
              </div>
              <dl className="mt-3 space-y-2 text-[11px]">
                <div>
                  <dt className="font-bold text-slate-400">가능한 원인</dt>
                  <dd className="mt-0.5 font-medium text-slate-600">{s.causes}</dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-400">배터리 가능성</dt>
                  <dd className="mt-0.5 font-medium text-slate-700">{s.batteryChance}</dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-400">먼저 볼 것</dt>
                  <dd className="mt-0.5 font-medium text-slate-600">{s.quickCheck}</dd>
                </div>
              </dl>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-800">
                <AppIcon iconKey="batterySpec" size="sm" />
                {s.action}
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-3">
                <Link className={`${bm.btnNavy} text-[10px]`} href={searchHref(s.searchQuery)}>
                  관련 검색
                </Link>
                {s.diagnosisSlug ? (
                  <Link className={`${bm.btnSecondary} hidden text-[10px] sm:inline-flex`} href={symptomDiagnosisHref(s.diagnosisSlug)}>
                    단계별 보기
                  </Link>
                ) : null}
                {s.qnaHref ? (
                  <Link className={`${bm.btnGhost} text-[10px]`} href={s.qnaHref}>
                    Q&A
                  </Link>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <section className={bm.platformStrip}>
        <p className="text-xs font-medium text-slate-600">
          증상만으로 규격을 정하지 않습니다. 차종·연식·연료와 함께 보시면 오주문을 줄일 수 있습니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className={`${bm.btnGhost} inline-flex items-center gap-1 text-xs`} href={HUB_ORDER_CHECKLIST}>
            <AppIcon iconKey="checklist" size="sm" />
            주문 전 체크리스트
          </Link>
          <Link className={`${bm.btnGhost} inline-flex items-center gap-1 text-xs`} href={HUB_PHOTO_CHECK}>
            <AppIcon iconKey="photoCheck" size="sm" />
            사진 확인 안내
          </Link>
        </div>
      </section>

      <PlatformHubLinks title="관련 안내" limit={4} />
    </div>
  );
}
