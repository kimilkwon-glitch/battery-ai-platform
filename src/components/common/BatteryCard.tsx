import Link from "next/link";
import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import { BatterySpecBadge } from "@/components/common/BatterySpecBadge";
import { CardHorizontalLayout } from "@/components/cards/CardHorizontalLayout";
import {
  CardInfoActions,
  CardInfoDesc,
  CardInfoMeta,
  CardInfoStack,
  CardInfoTitleRow,
} from "@/components/cards/CardHorizontalInfo";
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
      className={`group block overflow-hidden ${productCardShell}`}
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
      <CardInfoStack>
        <CardInfoTitleRow
          iconKey="batterySpec"
          title={code}
          trailing={badge ? <BatterySpecBadge tone="blue">{badge}</BatterySpecBadge> : undefined}
        />
        {specLine ? <CardInfoDesc className="font-bold text-slate-600">{specLine}</CardInfoDesc> : null}
        {vehicles ? <CardInfoMeta>대표 차량 · {vehicles}</CardInfoMeta> : null}
      </CardInfoStack>
      <CardInfoActions>
        <span className={bm.btnCardNavy}>{actionLabel}</span>
      </CardInfoActions>
    </CardHorizontalLayout>
  );
}
