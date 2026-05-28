"use client";

import Link from "next/link";
import { bm } from "@/lib/design-tokens";
import {
  getNextActions,
  getRelatedBatteries,
  getRelatedComparisons,
  getRelatedGuides,
  getRelatedQuestions,
  getRelatedVehicles,
  type NavContext,
  type RelatedLink,
} from "@/lib/navigationGraph";

type Props = {
  context: NavContext;
  title?: string;
  subtitle?: string;
  limit?: number;
  /** @internal 관련 링크 블록 노출 — UI에는 노출되지 않음 */
  withRelated?: boolean;
  variant?: "cards" | "compact";
};

function RelatedChip({ item }: { item: RelatedLink }) {
  return (
    <Link
      href={item.href}
      className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-black text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-200"
    >
      {item.label}
      {item.meta ? <span className="ml-1 font-semibold text-slate-400">· {item.meta}</span> : null}
    </Link>
  );
}

export function SmartNextActions({
  context,
  title = "바로 이어서 확인하기",
  subtitle = "차량·규격 확인 흐름을 이어갑니다.",
  limit = 6,
  withRelated = false,
  variant = "cards",
}: Props) {
  const actions = getNextActions(context, limit);
  if (!actions.length) return null;

  const relatedBlocks: { label: string; items: RelatedLink[] }[] = withRelated
    ? [
        { label: "관련 차량", items: getRelatedVehicles(context, 3) },
        { label: "관련 배터리", items: getRelatedBatteries(context, 3) },
        { label: "관련 가이드", items: getRelatedGuides(context, 3) },
        { label: "관련 Q&A", items: getRelatedQuestions(context, 3) },
        { label: "비교", items: getRelatedComparisons(context, 2) },
      ].filter((block) => block.items.length > 0)
    : [];

  if (variant === "compact") {
    return (
      <section className={`${bm.card} p-3`}>
        <h3 className="text-xs font-black text-slate-900">{title}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`${bm.btnGhost} hover:bg-[var(--bm-primary)] hover:text-white hover:ring-[var(--bm-primary)]`}
            >
              {a.title}
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`${bm.platformStrip}`}>
      <p className={bm.label}>다음 단계</p>
      <h3 className={`${bm.titleMd} mt-1`}>{title}</h3>
      {subtitle ? <p className={`mt-1 ${bm.textSub} text-xs`}>{subtitle}</p> : null}
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((a, index) => (
          <Link key={`${a.href}-${index}`} href={a.href} className={bm.nextStepCard}>
            <p className="text-xs font-black text-[var(--bm-text)] group-hover:text-[var(--bm-primary)]">
              {a.title}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-[var(--bm-muted)]">{a.description}</p>
          </Link>
        ))}
      </div>

      {relatedBlocks.length > 0 ? (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-xs font-black text-slate-800">함께 보면 좋은 내용</p>
          <div className="mt-3 space-y-3">
            {relatedBlocks.map((block) => (
              <div key={block.label}>
                <p className="text-[10px] font-black text-slate-400">{block.label}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {block.items.map((item) => (
                    <RelatedChip key={item.href} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
