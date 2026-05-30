import clsx from "clsx";
import {
  BENEFITS_HUB_BADGE,
  BENEFITS_HUB_SUBTITLE,
  BENEFITS_HUB_TITLE,
} from "@/lib/benefits-data";

export function BenefitsSectionHeader({ className }: { className?: string }) {
  return (
    <header
      className={clsx(
        "home-benefits-section-header mx-auto max-w-3xl px-2 text-center sm:px-0",
        className,
      )}
    >
      <p className="home-benefits-section-header__badge inline-flex items-center justify-center rounded-full bg-amber-500/15 px-3.5 py-1 text-sm font-black tracking-[0.12em] text-amber-900 ring-1 ring-amber-200/90">
        {BENEFITS_HUB_BADGE}
      </p>
      <h2 className="home-benefits-section-title mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:mt-3.5 sm:text-3xl lg:text-4xl">
        {BENEFITS_HUB_TITLE}
      </h2>
      <p className="home-benefits-section-header__desc mt-3 text-base font-semibold leading-relaxed text-slate-600 sm:text-lg">
        {BENEFITS_HUB_SUBTITLE}
      </p>
      <div
        className="home-benefits-section-header__rule mx-auto mt-4 h-px w-20 max-w-full bg-gradient-to-r from-transparent via-amber-300/90 to-transparent"
        aria-hidden
      />
    </header>
  );
}
