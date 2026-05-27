import Link from "next/link";
import { bm } from "@/lib/design-tokens";

export type RelatedItem = { label: string; meta?: string; href: string };

export function RelatedContentList({
  title = "함께 보면 좋은 내용",
  groups,
}: {
  title?: string;
  groups: { label: string; items: RelatedItem[] }[];
}) {
  const visible = groups.filter((g) => g.items.length > 0);
  if (!visible.length) return null;

  return (
    <section className={`${bm.card} ${bm.cardPad}`}>
      <h3 className="text-sm font-black text-slate-900">{title}</h3>
      <div className="mt-3 space-y-3">
        {visible.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{group.label}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  {item.label}
                  {item.meta ? <span className="ml-1 font-semibold text-slate-400">· {item.meta}</span> : null}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
