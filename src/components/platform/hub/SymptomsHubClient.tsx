"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/common/SectionHeader";
import { PlatformHubLinks } from "@/components/platform/hub/PlatformHubLinks";
import { bm } from "@/lib/design-tokens";
import { SYMPTOM_HUB_ITEMS, symptomDiagnosisHref } from "@/lib/platform-hub-content";
import { HUB_ORDER_CHECKLIST, HUB_PHOTO_CHECK } from "@/lib/platform-hub-routes";
import { searchHref } from "@/lib/platform-data";

export function SymptomsHubClient() {
  return (
    <div className="space-y-5 overflow-x-hidden" data-page="symptoms-hub">
      <section className={`${bm.reportCard} ${bm.cardPad}`}>
        <p className={bm.intentBadge}>증상 진단 허브</p>
        <SectionHeader
          title="증상으로 배터리 점검 시작하기"
          description="시동·방전·보조배터리 증상부터 확인하고, DB 검색·사진 확인·문의로 이어갑니다."
        />
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {SYMPTOM_HUB_ITEMS.map((s) => (
          <article className={`${bm.cardInteractive} flex flex-col p-4`} key={s.id}>
            <h3 className="text-sm font-bold text-slate-950">{s.title}</h3>
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
                <dt className="font-bold text-slate-400">바로 확인</dt>
                <dd className="mt-0.5 font-medium text-slate-600">{s.quickCheck}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs font-semibold text-[var(--bm-primary)]">{s.action}</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-3">
              <Link className={`${bm.btnNavy} text-[10px]`} href={searchHref(s.searchQuery)}>
                관련 검색
              </Link>
              {s.diagnosisSlug ? (
                <Link className={`${bm.btnSecondary} text-[10px]`} href={symptomDiagnosisHref(s.diagnosisSlug)}>
                  단계 확인
                </Link>
              ) : null}
              {s.qnaHref ? (
                <Link className={`${bm.btnGhost} text-[10px]`} href={s.qnaHref}>
                  Q&A
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <section className={bm.platformStrip}>
        <p className="text-xs font-medium text-slate-600">
          증상만으로 최종 규격을 단정하지 않습니다. 차종·연식·연료와 함께 확인하세요.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className={`${bm.btnGhost} text-xs`} href={HUB_ORDER_CHECKLIST}>
            오주문 체크리스트
          </Link>
          <Link className={`${bm.btnGhost} text-xs`} href={HUB_PHOTO_CHECK}>
            사진 확인 안내
          </Link>
          <Link className={`${bm.btnGhost} text-xs`} href="/diagnosis">
            기존 증상 진단 흐름
          </Link>
        </div>
      </section>

      <PlatformHubLinks title="연결 허브" limit={4} />
    </div>
  );
}
