import Link from "next/link";
import type { ContentGuide } from "@/data/battery/types";
import { PurposeImageSlot } from "@/components/battery/PurposeImageSlot";
import { bm } from "@/lib/design-tokens";

type Props = {
  guide: ContentGuide;
};

export function GuideTeaserCard({ guide }: Props) {
  const href = `/guides/knowledge/${guide.id}`;
  const primaryCta = guide.ctas[0];

  return (
    <article className={`${bm.card} overflow-hidden`}>
      <PurposeImageSlot
        purpose={guide.imageSlotPurpose}
        caption={guide.imageSlotCaption}
        iconKey="guide"
        compact
        className="rounded-none rounded-t-2xl"
      />
      <div className="p-3">
        <h3 className="text-sm font-black leading-snug text-slate-900">{guide.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-600">{guide.hook}</p>
        <Link className={`${bm.btnTertiary} mt-2 inline-flex text-xs`} href={href}>
          {primaryCta?.label ?? "자세히"} →
        </Link>
      </div>
    </article>
  );
}
