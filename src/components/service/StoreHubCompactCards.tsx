"use client";

import Image from "next/image";
import clsx from "clsx";
import { BookOpen, Navigation, Phone } from "lucide-react";
import { BUSAN_STORES } from "@/lib/busan-service-hub-data";
import { storeLinks } from "@/lib/external-links";
import type { BusanStoreId } from "@/lib/busan-store-matcher";
import { bm } from "@/lib/design-tokens";

export function StoreHubCompactCards({ highlightId }: { highlightId: BusanStoreId | null }) {
  return (
    <section className="grid gap-5 lg:grid-cols-2" id="stores">
      {BUSAN_STORES.map((store) => {
        const active = highlightId === store.id;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.mapsQuery)}`;
        const blogHref = storeLinks[store.id].blog;

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

            <div className="space-y-4 p-5 sm:p-6">
              <div>
                <h3 className="text-2xl font-black text-slate-950">
                  <span
                    className={clsx(
                      "bm-store-badge mr-2 inline-flex rounded-full px-2.5 py-1 text-xs font-black",
                      store.id === "deokcheon" ? "bm-store-badge--deokcheon" : "bm-store-badge--hakjang",
                    )}
                  >
                    {store.name}
                  </span>
                </h3>
                <p className="mt-3 text-sm font-bold uppercase tracking-wide text-slate-500">대표 권역</p>
                <p className="mt-1.5 text-lg font-black leading-snug text-slate-900">{store.displayRegions}</p>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-500">전화번호</p>
                <p className="mt-1">
                  <a
                    href={store.phoneTel}
                    className="text-xl font-black tracking-tight text-blue-700 hover:underline"
                  >
                    {store.phone}
                  </a>
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-500">주요 상황 · 커버 범위</p>
                <p className="mt-2 text-base font-semibold leading-relaxed text-slate-700">
                  {store.scenarios.join(" · ")}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <a
                  className={`${bm.btnPrimary} inline-flex min-h-[48px] items-center gap-2 px-5 text-base font-black`}
                  href={store.phoneTel}
                >
                  <Phone className="size-5" aria-hidden />
                  전화하기
                </a>
                <a
                  className={`${bm.btnSecondary} inline-flex min-h-[48px] items-center gap-2 px-5 text-base font-black`}
                  href={mapsUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Navigation className="size-5" aria-hidden />
                  길찾기
                </a>
              </div>

              <a
                href={blogHref}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  "flex w-full items-center justify-center gap-2.5 rounded-xl border-2 px-5 py-4 text-base font-black transition motion-safe:hover:-translate-y-0.5",
                  store.id === "deokcheon"
                    ? "border-blue-200 bg-blue-50/80 text-blue-900 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-100/80"
                    : "border-teal-200 bg-teal-50/80 text-teal-900 hover:border-teal-300 hover:bg-teal-50 hover:shadow-md hover:shadow-teal-100/80",
                )}
              >
                <BookOpen className="size-5 shrink-0" aria-hidden />
                작업 사례 보기 (블로그)
              </a>
            </div>
          </article>
        );
      })}
    </section>
  );
}
