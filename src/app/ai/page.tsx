import { Suspense } from "react";
import Link from "next/link";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";
import { PortalHeader } from "@/components/portal";
import { AiQuestionClient } from "@/components/platform/AiQuestionClient";
import { SmartNextActions } from "@/components/common/SmartNextActions";
import { InquirySimilarQuestions } from "@/components/platform/InquirySimilarQuestions";
import { BRAND_INQUIRY_LABEL } from "@/lib/brand";
import {
  featuredSimilarQuestions,
  inquiryChecklist,
  inquiryComparisons,
  inquiryLeftRecommendations,
  inquiryRecentPopular,
  inquiryScopeItems,
} from "@/lib/inquiry-hub-data";
import { aiHref } from "@/lib/platform-data";

const TOP_RECOMMENDATIONS = inquiryLeftRecommendations.slice(0, 3);

export default async function AiLandingPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  return (
    <main className="min-h-screen bg-[var(--bm-page-bg)] text-slate-950">
      <PortalHeader title="규격 문의" showSearch searchPlaceholder="차량·규격·BMS 질문" />
      <section className="relative z-0 mx-auto max-w-[1280px] scroll-mt-24 px-4 py-5">
        <div className="mb-4">
          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#2563EB]">{BRAND_INQUIRY_LABEL}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0F172A] sm:text-[1.65rem]">
            차량·증상·규격 질문을 바로 확인하세요
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
            차종, 연식, 연료, 현재 배터리 규격을 함께 적으면 더 정확하게 확인할 수 있습니다.
          </p>
          <p className="mt-2 text-xs font-medium text-slate-600">
            증상 예시:{" "}
            <Link className="font-bold text-blue-700 hover:underline" href={aiHref("A6 블랙박스 방전")}>
              아우디 A6 C8
            </Link>
            {" · "}블랙박스 방전 · 참고 규격 115D31R
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <section className="order-1 space-y-4 lg:order-1">
            <Suspense fallback={<ContentAreaFallback lines={3} />}>
              <AiQuestionClient initialQ={q} showInlineChips={false} />
            </Suspense>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-black text-slate-900">추천 질문</h2>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">자주 묻는 질문 3가지</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {TOP_RECOMMENDATIONS.map((item) => (
                  <Link
                    key={item.question}
                    href={aiHref(item.question)}
                    className="flex min-h-[72px] flex-col justify-center rounded-xl border border-blue-100 bg-blue-50/40 p-3 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <p className="text-sm font-black leading-snug text-slate-900">{item.question}</p>
                    <p className="mt-1 text-[11px] font-medium text-slate-500">{item.category}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm">
              <h2 className="text-sm font-black text-amber-950">문의 전 준비사항</h2>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs font-semibold text-amber-950">
                {inquiryChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <InquiryCollapsibleSection title="비슷한 질문" subtitle="보조 참고">
              <InquirySimilarQuestions items={featuredSimilarQuestions} />
            </InquiryCollapsibleSection>

            <InquiryCollapsibleSection title="최근 문의 많은 질문" defaultOpen={false}>
              <div className="space-y-2">
                {inquiryRecentPopular.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-blue-200 hover:shadow-sm"
                  >
                    <p className="text-sm font-black leading-snug text-slate-900">{item.title}</p>
                    <p className="mt-1 text-[11px] font-bold text-slate-400">{item.category}</p>
                  </Link>
                ))}
              </div>
            </InquiryCollapsibleSection>

            <SmartNextActions context={{ type: "community", query: q, batteryCode: "AGM80L" }} limit={4} />
          </section>

          <aside className="order-2 space-y-4 lg:order-2 lg:sticky lg:top-[calc(3.5rem+1px)] lg:h-fit">
            <InquiryPanel title="이 페이지에서 확인할 수 있는 것">
              <ul className="space-y-2">
                {inquiryScopeItems.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span className="shrink-0 text-[10px] font-black text-emerald-600" aria-hidden>
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </InquiryPanel>

            <InquiryPanel title="많이 비교한 배터리">
              <div className="space-y-2">
                {inquiryComparisons.map((pair) => (
                  <Link
                    key={pair.href}
                    href={pair.href}
                    className="block rounded-xl bg-[#0F172A] px-3 py-2.5 text-sm font-black text-white transition hover:bg-blue-900"
                  >
                    {pair.a} vs {pair.b}
                  </Link>
                ))}
              </div>
            </InquiryPanel>
          </aside>
        </div>
      </section>
    </main>
  );
}

function InquiryPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 border-b border-slate-100 pb-2 text-sm font-black text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function InquiryCollapsibleSection({
  title,
  subtitle,
  defaultOpen = true,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm" open={defaultOpen}>
      <summary className="cursor-pointer list-none px-4 py-3 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-black text-slate-900">{title}</h2>
            {subtitle ? <p className="text-[11px] font-semibold text-slate-500">{subtitle}</p> : null}
          </div>
          <span className="text-[10px] font-black text-blue-600 group-open:hidden">펼치기</span>
          <span className="hidden text-[10px] font-black text-slate-500 group-open:inline">접기</span>
        </div>
      </summary>
      <div className="border-t border-slate-100 px-4 pb-4 pt-2">{children}</div>
    </details>
  );
}
