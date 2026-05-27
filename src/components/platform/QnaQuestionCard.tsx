"use client";



import Link from "next/link";

import { ContentUiIcon } from "@/components/content/ContentUiIcon";

import { BatteryMiniSpecLink } from "@/components/battery/BatteryMiniSpecLink";
import { extractBatteryCodesFromTags } from "@/lib/battery-tags";
import { normalizeBatteryCode } from "@/lib/batteryNormalize";
import {

  compareHref,

  getBattery,

  guideHref,

  searchHref,

  vehicleHref,

  type Question,

} from "@/lib/platform-data";

import { resolveQuestionContentUiIcon } from "@/lib/content-ui-icons";

import {

  getShortAnswer,

  inferQuestionType,

  pickQuestionDisplayTags,

} from "@/lib/qna-hub-data";



export function QnaQuestionCard({

  question,

  open,

  onToggle,

  compact = false,

}: {

  question: Question;

  open: boolean;

  onToggle: () => void;

  compact?: boolean;

  featured?: boolean;

}) {

  const type = inferQuestionType(question);

  const iconKey = resolveQuestionContentUiIcon(question, type);

  const summary = getShortAnswer(question);

  const tagChip = pickQuestionDisplayTags(question, type)[0];

  const compareTarget = question.batteryCode ? getBattery(question.batteryCode).compareWith[0] : null;

  const linkedBatteryCodes = (() => {
    const codes = new Set<string>();
    if (question.batteryCode) codes.add(normalizeBatteryCode(question.batteryCode));
    for (const c of extractBatteryCodesFromTags(question.tags)) codes.add(c);
    if (compareTarget) codes.add(normalizeBatteryCode(compareTarget));
    return [...codes].slice(0, 4);
  })();

  const titleClass = compact

    ? "line-clamp-2 text-[15px] font-bold leading-[1.4] tracking-[-0.01em] text-slate-950 sm:text-[16px]"

    : "line-clamp-2 text-[16px] font-bold leading-[1.4] tracking-[-0.01em] text-slate-950 sm:text-[17px]";



  const metaLine = [type, tagChip].filter(Boolean).join(" · ");



  return (

    <article className="group rounded-xl border border-slate-200/90 bg-white transition duration-200 hover:border-slate-300 hover:shadow-sm">

      <div

        className="flex cursor-pointer items-start gap-3 p-3"

        onClick={onToggle}

        onKeyDown={(e) => {

          if (e.key === "Enter" || e.key === " ") {

            e.preventDefault();

            onToggle();

          }

        }}

        role="button"

        tabIndex={0}

        aria-expanded={open}

      >

        <ContentUiIcon iconKey={iconKey} size={48} />



        <div className="min-w-0 flex-1">

          <h3 className={titleClass}>{question.title}</h3>



          {!open ? (

            <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-snug text-slate-600">{summary}</p>

          ) : null}

          {linkedBatteryCodes.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
              {linkedBatteryCodes.map((c) => (
                <BatteryMiniSpecLink key={c} code={c} compact />
              ))}
            </div>
          ) : null}

          <div className="mt-2 flex items-center justify-between gap-2">

            {metaLine ? (

              <p className="text-[10px] font-medium text-slate-400">{metaLine}</p>

            ) : (

              <span />

            )}

            <span className="shrink-0 whitespace-nowrap text-[11px] font-black text-blue-600">

              {open ? "접기" : "답변 보기"} →

            </span>

          </div>

        </div>

      </div>



      {open ? (

        <div className="border-t border-slate-100 px-3 pb-3 pt-2.5 sm:pl-[60px]" onClick={(e) => e.stopPropagation()}>

          <p className="text-sm font-medium leading-relaxed text-slate-600">{question.answer}</p>

          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">

            {question.vehicleId ? (

              <Link className="text-blue-600 hover:underline" href={vehicleHref(question.vehicleId)}>

                관련 차량 보기

              </Link>

            ) : null}

            {question.batteryCode ? (

              <Link className="text-blue-600 hover:underline" href={searchHref(question.batteryCode)}>

                관련 배터리 보기

              </Link>

            ) : null}

            {question.batteryCode && compareTarget ? (

              <Link className="text-blue-600 hover:underline" href={compareHref(question.batteryCode, compareTarget)}>

                비교 보기

              </Link>

            ) : null}

            {question.guideId ? (

              <Link className="text-blue-600 hover:underline" href={guideHref(question.guideId)}>

                가이드 보기

              </Link>

            ) : null}

          </div>

        </div>

      ) : null}

    </article>

  );

}


