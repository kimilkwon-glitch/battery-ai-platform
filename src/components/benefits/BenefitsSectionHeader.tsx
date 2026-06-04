import clsx from "clsx";
import { BENEFITS_HUB_BADGE, BENEFITS_HUB_TITLE } from "@/lib/benefits-data";

export function BenefitsSectionHeader({ className }: { className?: string }) {
  return (
    <header
      className={clsx(
        "home-benefits-section-header mx-auto max-w-3xl px-2 text-center sm:px-0",
        className,
      )}
    >
      <p className="home-benefits-section-header__badge inline-flex items-center justify-center rounded-full bg-amber-500/15 px-3 py-0.5 text-xs font-bold tracking-[0.1em] text-amber-900 ring-1 ring-amber-200/90 sm:text-[13px]">
        {BENEFITS_HUB_BADGE}
      </p>
      <h2 className="home-benefits-section-title mt-2 text-xl font-bold tracking-tight text-slate-900 sm:mt-2 sm:text-2xl lg:text-[1.75rem] lg:leading-tight">
        {BENEFITS_HUB_TITLE}
      </h2>
      <div
        className="home-benefits-section-header__rule mx-auto mt-2.5 h-px w-16 max-w-full bg-gradient-to-r from-transparent via-amber-300/90 to-transparent"
        aria-hidden
      />
    </header>
  );
}
