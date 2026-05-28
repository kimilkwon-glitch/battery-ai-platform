import Link from "next/link";
import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import { BatterySpecBadge } from "@/components/common/BatterySpecBadge";
import { CardHorizontalLayout } from "@/components/cards/CardHorizontalLayout";
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
    <CardHorizontalLayout
      as={Link}
      className={`block overflow-hidden ${productCardShell}`}
      href={href}
      imagePanel={
        <div className={`${bm.cardHorizontalMedia} !border-0 !p-1`}>
          <div className="relative flex h-full min-h-[132px] w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--bm-image-bg)] md:min-h-[156px]">
            <BatteryThumbnail
              code={code}
              imageSet={imageSet}
              role="main"
              fit="contain"
              tall
              overlayLabel={false}
              darkOverlay={false}
              className="!h-[118px] !max-h-[145px] !w-auto !max-w-[95%] md:!h-[142px]"
            />
          </div>
        </div>
      }
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-base font-black text-slate-950">{code}</p>
        {badge ? <BatterySpecBadge tone="blue">{badge}</BatterySpecBadge> : null}
      </div>
      {specLine ? <p className="text-xs font-bold text-slate-600">{specLine}</p> : null}
      {vehicles ? (
        <p className="line-clamp-2 text-[10px] font-semibold text-slate-500">대표 차량 · {vehicles}</p>
      ) : null}
      <span className={`${bm.btnCardNavy} mt-1 w-fit`}>{actionLabel}</span>
    </CardHorizontalLayout>
  );
}
