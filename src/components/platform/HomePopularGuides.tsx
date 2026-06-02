"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { BatteryMiniSpecLink } from "@/components/battery/BatteryMiniSpecLink";
import { BatteryContentThumb } from "@/components/BatteryThumbnail";
import { ContentCoverImage } from "@/components/content/ContentCoverImage";
import { productCardShell } from "@/components/car/car-card-styles";
import { carImageForPlatformVehicleId } from "@/lib/car-data";
import { getAllArticles } from "@/lib/content";
import { resolveContentCoverImage } from "@/lib/content/getContentImage";
import { resolveBatteryImageSetForCode } from "@/lib/batteryImages";
import { getHomeActivitySummary, getHomeActivitySummaryStatic } from "@/lib/activity";
import { recordContentView } from "@/lib/activity";

export function HomePopularGuides() {
  const [contentIds, setContentIds] = useState<string[]>(
    () => getHomeActivitySummaryStatic().popularContent.map((c) => c.articleId),
  );

  useEffect(() => {
    setContentIds(getHomeActivitySummary().popularContent.map((c) => c.articleId));
  }, []);

  const articles = useMemo(() => {
    const all = getAllArticles();
    const byId = new Map(all.map((a) => [a.id, a]));
    const ordered = contentIds.map((id) => byId.get(id)).filter(Boolean);
    const rest = all.filter((a) => !contentIds.includes(a.id));
    return [...ordered, ...rest].slice(0, 4) as typeof all;
  }, [contentIds]);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.06em] text-[#2563EB]">가이드</p>
          <h2 className="mt-1 text-xl font-black text-[#0F172A]">최근 배터리 가이드</h2>
          <p className="mt-1 text-xs font-semibold text-[#64748B]">연식·연료·규격별 실무 가이드</p>
        </div>
        <Link className="text-xs font-black text-blue-600 hover:underline" href="/guides">
          전체 가이드 →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map((c) => {
          const primaryCode = c.batteryIds[0];
          const contentCover = resolveContentCoverImage(c.id);
          const imageSet = primaryCode ? resolveBatteryImageSetForCode(primaryCode) : undefined;
          const vehicleId = c.vehicleIds[0];
          const vehicleImage = vehicleId ? carImageForPlatformVehicleId(vehicleId) : null;

          return (
            <article
              key={c.id}
              className={`group flex h-full flex-col overflow-hidden ${productCardShell}`}
            >
              <Link
                className="flex flex-1 flex-col"
                href={`/guides/${c.id}`}
                onClick={() => recordContentView(c.id)}
              >
              {contentCover.imagePath || contentCover.imageNeeded ? (
                <div className="relative">
                  <ContentCoverImage
                    contentId={c.id}
                    objectFit="contain"
                    title={c.title}
                    variant="card"
                  />
                  <span className="absolute left-3 top-3 text-[10px] font-bold text-blue-700">
                    {c.category}
                  </span>
                </div>
              ) : (
              <div className="relative h-[160px] overflow-hidden">
                {primaryCode ? (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/40 p-6">
                    <BatteryContentThumb
                      code={primaryCode}
                      fit="contain"
                      imageSet={imageSet}
                      role="main"
                    />
                  </div>
                ) : vehicleImage ? (
                  <VehicleCardMedia
                    alt={c.title}
                    className="bm-vehicle-card-media--bleed h-full min-h-[160px] rounded-none"
                    src={vehicleImage}
                    variant="card"
                  />
                ) : null}
                <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-black text-blue-700 shadow-sm ring-1 ring-blue-100">
                  {c.category}
                </span>
              </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="line-clamp-2 text-sm font-black leading-snug text-[#0F172A] group-hover:text-[#2563EB]">
                  {c.title}
                </h3>
                <p className="line-clamp-2 flex-1 text-xs font-semibold leading-relaxed text-slate-500">
                  {c.description}
                </p>
                <span className="text-[11px] font-black text-blue-600">자세히 보기 →</span>
              </div>
              </Link>
              {c.batteryIds.length > 0 ? (
                <div className="flex flex-wrap gap-1 px-4 pb-4">
                  {c.batteryIds.slice(0, 3).map((code) => (
                    <BatteryMiniSpecLink key={code} code={code} compact />
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
