import Link from "next/link";
import type { CustomerGuidePageData } from "@/data/customer-guide";
import { CUSTOMER_GUIDE_NAV } from "@/data/customer-guide";
import { CUSTOMER_CENTER_HUB } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";
import { UsedBatteryOrderPrecheck } from "@/components/customer/UsedBatteryOrderPrecheck";
import { BankTransferPolicySection } from "@/components/order/BankTransferPolicySection";
import { CustomerConsultCta } from "@/components/support/CustomerConsultCta";

export function CustomerGuideLayout({ guide }: { guide: CustomerGuidePageData }) {
  return (
    <div className="customer-guide space-y-6" data-guide={guide.slug}>
      <nav className="flex flex-wrap gap-1.5">
        {CUSTOMER_GUIDE_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-600 hover:bg-blue-50 hover:text-blue-800"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {guide.intro ? (
        <p className="rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-3 text-sm font-medium leading-relaxed text-slate-700">
          {guide.intro}
        </p>
      ) : null}

      {guide.sections.map((section) =>
        section.variant === "bank-transfer-policy" ? (
          <section key={section.heading} className="scroll-mt-24">
            <BankTransferPolicySection />
          </section>
        ) : section.variant === "used-battery-precheck" ? (
          <section key={section.heading} className={`${bm.card} ${bm.cardPad} scroll-mt-24`}>
            <UsedBatteryOrderPrecheck />
          </section>
        ) : (
        <section
          key={section.heading}
          id={section.anchorId}
          className={`${bm.card} ${bm.cardPad} scroll-mt-24`}
        >
          <h2 className="text-base font-black text-slate-950">{section.heading}</h2>
          {section.paragraphs?.map((p) => (
            <p key={p} className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
              {p}
            </p>
          ))}
          {section.bullets?.length ? (
            <ul className="mt-3 list-none space-y-2 p-0">
              {section.bullets.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-sm font-medium text-slate-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          {section.callout ? (
            <p className="mt-3 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2.5 text-xs font-bold leading-relaxed text-amber-900">
              {section.callout}
            </p>
          ) : null}
          {section.cta ? (
            <Link
              href={section.cta.href}
              className={`${bm.btnTertiary} mt-3 inline-flex text-xs`}
            >
              {section.cta.label} →
            </Link>
          ) : null}
        </section>
        ),
      )}

      <CustomerConsultCta />

      <p className="text-center text-xs font-medium text-slate-500">
        <Link href={CUSTOMER_CENTER_HUB} className="font-black text-blue-700 hover:underline">
          고객센터 홈
        </Link>
        으로 돌아가기
      </p>
    </div>
  );
}
