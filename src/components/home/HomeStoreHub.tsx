import Link from "next/link";
import { MapPin, Phone, Store, Truck } from "lucide-react";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { HUB_STORE } from "@/lib/customer-hub-routes";
import { HOME_STORE_CARDS } from "@/lib/home-upgrade-v2-data";
import { HOME_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import { bm } from "@/lib/design-tokens";

const STORE_SLOT: Record<string, () => import("@/lib/media/image-slot-registry").ImageSlotDefinition> = {
  deokcheon: HOME_IMAGE_SLOTS.storeDeokcheon,
  hakjang: HOME_IMAGE_SLOTS.storeHakjang,
  outbound: HOME_IMAGE_SLOTS.outboundField,
  "photo-guide": HOME_IMAGE_SLOTS.inspectionGear,
};

const STORE_ICON: Record<string, typeof Store> = {
  deokcheon: Store,
  hakjang: Store,
  outbound: Truck,
  "photo-guide": Phone,
};

export function HomeStoreHub() {
  return (
    <HomeSectionShell rhythm="service" data-section="stores">
      <SectionHeader
        label="부산 직영"
        title="덕천점 · 학장점 · 출장 교체"
        description="북구·사상권 직영점 기준으로 내방·출장 일정을 안내합니다. 가격·서비스 정책은 동일합니다."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {HOME_STORE_CARDS.map((store) => {
          const slotFn = STORE_SLOT[store.id];
          const Icon = STORE_ICON[store.id] ?? MapPin;
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
                    <Icon className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{store.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-blue-700">
                      <MapPin className="size-3" strokeWidth={2.5} aria-hidden />
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
      <Link className={`${bm.btnNavy} mt-4 inline-flex text-xs`} href={HUB_STORE}>
        매장·출장 허브
      </Link>
    </HomeSectionShell>
  );
}
