import { AppIcon } from "@/components/common/AppIcon";
import { bm } from "@/lib/design-tokens";
import type { PhotoExampleCard } from "@/lib/platform-hub-content";
import { PHOTO_EXAMPLE_ICONS } from "@/lib/icon-map";
import type { IconKey } from "@/lib/icon-map";

export function PhotoCheckExampleCard({ card }: { card: PhotoExampleCard }) {
  const good = card.kind === "good";
  const iconKey = (PHOTO_EXAMPLE_ICONS[card.icon] ?? "photoCheck") as IconKey;

  return (
    <article
      className={`${bm.cardPhotoCheck} flex flex-col overflow-hidden transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[var(--bm-shadow-md)]`}
      data-photo-example={card.kind}
    >
      <div
        className={`flex h-[100px] items-center justify-center sm:h-[108px] ${
          good
            ? "bg-gradient-to-b from-emerald-50/80 to-[var(--bm-image-bg)]"
            : "bg-gradient-to-b from-orange-50/70 to-[var(--bm-image-bg)]"
        }`}
      >
        <span
          className={`flex size-14 items-center justify-center rounded-2xl ring-1 ${
            good
              ? "bg-white ring-emerald-100"
              : "bg-white ring-orange-100"
          }`}
          aria-hidden
        >
          <AppIcon iconKey={iconKey} size="xl" tone={good ? "emerald" : "amber"} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-[var(--bm-border)] p-3">
        <span
          className={`${bm.badge} w-fit ${good ? bm.badgeGreen : bm.badgeAmber}`}
        >
          {good ? "좋은 사진" : "나쁜 사진"}
        </span>
        <h3 className="text-xs font-bold text-[var(--bm-text)]">{card.title}</h3>
        <p className="text-[10px] font-medium leading-relaxed text-[var(--bm-muted)]">{card.hint}</p>
      </div>
    </article>
  );
}
