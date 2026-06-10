"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { BookOpen, MapPin, Navigation, Phone } from "lucide-react";
import { BUSAN_STORES } from "@/lib/busan-service-hub-data";
import { storeLinks } from "@/lib/external-links";
import type { BusanStoreId } from "@/lib/busan-store-matcher";
import { bm } from "@/lib/design-tokens";

const STORE_ICON_PROPS = { className: "bm-store-action-icon", "aria-hidden": true as const, strokeWidth: 2.75 };

function StoreCardPhoto({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) return null;

  return (
    <div className="bm-store-card__photo relative aspect-[16/10] w-full shrink-0 bg-slate-100 sm:aspect-[16/9]">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function StoreHubCompactCards({
  selectedBranch,
  hoveredBranch,
  onSelectBranch,
  onHoverBranch,
}: {
  selectedBranch: BusanStoreId | null;
  hoveredBranch?: BusanStoreId | null;
  onSelectBranch?: (id: BusanStoreId) => void;
  onHoverBranch?: (id: BusanStoreId | null) => void;
}) {
  const deokcheonCardRef = useRef<HTMLElement>(null);
  const hakjangCardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!selectedBranch) return;
    const target =
      selectedBranch === "deokcheon"
        ? deokcheonCardRef.current
        : hakjangCardRef.current;
    if (!target) return;
    let innerId = 0;
    const outerId = requestAnimationFrame(() => {
      innerId = requestAnimationFrame(() => {
        const mobile = window.matchMedia("(max-width: 1023px)").matches;
        target.scrollIntoView({
          behavior: "smooth",
          block: mobile ? "start" : "center",
          inline: "nearest",
        });
      });
    });
    return () => {
      cancelAnimationFrame(outerId);
      if (innerId) cancelAnimationFrame(innerId);
    };
  }, [selectedBranch]);

  return (
    <section
      className={clsx(
        "bm-store-cards-grid flex w-full max-w-full flex-col gap-6 lg:flex-row lg:items-stretch",
        selectedBranch != null && "bm-store-cards-grid--has-selection",
      )}
      id="stores"
    >
      {BUSAN_STORES.map((store) => {
        const isActive = selectedBranch === store.id;
        const isInactive = selectedBranch != null && selectedBranch !== store.id;
        const isHover = hoveredBranch === store.id && !isActive;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.mapsQuery)}`;
        const links = storeLinks[store.id];
        const blogHref = links.blog;
        const naverPlaceHref = links.naverPlace;
        const isDeokcheon = store.id === "deokcheon";

        return (
          <article
            key={store.id}
            ref={store.id === "deokcheon" ? deokcheonCardRef : hakjangCardRef}
            id={`store-${store.id}`}
            role="button"
            tabIndex={0}
            aria-pressed={isActive}
            onClick={() => onSelectBranch?.(store.id)}
            onMouseEnter={() => onHoverBranch?.(store.id)}
            onMouseLeave={() => onHoverBranch?.(null)}
            onFocus={() => onHoverBranch?.(store.id)}
            onBlur={() => onHoverBranch?.(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectBranch?.(store.id);
              }
            }}
            className={clsx(
              `${bm.card} bm-card-unified bm-store-card flex h-full cursor-pointer flex-col overflow-hidden outline-none`,
              isDeokcheon ? "bm-store-card--deokcheon" : "bm-store-card--hakjang",
              isActive && "bm-store-card--branch-active",
              isInactive && "bm-store-card--branch-inactive",
              isHover && "bm-store-card--branch-hover",
              selectedBranch == null && !isHover && "bm-store-card--branch-default",
            )}
          >
            <StoreCardPhoto src={store.imageSrc} alt={store.imageAlt} />

            <div className="bm-store-card-info flex min-h-0 flex-1 flex-col p-4 sm:p-8">
              <header className="shrink-0">
                <h3 className="bm-store-card__title text-3xl font-black tracking-tight text-slate-950 sm:text-[2rem]">
                  <span
                    className={clsx(
                      "bm-store-badge mr-2 inline-flex rounded-full px-3.5 py-1.5 text-sm",
                      isDeokcheon ? "bm-store-badge--deokcheon" : "bm-store-badge--hakjang",
                      isActive && "ring-2 ring-white/90",
                    )}
                  >
                    {store.name}
                  </span>
                </h3>
              </header>

              <div className="mt-4 shrink-0 sm:mt-6">
                <p className="bm-store-field-label">대표 권역</p>
                <p className="bm-store-region-text">{store.displayRegions}</p>
              </div>

              <div className="mt-4 shrink-0 sm:mt-6">
                <p className="bm-store-field-label bm-store-field-label--phone">전화번호</p>
                <p className="mt-1.5 min-h-[2rem] sm:mt-2">
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
                <div className="bm-store-actions-row bm-store-actions-row--primary">
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
                </div>

                <a
                  className="bm-store-btn bm-store-btn--secondary bm-store-btn--aux"
                  href={naverPlaceHref}
                  rel="noopener noreferrer"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MapPin {...STORE_ICON_PROPS} />
                  네이버 플레이스
                </a>

                <a
                  href={blogHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={clsx(
                    "bm-store-btn bm-store-btn--blog bm-store-btn--aux",
                    isDeokcheon ? "bm-store-btn--blog-deokcheon" : "bm-store-btn--blog-hakjang",
                  )}
                >
                  <BookOpen {...STORE_ICON_PROPS} />
                  작업 사례 보기
                </a>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
