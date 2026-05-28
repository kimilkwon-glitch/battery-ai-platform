import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { HUB_PHOTO, HUB_SHOP, HUB_SHOP_ANCHORS } from "@/lib/customer-hub-routes";
import { HOME_DELIVERY_STEPS, HOME_POPULAR_BATTERIES } from "@/lib/home-upgrade-v2-data";
import { HOME_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import { DELIVERY_STEP_ICONS } from "@/lib/icon-map";
import type { IconKey } from "@/lib/icon-map";
import { bm } from "@/lib/design-tokens";

export function HomeDeliverySection() {
  return (
    <HomeSectionShell rhythm="delivery" data-section="delivery">
      <SectionHeader
        label="택배 주문"
        title="규격 확인 후 택배 주문"
        description="단자 방향과 현재 장착 배터리 라벨을 확인하면 오주문을 줄일 수 있습니다."
        iconKey="delivery"
      />
      <div className="grid gap-3 lg:grid-cols-3">
        {HOME_DELIVERY_STEPS.map((step, i) => {
          const iconKey = (DELIVERY_STEP_ICONS[i] ?? "delivery") as IconKey;
          return (
            <article className={`${bm.cardPhotoCheck} flex flex-col p-4`} key={step.title}>
              <div className="flex items-center gap-2">
                <span className="bm-icon-pill shrink-0" aria-hidden>
                  <AppIcon iconKey={iconKey} size="sm" />
                </span>
                <p className="text-sm font-bold text-slate-900">{step.title}</p>
              </div>
              <p className="mt-1 flex-1 text-xs font-medium leading-relaxed text-slate-600">{step.desc}</p>
              <Link className={`${bm.btnSecondary} mt-3 inline-flex w-fit items-center gap-1 text-[10px]`} href={step.href}>
                바로가기
              </Link>
            </article>
          );
        })}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MediaImageSlot slot={HOME_IMAGE_SLOTS.deliveryPack()} compact />
        <MediaImageSlot slot={HOME_IMAGE_SLOTS.deliveryCheck()} compact />
        <MediaImageSlot slot={HOME_IMAGE_SLOTS.deliveryLabel()} compact />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link className={`${bm.btnNavy} inline-flex items-center gap-1.5 text-xs`} href="#home-popular-batteries">
          <AppIcon iconKey="batterySpec" size="sm" className="!text-white" />
          많이 찾는 규격 보기
        </Link>
        <Link className={`${bm.btnSecondary} inline-flex items-center gap-1.5 text-xs`} href={HUB_PHOTO}>
          <AppIcon iconKey="photoCheck" size="sm" />
          사진으로 최종 확인
        </Link>
        <Link className={`${bm.btnGhost} inline-flex items-center gap-1.5 text-xs`} href={HUB_SHOP_ANCHORS.delivery}>
          <AppIcon iconKey="delivery" size="sm" />
          택배 주문 안내
        </Link>
      </div>
      <p className="mt-3 text-[10px] font-medium text-slate-500">
        대표 규격: {HOME_POPULAR_BATTERIES.slice(0, 4).map((b) => b.code).join(" · ")} 등 —{" "}
        <Link className="font-bold text-blue-700 underline-offset-2 hover:underline" href={HUB_SHOP}>
          쇼핑 허브
        </Link>
      </p>
    </HomeSectionShell>
  );
}
