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
      <p className="home-benefits-section-header__badge">{BENEFITS_HUB_BADGE}</p>
      <h2 className="home-benefits-section-title mt-2 sm:mt-2">{BENEFITS_HUB_TITLE}</h2>
      <div className="home-benefits-section-header__rule" aria-hidden />
    </header>
  );
}
