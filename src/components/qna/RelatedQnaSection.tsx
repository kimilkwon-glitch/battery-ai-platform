"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { QnaQuestionCard } from "@/components/platform/QnaQuestionCard";
import { bm } from "@/lib/design-tokens";
import { HUB_PHOTO, HUB_STORE } from "@/lib/customer-hub-routes";
import type { ImageSlotDefinition } from "@/lib/media/image-slot-registry";
import type { Question } from "@/lib/platform-types";

type Props = {
  title?: string;
  description?: string;
  questions: Question[];
  imageSlot?: ImageSlotDefinition | null;
  hubHref?: string;
  compact?: boolean;
};

export function RelatedQnaSection({
  title = "관련 질문",
  description = "비슷한 고객 질문을 먼저 확인한 뒤, 사진·문의로 이어가세요.",
  questions,
  imageSlot = null,
  hubHref = "/community",
  compact = true,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(questions[0]?.id ?? null);

  const list = useMemo(() => questions.slice(0, 4), [questions]);

  if (list.length === 0) return null;

  return (
    <section className={`${bm.card} ${bm.cardPad}`} data-section="related-qna">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-black tracking-[-0.02em] text-slate-950">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{description}</p>
          ) : null}
        </div>
        <Link className={`${bm.btnGhost} shrink-0 text-[10px]`} href={hubHref}>
          질문 허브 전체
        </Link>
      </div>

      {imageSlot ? (
        <div className="mt-3 max-w-md">
          <MediaImageSlot slot={imageSlot} />
        </div>
      ) : null}

      <ul className="mt-3 space-y-2">
        {list.map((q) => (
          <li key={q.id}>
            <QnaQuestionCard
              question={q}
              open={expanded === q.id}
              onToggle={() => setExpanded((prev) => (prev === q.id ? null : q.id))}
              compact={compact}
            />
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link className={`${bm.btnPrimary} text-xs`} href={HUB_PHOTO}>
          사진으로 최종 확인
        </Link>
        <Link className={`${bm.btnSecondary} text-xs`} href={HUB_STORE}>
          부산 매장/출장 문의
        </Link>
      </div>
    </section>
  );
}
