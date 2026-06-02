"use client";

import Link from "next/link";
import { VehicleSpecBadge } from "@/components/car/VehicleSpecBadge";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { CardHorizontalLayout } from "@/components/cards/CardHorizontalLayout";
import {
  CardInfoActions,
  CardInfoCtaLink,
  CardInfoDesc,
  CardInfoMeta,
  CardInfoStack,
  CardInfoTitleRow,
} from "@/components/cards/CardHorizontalInfo";
import { carImageForPlatformVehicleId } from "@/lib/car-data";
import { getVehicleBodyType } from "@/lib/platform-data";
import { BatteryMiniSpecLink } from "@/components/battery/BatteryMiniSpecLink";
import { getVehicleCardHints, getVehicleExploreMeta } from "@/lib/vehicle-card-hints";
import {
  formatConditionSpecSummary,
  getVehicleConditionSpecLines,
} from "@/lib/vehicle-condition-spec-lines";
import { bm } from "@/lib/design-tokens";

export function HomeFeaturedVehicleCard({
  vehicleId,
  title,
  href,
  onNavigate,
}: {
  vehicleId: string;
  title: string;
  href: string;
  onNavigate?: () => void;
}) {
  const hints = getVehicleCardHints(vehicleId);
  const meta = getVehicleExploreMeta(vehicleId);
  const imageSrc = carImageForPlatformVehicleId(vehicleId);
  const bodyType = getVehicleBodyType(vehicleId);
  const isCommercial = bodyType === "truck" || bodyType === "van" || /porter|bongo/i.test(vehicleId);

  const conditionLines = getVehicleConditionSpecLines(vehicleId);
  const fuelSummary = formatConditionSpecSummary(conditionLines);
  const primaryBattery =
    hints.primaryCode === "사진 확인 필요" ? "규격 확인 필요" : hints.primaryCode;

  return (
    <CardHorizontalLayout
      as={Link}
      className={`${bm.cardVehicleMatch} group h-full`}
      href={href}
      mediaClassName="!p-0"
      onClick={onNavigate}
      imagePanel={
        <VehicleCardMedia
          alt={title}
          commercial={isCommercial}
          placeholderTitle={title}
          slug={vehicleId}
          src={imageSrc}
        />
      }
    >
      <CardInfoStack>
        <CardInfoTitleRow iconKey="vehicle" title={title} titleClassName="text-base" />
        <CardInfoMeta className="text-[11px]">{meta.categoryLine}</CardInfoMeta>
        {fuelSummary ? (
          <p className="text-xs font-bold text-slate-800">{fuelSummary}</p>
        ) : (
          <CardInfoDesc className="text-xs">
            {primaryBattery.includes("준비") || primaryBattery.includes("확인")
              ? primaryBattery
              : `참고 규격 ${primaryBattery}`}
          </CardInfoDesc>
        )}
        {conditionLines.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {conditionLines.map((line) => (
              <BatteryMiniSpecLink
                key={`${line.conditionLabel}-${line.code}`}
                code={line.code}
                label={line.conditionLabel}
                compact
              />
            ))}
          </div>
        ) : null}
        {hints.tokens.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {hints.tokens.slice(0, 2).map((token) => (
              <VehicleSpecBadge key={token.kind} token={token} />
            ))}
          </div>
        ) : null}
      </CardInfoStack>
      <CardInfoActions>
        <CardInfoCtaLink>{meta.ctaLabel} →</CardInfoCtaLink>
      </CardInfoActions>
    </CardHorizontalLayout>
  );
}
