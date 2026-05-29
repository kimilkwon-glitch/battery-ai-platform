"use client";

import Link from "next/link";
import { Navigation, Phone, Truck } from "lucide-react";
import clsx from "clsx";
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
              `${bm.card} overflow-hidden transition`,
              active
                ? store.id === "deokcheon"
                  ? "ring-2 ring-blue-300"
                  : "ring-2 ring-emerald-300"
                : "border border-slate-200",
            )}
          >
            <div className={bm.cardPad}>
              <h3 className="text-lg font-black text-slate-950">{store.name}</h3>
              <p className="mt-0.5 text-xs font-bold text-slate-500">대표 권역</p>
              <p className="mt-1 text-sm font-black text-slate-800">{store.displayRegions}</p>
              <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-600">
                {store.scenarios.join(" · ")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  className={`${bm.btnPrimary} inline-flex items-center gap-1.5 text-xs`}
                  href={store.contactHref}
                >
                  <Phone className="size-3.5" aria-hidden />
                  전화 문의
                </Link>
                <a
                  className={`${bm.btnSecondary} inline-flex items-center gap-1.5 text-xs`}
                  href={mapsUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Navigation className="size-3.5" aria-hidden />
                  길찾기
                </a>
                <a
                  className={`${bm.btnTertiary} inline-flex items-center gap-1.5 text-xs`}
                  href="#store-map"
                >
                  <Truck className="size-3.5" aria-hidden />
                  출장 가능 지역 보기
                </a>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
