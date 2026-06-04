"use client";

import Image from "next/image";
import clsx from "clsx";
import { BookOpen, MapPin, Navigation, Phone } from "lucide-react";
import { BUSAN_STORES } from "@/lib/busan-service-hub-data";
import { storeLinks } from "@/lib/external-links";
import type { BusanStoreId } from "@/lib/busan-store-matcher";
import { bm } from "@/lib/design-tokens";

export function StoreHubCompactCards({
  highlightId,
  activeId,
  onSelect,
}: {
  highlightId: BusanStoreId | null;
  activeId?: BusanStoreId | null;
  onSelect?: (id: BusanStoreId) => void;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-2 lg:items-stretch" id="stores">
      {BUSAN_STORES.map((store) => {
        const highlighted = highlightId === store.id;
        const selected = activeId === store.id;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.mapsQuery)}`;
        const links = storeLinks[store.id];
        const blogHref = links.blog;
        const naverPlaceHref = links.naverPlace;

        return (
          <article
            key={store.id}
            id={`store-${store.id}`}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            onClick={() => onSelect?.(store.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(store.id);
              }
            }}
            className={clsx(
              `${bm.card} bm-card-unified bm-store-card flex h-full cursor-pointer flex-col overflow-hidden outline-none transition-[box-shadow,border-color,transform]`,
              store.id === "deokcheon" ? "bm-store-card--deokcheon" : "bm-store-card--hakjang",
              highlighted && "bm-store-card--active",
              selected && "bm-store-card--selected",
            )}
          >
            <div className="relative aspect-[16/10] w-full shrink-0 bg-slate-100 sm:aspect-[16/9]">
              <Image
                src={store.imageSrc}
                alt={store.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
              />
            </div>

            <div className="flex min-h-0 flex-1 flex-col p-6 sm:p-8">
              <header className="shrink-0">
                <h3 className="text-3xl font-black tracking-tight text-slate-950 sm:text-[2rem]">
                  <span
                    className={clsx(
                      "bm-store-badge mr-2 inline-flex rounded-full px-3 py-1.5 text-sm font-black",
                      store.id === "deokcheon" ? "bm-store-badge--deokcheon" : "bm-store-badge--hakjang",
                      selected && "ring-2 ring-white/90",
                    )}
                  >
                    {store.name}
                  </span>
                </h3>
              </header>

              <div className="mt-6 shrink-0">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">대표 권역</p>
                <p
                  className={clsx(
                    "mt-2 min-h-[3.25rem] text-xl font-black leading-snug sm:text-[1.35rem]",
                    selected ? "text-blue-800" : "text-slate-900",
                  )}
                >
                  {store.displayRegions}
                </p>
              </div>

              <div className="mt-6 shrink-0">
                <p className="text-sm font-bold text-slate-500">전화번호</p>
                <p className="mt-2 min-h-[2rem]">
                  <a
                    href={store.phoneTel}
                    onClick={(e) => e.stopPropagation()}
                    className="text-2xl font-black tracking-tight text-blue-700 hover:underline sm:text-[1.65rem]"
                  >
                    {store.phone}
                  </a>
                </p>
              </div>

              <div className="mt-auto flex flex-col gap-4 pt-8">
                <div className="flex flex-wrap gap-3">
                  <a
                    className={`${bm.btnPrimary} inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 px-5 text-base font-black sm:min-w-[140px] sm:flex-none`}
                    href={store.phoneTel}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="size-5" aria-hidden />
                    전화하기
                  </a>
                  <a
                    className={`${bm.btnSecondary} inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 px-5 text-base font-black sm:min-w-[140px] sm:flex-none`}
                    href={mapsUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Navigation className="size-5" aria-hidden />
                    길찾기
                  </a>
                  <a
                    className={`${bm.btnSecondary} inline-flex min-h-[52px] w-full items-center justify-center gap-2 px-5 text-base font-black sm:w-auto sm:flex-1`}
                    href={naverPlaceHref}
                    rel="noopener noreferrer"
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MapPin className="size-5" aria-hidden />
                    네이버 플레이스
                  </a>
                </div>

                <a
                  href={blogHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={clsx(
                    "flex w-full items-center justify-center gap-2.5 rounded-xl border-2 px-5 py-4 text-base font-black transition-[box-shadow,background-color,border-color]",
                    store.id === "deokcheon"
                      ? "border-blue-200 bg-blue-50/80 text-blue-900 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-100/80"
                      : "border-teal-200 bg-teal-50/80 text-teal-900 hover:border-teal-300 hover:bg-teal-50 hover:shadow-md hover:shadow-teal-100/80",
                  )}
                >
                  <BookOpen className="size-5 shrink-0" aria-hidden />
                  작업 사례 보기 (블로그)
                </a>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
