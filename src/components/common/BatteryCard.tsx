import Link from "next/link";
import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import { BatterySpecBadge } from "@/components/common/BatterySpecBadge";
import { bm, productCardShell } from "@/lib/design-tokens";
import type { BatteryImageSet } from "@/lib/battery-image";

export function BatteryCard({
  code,
  capacity,
  cca,
  terminal,
  vehicles,
  href,
  imageSet,
  badge,
  actionLabel = "규격 확인",
}: {
  code: string;
  capacity?: string;
  cca?: string;
  terminal?: string;
  vehicles?: string;
  href: string;
  imageSet?: BatteryImageSet;
  badge?: string;
  actionLabel?: string;
}) {
  const specLine = [capacity, cca, terminal ? `${terminal}타입` : null].filter(Boolean).join(" · ");

  return (
    <Link href={href} className={`block overflow-hidden ${productCardShell}`}>
      <div className={bm.imageBattery}>
        <BatteryThumbnail
          code={code}
          imageSet={imageSet}
          role="main"
          fit="contain"
          tall
          overlayLabel={false}
          darkOverlay={false}
          className="h-full w-full rounded-none"
        />
      </div>
      <div className={`${bm.cardPad} pt-3`}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-black text-slate-950">{code}</p>
          {badge ? <BatterySpecBadge tone="blue">{badge}</BatterySpecBadge> : null}
        </div>
        {specLine ? <p className="mt-1 text-[11px] font-bold text-slate-500">{specLine}</p> : null}
        {vehicles ? <p className="mt-1.5 text-[10px] font-semibold text-slate-400">대표 차량 · {vehicles}</p> : null}
        <span className={`${bm.btnPrimary} mt-3 w-full`}>{actionLabel}</span>
      </div>
    </Link>
  );
}
