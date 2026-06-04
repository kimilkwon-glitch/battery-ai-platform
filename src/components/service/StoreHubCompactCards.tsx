"use client";

import Image from "next/image";
import clsx from "clsx";
import { BookOpen, MapPin, Navigation, Phone } from "lucide-react";
import { BUSAN_STORES } from "@/lib/busan-service-hub-data";
import { storeLinks } from "@/lib/external-links";
import type { BusanStoreId } from "@/lib/busan-store-matcher";
import { bm } from "@/lib/design-tokens";

const STORE_ICON_PROPS = { className: "bm-store-action-icon", "aria-hidden": true as const, strokeWidth: 2.75 };

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
        const isDeokcheon = store.id === "deokcheon";

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
              isDeokcheon ? "bm-store-card--deokcheon" : "bm-store-card--hakjang",
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

            <div className="bm-store-card-info flex min-h-0 flex-1 flex-col p-6 sm:p-8">
              <header className="shrink-0">
                <h3 className="text-3xl font-black tracking-tight text-slate-950 sm:text-[2rem]">
                  <span
                    className={clsx(
                      "bm-store-badge mr-2 inline-flex rounded-full px-3.5 py-1.5 text-sm",
                      isDeokcheon ? "bm-store-badge--deokcheon" : "bm-store-badge--hakjang",
                      selected && "ring-2 ring-white/90",
                    )}
                  >
                    {store.name}
                  </span>
                </h3>
              </header>

              <div className="mt-6 shrink-0">
                <p className="bm-store-field-label">대표 권역</p>
                <p className="bm-store-region-text">{store.displayRegions}</p>
              </div>

              <div className="mt-6 shrink-0">
                <p className="bm-store-field-label">전화번호</p>
                <p className="mt-2 min-h-[2rem]">
                  <a
                    href={store.phoneTel}
                    onClick={(e) => e.stopPropagation()}
                    className="bm-store-phone-link"
                  >
                    {store.phone}
                  </a>
                </p>
              </div>

              <div className="bm-store-actions">
                <div className="bm-store-actions-row">
                  <a
                    className="bm-store-btn bm-store-btn--call"
                    href={store.phoneTel}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone {...STORE_ICON_PROPS} />
                    전화하기
                  </a>
                  <a
                    className="bm-store-btn bm-store-btn--secondary"
                    href={mapsUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Navigation {...STORE_ICON_PROPS} />
                    길찾기
                  </a>
                  <a
                    className="bm-store-btn bm-store-btn--secondary bm-store-btn--wide-sm w-full sm:w-auto"
                    href={naverPlaceHref}
                    rel="noopener noreferrer"
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MapPin {...STORE_ICON_PROPS} />
                    네이버 플레이스
                  </a>
                </div>

                <a
                  href={blogHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={clsx(
                    "bm-store-btn bm-store-btn--blog",
                    isDeokcheon ? "bm-store-btn--blog-deokcheon" : "bm-store-btn--blog-hakjang",
                  )}
                >
                  <BookOpen {...STORE_ICON_PROPS} />
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
