import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { GUIDE_HUB_ITEMS } from "@/lib/guide-hub-routes";
import { HUB_SUPPORT } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";

export function GuideSubPage({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: { heading: string; items: string[] }[];
}) {
  return (
    <PageShell pageLabel="배터리 가이드" title={title} description={description}>
      <div className="space-y-6">
        <nav className="flex flex-wrap gap-2">
          {GUIDE_HUB_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-600 hover:bg-blue-50 hover:text-blue-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {sections.map((section) => (
          <section key={section.heading} className={`${bm.card} ${bm.cardPad}`}>
            <h2 className="text-base font-black text-slate-950">{section.heading}</h2>
            <ul className="mt-3 space-y-2">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5 text-sm font-medium text-slate-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="text-center text-xs font-medium text-slate-500">
          자세한 문의는{" "}
          <Link href={HUB_SUPPORT} className="font-black text-blue-700 hover:underline">
            고객센터
          </Link>
          로 연결해 주세요.
        </p>
      </div>
    </PageShell>
  );
}
