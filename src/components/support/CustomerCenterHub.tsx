import Link from "next/link";
import {
  CUSTOMER_CENTER_HUB_CARDS,
  CUSTOMER_CENTER_HUB_COPY,
} from "@/data/customer-guide";
import { CUSTOMER_CENTER_FAQ } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";
import { CustomerConsultCta } from "@/components/support/CustomerConsultCta";

export function CustomerCenterHub() {
  return (
    <div className="customer-center-hub space-y-6" data-component="customer-center-hub">
      <section className={`${bm.card} ${bm.cardPad} border-blue-100/80 bg-gradient-to-br from-white to-blue-50/30`}>
        <p className="text-[11px] font-black uppercase tracking-wide text-blue-700">고객센터</p>
        <h2 className="mt-2 text-lg font-black leading-snug text-slate-950 sm:text-xl">
          {CUSTOMER_CENTER_HUB_COPY.headline}
        </h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          {CUSTOMER_CENTER_HUB_COPY.subline}
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {CUSTOMER_CENTER_HUB_CARDS.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className={`${bm.cardInteractive} flex flex-col gap-2 p-4 sm:p-5`}
          >
            <h3 className="text-sm font-black text-slate-900">{card.title}</h3>
            <p className="flex-1 text-xs font-medium leading-relaxed text-slate-600">
              {card.description}
            </p>
            <span className="text-[11px] font-black text-blue-700">{card.cta} →</span>
          </Link>
        ))}
      </div>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h3 className="text-sm font-black text-slate-900">빠른 이동</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {CUSTOMER_CENTER_HUB_CARDS.filter((c) => c.id !== "faq").map((card) => (
            <Link key={card.id} className={`${bm.btnTertiary} text-[11px]`} href={card.href}>
              {card.cta}
            </Link>
          ))}
          <Link className={`${bm.btnTertiary} text-[11px]`} href={CUSTOMER_CENTER_FAQ}>
            FAQ 전체 보기
          </Link>
        </div>
      </section>

      <CustomerConsultCta />
    </div>
  );
}
