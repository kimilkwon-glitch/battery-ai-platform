import { BRAND_NOTES, BRAND_SECTION_LEAD, BRAND_SECTION_TITLE } from "@/data/battery/brandNotes";
import { bm } from "@/lib/design-tokens";

type Props = {
  compact?: boolean;
};

export function BrandNoteStrip({ compact = false }: Props) {
  return (
    <section className={`${bm.card} ${compact ? "p-3" : bm.cardPad}`}>
      <p className={bm.label}>브랜드 참고</p>
      <h2 className={`${compact ? "text-sm" : bm.titleMd} mt-1 font-black text-slate-900`}>
        {BRAND_SECTION_TITLE}
      </h2>
      <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">{BRAND_SECTION_LEAD}</p>
      <div className={`mt-3 grid gap-2 ${compact ? "" : "sm:grid-cols-2"}`}>
        {BRAND_NOTES.map((b) => (
          <div className={bm.surfaceMuted + " px-3 py-2.5"} key={b.id}>
            <p className="text-sm font-black text-slate-900">{b.displayName}</p>
            <p className="mt-1 text-xs font-medium leading-snug text-slate-600">{b.positioning}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
