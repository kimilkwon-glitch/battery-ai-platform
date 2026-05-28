"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { QnaQuestionCard } from "@/components/platform/QnaQuestionCard";
import { bm } from "@/lib/design-tokens";
import { HUB_PHOTO, HUB_STORE } from "@/lib/customer-hub-routes";
import type { Question } from "@/lib/platform-types";

type Props = {
  title?: string;
  description?: string;
  questions: Question[];
  hubHref?: string;
  compact?: boolean;
};

export function RelatedQnaSection({
  title = "관련 질문",
  description = "비슷한 질문을 먼저 보고, 사진 확인·문의로 이어갈 수 있습니다.",
  questions,
  hubHref = "/community",
  compact = true,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const list = useMemo(() => questions.slice(0, 4), [questions]);

  if (list.length === 0) return null;

  return (
    <section className="space-y-3" data-section="related-qna">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={bm.sectionTitle}>{title}</h2>
          {description ? (
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{description}</p>
          ) : null}
        </div>
        <Link className={`${bm.btnGhost} shrink-0 text-[10px]`} href={hubHref}>
          Q&A 전체 보기
        </Link>
      </div>

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

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link className={`${bm.btnNavy} w-full text-xs sm:w-auto`} href={hubHref}>
          관련 질문 더보기
        </Link>
        <Link className={`${bm.btnGhost} w-full text-xs sm:w-auto`} href={HUB_PHOTO}>
          사진으로 확인
        </Link>
      </div>
    </section>
  );
}
