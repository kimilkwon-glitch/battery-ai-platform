import Link from "next/link";
import { bm } from "@/lib/design-tokens";
import type { FuelVariantCard } from "@/lib/search/sorento-mq4-fuel-split";

export function SearchFuelVariantCards({ variants }: { variants: FuelVariantCard[] }) {
  return (
    <section className={`${bm.card} ${bm.cardPad}`} data-search-fuel-split>
      <h2 className={bm.cardTitle}>연료·트림별 추천</h2>
      <p className={`mt-0.5 ${bm.muted} text-xs`}>
        같은 차종이라도 하이브리드와 디젤·가솔린은 배터리 규격이 다릅니다.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {variants.map((v) => (
          <article
            key={v.fuelLabel}
            className={`rounded-xl border p-4 ${
              v.statusTone === "confirmed"
                ? "border-emerald-200/80 bg-emerald-50/40"
                : "border-amber-200/80 bg-amber-50/35"
            }`}
          >
            <p className="text-sm font-black text-slate-900">{v.fuelLabel}</p>
            <p className="mt-1 text-xs font-semibold text-slate-600">
              추천 규격: <span className="spec-code font-black text-slate-900">{v.spec}</span>
            </p>
            <p
              className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${
                v.statusTone === "confirmed"
                  ? "bg-emerald-100 text-emerald-900"
                  : "bg-amber-100 text-amber-950"
              }`}
            >
              {v.status}
            </p>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">{v.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link className={`${bm.btnNavy} text-xs`} href={v.primaryHref}>
                {v.primaryLabel}
              </Link>
              <Link className={`${bm.btnSecondary} text-xs`} href={v.secondaryHref}>
                {v.secondaryLabel}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
