"use client";

import clsx from "clsx";
import { HOME_BENEFIT_CARDS, HOME_BENEFITS_SUBTITLE, HOME_BENEFITS_TITLE } from "@/lib/home-benefits-data";

export function HomeBenefitsSection() {
  return (
    <section
      className="home-benefits-section mt-10 sm:mt-12"
      data-home-section="benefits"
      aria-label={HOME_BENEFITS_TITLE}
    >
      <div className="text-center">
        <h2 className="text-[11px] font-black uppercase tracking-wide text-slate-500">
          {HOME_BENEFITS_TITLE}
        </h2>
        <p className="mt-1 text-[11px] font-medium text-slate-500">{HOME_BENEFITS_SUBTITLE}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {HOME_BENEFIT_CARDS.map((card) => {
          const active = card.status === "active";
          return (
            <article
              key={card.id}
              className={clsx(
                "home-benefit-card rounded-2xl border p-4 transition duration-[220ms] motion-safe:hover:-translate-y-0.5",
                active
                  ? "border-blue-100 bg-gradient-to-br from-white to-blue-50/40 shadow-sm hover:shadow-md"
                  : "border-dashed border-slate-200 bg-slate-50/60 opacity-80",
              )}
            >
              <p className="text-sm font-black text-slate-900">{card.title}</p>
              {!active ? (
                <span className="mt-1 inline-block text-[9px] font-black uppercase text-slate-400">
                  상담 시 안내
                </span>
              ) : null}
              <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">
                {card.description}
              </p>
              {card.note ? (
                <p className="mt-2 text-[10px] font-medium text-slate-400">{card.note}</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
