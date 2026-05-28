import Link from "next/link";
import type { ContentGuide } from "@/data/battery/types";
import { PurposeImageSlot } from "@/components/battery/PurposeImageSlot";
import { bm } from "@/lib/design-tokens";

type Props = {
  guide: ContentGuide;
};

export function ContentGuideDetail({ guide }: Props) {
  return (
    <article className="space-y-4">
      <header className={bm.heroPanel}>
        <div className={`${bm.heroPanelAccent} p-4 sm:p-5`}>
          <p className={bm.label}>배터리 기본 안내</p>
          <h1 className={`${bm.titleMd} mt-1`}>{guide.title}</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">{guide.hook}</p>
        </div>
      </header>

      <PurposeImageSlot purpose={guide.imageSlotPurpose} caption={guide.imageSlotCaption} iconKey="guide" />

      <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
        {guide.paragraphs.map((p) => (
          <p key={p} className="text-sm font-medium leading-relaxed text-slate-600">
            {p}
          </p>
        ))}
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <p className={bm.cardTitle}>확인 포인트</p>
        <ul className="mt-2 space-y-1.5">
          {guide.checkPoints.map((c) => (
            <li key={c} className="flex gap-2 text-sm font-medium text-slate-700">
              <span className="font-black text-blue-600">✓</span>
              {c}
            </li>
          ))}
        </ul>
      </section>

      <section className={`${bm.card} ${bm.cardPad} flex flex-wrap gap-2`}>
        {guide.ctas.slice(0, 2).map((cta) => (
          <Link className={bm.btnSecondary + " text-xs"} href={cta.href} key={cta.href}>
            {cta.label}
          </Link>
        ))}
        <Link className={bm.btnTertiary + " text-xs"} href="/guides">
          가이드 목록
        </Link>
      </section>
    </article>
  );
}
