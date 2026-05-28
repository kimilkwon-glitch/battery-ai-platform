import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { HUB_STORE } from "@/lib/customer-hub-routes";
import { HOME_STORE_CARDS } from "@/lib/home-upgrade-v2-data";
import { HOME_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import { STORE_CARD_ICONS } from "@/lib/icon-map";
import type { IconKey } from "@/lib/icon-map";
import { bm } from "@/lib/design-tokens";

const STORE_SLOT: Record<string, () => import("@/lib/media/image-slot-registry").ImageSlotDefinition> = {
  deokcheon: HOME_IMAGE_SLOTS.storeDeokcheon,
  hakjang: HOME_IMAGE_SLOTS.storeHakjang,
  outbound: HOME_IMAGE_SLOTS.outboundField,
  "photo-guide": HOME_IMAGE_SLOTS.inspectionGear,
};

export function HomeStoreHub() {
  return (
    <HomeSectionShell rhythm="service" data-section="stores">
      <SectionHeader
        label="부산 직영"
        title="덕천점 · 학장점 · 출장 교체"
        description="부산은 가까운 직영점 기준으로 내방·출장을 안내합니다. 덕천·학장 직영점 정책은 동일합니다."
        iconKey="store"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {HOME_STORE_CARDS.map((store) => {
          const slotFn = STORE_SLOT[store.id];
          const iconKey = (STORE_CARD_ICONS[store.id] ?? "location") as IconKey;
          const preferTabler = store.id === "outbound";
          return (
            <article className={`${bm.cardServiceStore} overflow-hidden`} key={store.id}>
              {slotFn ? (
                <div className="border-b border-slate-100 p-2">
                  <MediaImageSlot slot={slotFn()} compact />
                </div>
              ) : null}
              <div className="p-3.5">
                <div className="flex items-start gap-2">
                  <span className="bm-icon-pill" aria-hidden>
                    <AppIcon iconKey={iconKey} size="sm" preferTabler={preferTabler} strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{store.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-blue-700">
                      <AppIcon iconKey="location" size="xs" strokeWidth={2.5} />
                      {store.region}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs font-medium text-slate-700">{store.areas}</p>
                <p className="mt-1 text-[10px] font-medium text-slate-600">{store.scenarios}</p>
                <Link className={`${bm.btnCardSecondary} mt-2.5 inline-flex text-[10px]`} href={store.href}>
                  안내 보기
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      <Link className={`${bm.btnNavy} mt-4 inline-flex items-center gap-1.5 text-xs`} href={HUB_STORE}>
        <AppIcon iconKey="store" size="sm" className="!text-white" />
        매장·출장 안내
      </Link>
    </HomeSectionShell>
  );
}
