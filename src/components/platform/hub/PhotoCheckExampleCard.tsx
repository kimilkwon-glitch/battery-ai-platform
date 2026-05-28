import { bm } from "@/lib/design-tokens";
import type { PhotoExampleCard } from "@/lib/platform-hub-content";

const ICONS: Record<PhotoExampleCard["icon"], string> = {
  top: "▣",
  label: "⌁",
  terminal: "⊕⊖",
  tray: "⊞",
  blur: "◌",
  hidden: "▤",
  crop: "✂",
};

export function PhotoCheckExampleCard({ card }: { card: PhotoExampleCard }) {
  const good = card.kind === "good";
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
          className={`flex size-14 flex-col items-center justify-center rounded-2xl text-lg font-black ring-1 ${
            good
              ? "bg-white text-emerald-800 ring-emerald-100"
              : "bg-white text-orange-800 ring-orange-100"
          }`}
          aria-hidden
        >
          {ICONS[card.icon]}
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
