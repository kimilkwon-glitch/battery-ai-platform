import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { GUIDE_HUB_ITEMS } from "@/lib/guide-hub-routes";
import { bm } from "@/lib/design-tokens";

/** 가이드 허브 — 상단 메가메뉴와 동일한 4개 카테고리만 */
export default function GuidesPage() {
  return (
    <PageShell
      zone="guide"
      pageLabel="배터리 가이드"
      title="배터리 가이드"
      description="점검·증상·불량·AS 안내를 카테고리별로 확인하세요."
      searchPlaceholder="차량명, 연식, 배터리 규격 검색"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {GUIDE_HUB_ITEMS.map((item) => {
          const Icon = item.Icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`${bm.card} ${bm.cardPad} bm-card-unified flex gap-4 hover:border-indigo-200`}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Icon className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-black text-slate-900">{item.label}</span>
                <span className="mt-1 block text-xs font-medium text-slate-500">{item.description}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
