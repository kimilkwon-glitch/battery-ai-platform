"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  CUSTOMER_CENTER_DETAIL_GROUPS,
  CUSTOMER_CENTER_HERO_CARDS,
  CUSTOMER_CENTER_HUB_COPY,
  CUSTOMER_CENTER_QUICK_LINKS,
} from "@/data/customer-guide";
import { bm } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { CustomerConsultCta } from "@/components/support/CustomerConsultCta";

export function CustomerCenterHub() {
  const [openGroup, setOpenGroup] = useState<string | null>(CUSTOMER_CENTER_DETAIL_GROUPS[0]?.id ?? null);

  return (
    <div className="customer-center-hub space-y-6" data-component="customer-center-hub">
      <section className={`${bm.card} ${bm.cardPad}`}>
        <p className="text-[11px] font-black uppercase tracking-wide text-blue-700">고객센터</p>
        <h2 className="mt-2 text-lg font-black leading-snug text-slate-950 sm:text-xl">
          {CUSTOMER_CENTER_HUB_COPY.headline}
        </h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          {CUSTOMER_CENTER_HUB_COPY.subline}
        </p>
      </section>

      <div className="grid gap-3 lg:grid-cols-3">
        {CUSTOMER_CENTER_HERO_CARDS.map((card) => (
          <section
            key={card.id}
            className={`${bm.card} ${bm.cardPad} flex flex-col border-blue-100/90 bg-gradient-to-br from-white to-blue-50/25`}
          >
            <h3 className="text-sm font-black text-slate-900">{card.title}</h3>
            <p className="mt-2 flex-1 text-xs font-medium leading-relaxed text-slate-600">
              {card.description}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {card.actions.map((action) => (
                <Link
                  key={action.href + action.label}
                  href={action.href}
                  className={cn(
                    "min-h-[2.75rem] w-full justify-center text-sm font-black",
                    action.variant === "primary" ? bm.btnPrimary : bm.btnSecondary,
                  )}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="space-y-3">
        {CUSTOMER_CENTER_DETAIL_GROUPS.map((group) => {
          const isOpen = openGroup === group.id;
          return (
            <section key={group.id} className={`${bm.card} overflow-hidden`}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:cursor-default sm:pointer-events-none"
                onClick={() => setOpenGroup(isOpen ? null : group.id)}
                aria-expanded={isOpen}
              >
                <h3 className="text-sm font-black text-slate-900">{group.title}</h3>
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-slate-400 transition sm:hidden",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              <div
                className={cn(
                  "grid gap-2 border-t border-slate-100 px-3 pb-3 pt-1 sm:grid sm:grid-cols-2 sm:gap-3 sm:px-4 sm:pb-4",
                  isOpen ? "grid" : "hidden sm:grid",
                )}
              >
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <p className="text-sm font-black text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                    <span className="mt-2 inline-block text-[11px] font-bold text-blue-700">
                      확인하기 →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">빠른 이동</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CUSTOMER_CENTER_QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200/90 hover:text-blue-800 hover:ring-blue-200"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <CustomerConsultCta />
    </div>
  );
}
