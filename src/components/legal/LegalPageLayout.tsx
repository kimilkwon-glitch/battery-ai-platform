import Link from "next/link";
import type { LegalPageData } from "@/data/legal-pages";
import { LEGAL_FOOTER_LINKS } from "@/lib/legal/legal-routes";
import { bm } from "@/lib/design-tokens";

export function LegalPageLayout({ page }: { page: LegalPageData }) {
  return (
    <div className="legal-page space-y-6" data-legal-page={page.slug}>
      <nav className="flex flex-wrap gap-1.5">
        {LEGAL_FOOTER_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-600 hover:bg-blue-50 hover:text-blue-800"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <p className="text-xs font-medium text-slate-500">최종 업데이트: {page.updatedAt}</p>

      {page.sections.map((section) => (
        <section
          key={section.heading}
          className={`legal-page-section ${bm.card} ${bm.cardPad} scroll-mt-24`}
        >
          <h2 className="text-base font-black text-slate-950">{section.heading}</h2>
          {section.paragraphs?.map((p) => (
            <p key={p} className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
              {p}
            </p>
          ))}
          {section.bullets?.length ? (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium leading-relaxed text-slate-600">
              {section.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
