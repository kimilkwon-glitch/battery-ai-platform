"use client";



import Image from "next/image";
import Link from "next/link";

import { ContentUiIcon } from "@/components/content/ContentUiIcon";
import { getQuestionThumbnailUrl } from "@/lib/media/resolve-asset-image";

import { BatteryMiniSpecLink } from "@/components/battery/BatteryMiniSpecLink";
import { extractBatteryCodesFromTags } from "@/lib/battery-tags";
import { normalizeBatteryCode } from "@/lib/batteryNormalize";
import { HUB_PHOTO, HUB_STORE } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";
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
    for (const c of question.relatedBatteryCodes ?? []) codes.add(normalizeBatteryCode(c));
    for (const c of extractBatteryCodesFromTags(question.tags)) codes.add(c);
    if (compareTarget) codes.add(normalizeBatteryCode(compareTarget));
    return [...codes].slice(0, 4);
  })();

  const showPhotoCta = question.ctaType === "photo" || /사진|단자|라벨|포터|하이브리드/.test(question.title);
  const showInquiryCta = question.ctaType === "inquiry" || /방전|문의|매장/.test(question.category);
  const thumbUrl = getQuestionThumbnailUrl(question);

  const titleClass = compact

    ? "line-clamp-2 text-[15px] font-bold leading-[1.4] tracking-[-0.01em] text-slate-950 sm:text-[16px]"

    : "line-clamp-2 text-[16px] font-bold leading-[1.4] tracking-[-0.01em] text-slate-950 sm:text-[17px]";



  const metaLine = [type, tagChip].filter(Boolean).join(" · ");



  return (

    <article className={`group ${bm.cardInteractive}`}>

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

        {thumbUrl ? (
          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
            <Image
              alt=""
              className="object-cover object-center"
              fill
              loading="lazy"
              sizes="48px"
              src={thumbUrl}
            />
          </div>
        ) : (
          <ContentUiIcon iconKey={iconKey} size={48} />
        )}



        <div className="min-w-0 flex-1">

          <h3 className={`font-heading ${titleClass}`}>{question.title}</h3>



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
            {question.relatedSearchQueries?.slice(0, 2).map((sq) => (
              <Link className="text-blue-600 hover:underline" href={searchHref(sq)} key={sq}>
                {sq}
              </Link>
            ))}
            <Link className="font-semibold text-slate-700 hover:underline" href={`/community/${question.id}`}>
              자세히 보기
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {showPhotoCta ? (
              <Link className={`${bm.btnPrimary} text-[10px] px-3 py-2`} href={HUB_PHOTO}>
                사진으로 최종 확인
              </Link>
            ) : null}
            {showInquiryCta || showPhotoCta ? (
              <Link className={`${bm.btnSecondary} text-[10px] px-3 py-2`} href={HUB_STORE}>
                부산 매장/출장 문의
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

    </article>

  );

}


