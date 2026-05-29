"use client";

import Image from "next/image";
import clsx from "clsx";
import { Navigation, Phone } from "lucide-react";
import { StoreOfficialChannelLinks } from "@/components/common/OfficialChannelsStrip";
import { BUSAN_STORES } from "@/lib/busan-service-hub-data";
import type { BusanStoreId } from "@/lib/busan-store-matcher";
import { bm } from "@/lib/design-tokens";

export function StoreHubCompactCards({ highlightId }: { highlightId: BusanStoreId | null }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2" id="stores">
      {BUSAN_STORES.map((store) => {
        const active = highlightId === store.id;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.mapsQuery)}`;

        return (
          <article
            key={store.id}
            id={`store-${store.id}`}
            className={clsx(
              `${bm.card} bm-card-unified bm-store-card overflow-hidden transition`,
              store.id === "deokcheon" ? "bm-store-card--deokcheon" : "bm-store-card--hakjang",
              active && "bm-store-card--active",
            )}
          >
            <div className="relative aspect-[16/9] w-full bg-slate-100">
              <Image
                src={store.imageSrc}
                alt={store.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
              />
            </div>

            <div className={bm.cardPad}>
              <h3 className="text-lg font-black text-slate-950">
                <span
                  className={clsx(
                    "bm-store-badge mr-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-black",
                    store.id === "deokcheon" ? "bm-store-badge--deokcheon" : "bm-store-badge--hakjang",
                  )}
                >
                  {store.name}
                </span>
              </h3>
              <p className="mt-0.5 text-xs font-bold text-slate-500">대표 권역</p>
              <p className="mt-1 text-sm font-black text-slate-800">{store.displayRegions}</p>
              <p className="mt-2 text-sm font-black text-slate-900">
                <span className="text-xs font-bold text-slate-500">전화 </span>
                <a href={store.phoneTel} className="text-blue-700 hover:underline">
                  {store.phone}
                </a>
              </p>
              <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-600">
                <span className="font-black text-slate-500">주요 상황 · </span>
                {store.scenarios.join(" · ")}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  className={`${bm.btnPrimary} inline-flex items-center gap-1.5 text-xs`}
                  href={store.phoneTel}
                >
                  <Phone className="size-3.5" aria-hidden />
                  전화하기
                </a>
                <a
                  className={`${bm.btnSecondary} inline-flex items-center gap-1.5 text-xs`}
                  href={mapsUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Navigation className="size-3.5" aria-hidden />
                  길찾기
                </a>
              </div>

              <StoreOfficialChannelLinks storeId={store.id} className="mt-3" />
            </div>
          </article>
        );
      })}
    </section>
  );
}
