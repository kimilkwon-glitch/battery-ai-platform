"use client";



import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";

import { useCallback, useEffect, useMemo, useState } from "react";

import {

  compareHref,

  guideHref,

  photoHref,

  searchHref,

  serviceHref,

  vehicleHref,

} from "@/lib/platform-data";

import { bm } from "@/lib/design-tokens";

import { buildAiQuerySummary } from "@/lib/ai-query-summary";

import { inquirySearchChips } from "@/lib/inquiry-hub-data";

import { getSuggestedActionsFromQuestion, toMockAiAnswer } from "@/lib/qnaMatcher";



function formatList(values: string[], empty: string): string {

  return values.length > 0 ? values.join(", ") : empty;

}



export function AiQuestionClient({

  initialQ,

  showInlineChips = true,

}: {

  initialQ?: string;

  showInlineChips?: boolean;

}) {

  const router = useRouter();

  const params = useSearchParams();

  const [question, setQuestion] = useState(initialQ ?? params.get("q") ?? "");

  const [answer, setAnswer] = useState<ReturnType<typeof toMockAiAnswer> | null>(null);



  const runSearch = useCallback((q: string) => {

    const trimmed = q.trim();

    if (!trimmed) return;

    setQuestion(trimmed);

    setAnswer(toMockAiAnswer(trimmed));

    router.replace(`/ai?q=${encodeURIComponent(trimmed)}`, { scroll: false });

  }, [router]);



  useEffect(() => {

    const q = params.get("q");

    if (q) {

      setQuestion(q);

      setAnswer(toMockAiAnswer(q));

    }

  }, [params]);



  useEffect(() => {

    if (initialQ && !params.get("q")) {

      runSearch(initialQ);

    }

  }, [initialQ, params, runSearch]);



  const querySummary = useMemo(() => buildAiQuerySummary(question), [question]);

  const actions = answer ? getSuggestedActionsFromQuestion(answer.question) : [];



  return (

    <div className="space-y-4">

      <section className={`${bm.heroPanel} p-5 sm:p-6`}>

        <form

          className="grid gap-3 md:grid-cols-[1fr_auto]"

          onSubmit={(e) => {

            e.preventDefault();

            runSearch(question);

          }}

        >

          <input

            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-inner outline-none ring-blue-200 placeholder:text-slate-400 focus:border-blue-300 focus:ring-2"

            placeholder="예: A6 블랙박스 방전 / AGM80L 대신 DIN74L 가능한가요?"

            value={question}

            onChange={(e) => setQuestion(e.target.value)}

          />

          <button

            type="submit"

            className="h-12 rounded-xl bg-[#1D4ED8] px-6 text-sm font-black text-white shadow-sm hover:bg-blue-700"

          >

            답변 찾기

          </button>

        </form>



        <p className="mt-3 text-xs font-medium text-slate-500">

          차량명·연식·연료·현재 배터리 규격을 함께 입력하면 더 정확하게 찾을 수 있습니다.

        </p>



        {showInlineChips ? (

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

            {inquirySearchChips.slice(0, 3).map((chip) => (

              <button

                type="button"

                key={chip}

                onClick={() => runSearch(chip)}

                className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"

              >

                {chip}

              </button>

            ))}

          </div>

        ) : null}

      </section>



      {querySummary ? (

        <section className={`${bm.card} p-4`} id="ai-query-summary">

          <p className="text-xs font-bold text-blue-600">질문 요약</p>

          <div className="mt-3 space-y-2 rounded-xl bg-slate-50/90 p-3 ring-1 ring-slate-100">

            <p className="text-xs font-bold text-slate-700">

              검색어: <span className="font-semibold text-slate-900">{querySummary.query}</span>

            </p>

            <p className="text-xs font-medium text-slate-600">

              인식된 차량: {formatList(querySummary.vehicleLabel ? [querySummary.vehicleLabel] : [], "차량명 추가 입력 권장")}

            </p>

            <p className="text-xs font-medium text-slate-600">
              인식된 증상: {querySummary.symptomDisplay}
            </p>
            {querySummary.purposeLabel ? (
              <p className="text-xs font-medium text-slate-600">
                인식된 목적: {querySummary.purposeLabel}
              </p>
            ) : null}
            <p className="text-xs font-medium text-slate-600">
              참고 규격/검색 규격:{" "}
              {querySummary.referenceSpec ?? formatList(querySummary.specLabels, "확인 필요")}
            </p>

            {querySummary.guidance ? (

              <p className="text-xs font-semibold leading-relaxed text-amber-900">{querySummary.guidance}</p>

            ) : null}

          </div>

          <p className="mt-3 text-[11px] font-black text-slate-500">다음 행동</p>

          <div className="mt-2 flex flex-wrap gap-2">

            {querySummary.ctas.map((cta) => (

              <Link

                key={`${cta.label}-${cta.href}`}

                className={`${bm.btnPrimary} inline-flex text-xs`}

                href={cta.href}

              >

                {cta.label}

              </Link>

            ))}

          </div>

        </section>

      ) : null}



      {answer ? (

        <section className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <h2 className="text-lg font-black leading-snug text-slate-900">{answer.question}</h2>

          <p className="mt-1 text-[11px] font-medium text-slate-500">{answer.questionType} · 질문 분석</p>



          <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold leading-relaxed text-slate-800 ring-1 ring-slate-200">

            {answer.shortAnswer}

          </p>



          <p className="mt-4 text-xs font-medium leading-relaxed text-slate-600">{answer.summary}</p>



          {answer.warnings.length > 0 ? (

            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/50 p-3">

              <p className="text-[10px] font-black text-amber-800">확인할 것</p>

              <ul className="mt-1 list-inside list-disc text-xs font-semibold text-amber-900/80">

                {answer.warnings.map((w) => (

                  <li key={w}>{w}</li>

                ))}

              </ul>

            </div>

          ) : null}



          <div className="mt-5">

            <p className="text-sm font-black text-slate-900">관련 이동</p>

            <div className="mt-2 grid gap-2 sm:grid-cols-2">

              {actions.slice(0, 3).map((a) => (

                <Link

                  key={a.href}

                  href={a.href}

                  className="rounded-xl bg-blue-600 px-3 py-2.5 text-center text-xs font-black text-white hover:bg-blue-700"

                >

                  {a.title}

                </Link>

              ))}

            </div>

            <div className="mt-2 flex flex-wrap gap-2 text-xs font-black">

              {answer.battery && !/업그레이드|검토/i.test(answer.question) ? (

                <Link

                  href={compareHref(answer.battery.code, answer.battery.compareWith[0])}

                  className="text-blue-700 hover:underline"

                >

                  배터리 비교

                </Link>

              ) : null}

              <Link href={guideHref(answer.guideId)} className="text-blue-700 hover:underline">

                관련 가이드

              </Link>

              <Link href={photoHref(answer.battery?.code)} className="text-blue-700 hover:underline">

                사진으로 규격 확인

              </Link>

              <Link href={serviceHref(answer.vehicle?.id, answer.battery?.code)} className="text-blue-700 hover:underline">

                직영점 안내

              </Link>

            </div>

          </div>

        </section>

      ) : null}

    </div>

  );

}


