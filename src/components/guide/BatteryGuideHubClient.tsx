"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  BATTERY_GUIDE_DEFAULT_CATEGORY,
  BATTERY_GUIDE_HUB_CONTENT,
  parseBatteryGuideCategory,
} from "@/data/battery-guide-hub-content";
import { GUIDE_HUB_ITEMS } from "@/lib/guide-hub-routes";
import { HUB_QA, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

const GUIDE_CTAS = [
  { label: "배터리 점검 문의하기", href: "/support?tab=inquiry", primary: true },
  { label: "매장·출장 안내 보기", href: HUB_STORE_DETAIL, primary: false },
  { label: "증상별 Q&A 보기", href: HUB_QA, primary: false },
] as const;

export function BatteryGuideHubClient({ initialCategory }: { initialCategory?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(() =>
    parseBatteryGuideCategory(initialCategory ?? searchParams.get("cat")),
  );

  useEffect(() => {
    setActive(parseBatteryGuideCategory(searchParams.get("cat") ?? initialCategory));
  }, [searchParams, initialCategory]);

  const selectCategory = useCallback(
    (id: string) => {
      setActive(id);
      const params = new URLSearchParams(searchParams.toString());
      if (id === BATTERY_GUIDE_DEFAULT_CATEGORY) params.delete("cat");
      else params.set("cat", id);
      const qs = params.toString();
      router.replace(qs ? `/guides?${qs}` : "/guides", { scroll: false });
    },
    [router, searchParams],
  );

  const content = BATTERY_GUIDE_HUB_CONTENT[active] ?? BATTERY_GUIDE_HUB_CONTENT.maintenance;

  return (
    <div className="battery-guide-hub space-y-5" data-page="battery-guide-hub">
      <header className="cp-hero battery-guide-hero cp-hero--emerald">
        <p className="cp-hero__kicker">Battery Guide</p>
        <h2 className="cp-hero__title">배터리 점검·증상·AS 가이드</h2>
        <p className="cp-hero__desc">
          카테고리를 선택하면 점검 방법, 증상 진단, 불량 안내, AS 절차를 확인할 수 있습니다.
        </p>
        <span className="cp-hero__accent" aria-hidden />
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {GUIDE_HUB_ITEMS.map((item) => {
          const Icon = item.Icon;
          const selected = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectCategory(item.id)}
              aria-pressed={selected}
              className={cn(
                `${bm.card} ${bm.cardPad} battery-guide-cat flex w-full gap-4 text-left transition`,
                selected
                  ? "battery-guide-cat--active border-2 border-blue-500 bg-blue-50/60 shadow-sm ring-0"
                  : "border border-slate-200/90 bg-white hover:border-blue-200 hover:bg-slate-50/80",
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  selected ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700",
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-black text-slate-900">{item.label}</span>
                <span className="mt-1 block text-xs font-medium leading-relaxed text-slate-500">
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <nav
        className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-3"
        aria-label="가이드 카테고리"
      >
        {GUIDE_HUB_ITEMS.map((item) => {
          const selected = active === item.id;
          return (
            <button
              key={`tab-${item.id}`}
              type="button"
              onClick={() => selectCategory(item.id)}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-black transition",
                selected ? bm.tabBtnActive : bm.tabBtn,
              )}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <section className="space-y-4" aria-live="polite">
        <h2 className="text-base font-black text-slate-950 sm:text-lg">{content.sectionTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {content.cards.map((card) => (
            <article
              key={card.title}
              className={`${bm.card} battery-guide-content-card relative overflow-hidden border-slate-200/90 ${bm.cardPad}`}
            >
              <span
                className="absolute inset-y-0 left-0 w-1 bg-blue-500/80"
                aria-hidden
              />
              <h3 className="pl-2 text-sm font-black text-slate-900">{card.title}</h3>
              <ul className="mt-2 space-y-1.5 pl-2">
                {card.lines.map((line) => (
                  <li
                    key={line}
                    className="text-sm font-medium leading-relaxed text-slate-600"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad} battery-guide-cta-bar flex flex-col gap-2 sm:flex-row sm:flex-wrap`}>
        {GUIDE_CTAS.map((cta) => (
          <Link
            key={cta.href}
            href={cta.href}
            className={cn(
              "min-h-[2.75rem] flex-1 items-center justify-center text-sm font-black sm:flex-none sm:px-5",
              cta.primary ? bm.btnPrimary : bm.btnSecondary,
            )}
          >
            {cta.label}
          </Link>
        ))}
      </section>
    </div>
  );
}
