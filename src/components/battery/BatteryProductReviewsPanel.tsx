"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Camera, Star } from "lucide-react";
import clsx from "clsx";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import type { ReviewItem } from "@/lib/reviews-mock-data";
import { reviewHasImages } from "@/lib/review-card-utils";
import { bm } from "@/lib/design-tokens";

type SortMode = "latest" | "rating" | "photo";

type Props = {
  batteryCode: string;
};

export function BatteryProductReviewsPanel({ batteryCode }: Props) {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("latest");
  const [canWrite, setCanWrite] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews/public?battery=${encodeURIComponent(batteryCode)}&limit=30`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as { ok?: boolean; items?: ReviewItem[] };
      setItems(res.ok && data.ok && Array.isArray(data.items) ? data.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [batteryCode]);

  useEffect(() => {
    void load();
    void fetch(`/api/reviews/eligibility?battery=${encodeURIComponent(batteryCode)}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d: { ok?: boolean; canWrite?: boolean }) => {
        if (d.ok) setCanWrite(Boolean(d.canWrite));
      })
      .catch(() => undefined);
  }, [batteryCode, load]);

  const sorted = useMemo(() => {
    const list = [...items];
    if (sort === "rating") {
      return list.sort((a, b) => b.rating - a.rating);
    }
    if (sort === "photo") {
      return list.filter((r) => reviewHasImages(r));
    }
    return list;
  }, [items, sort]);

  const avgRating =
    items.length > 0
      ? Math.round((items.reduce((s, r) => s + r.rating, 0) / items.length) * 10) / 10
      : 0;
  const photoCount = items.filter((r) => reviewHasImages(r)).length;

  const writeHref = `/reviews/write?battery=${encodeURIComponent(batteryCode)}`;

  if (loading) {
    return <p className="text-sm font-medium text-slate-500">후기 불러오는 중…</p>;
  }

  return (
    <div className="battery-product-reviews space-y-4" data-battery-product-reviews={batteryCode}>
      <div className="battery-product-reviews__summary">
        <div className="battery-product-reviews__stars">
          <Star className="size-6 fill-amber-400 text-amber-400" aria-hidden />
          <span>{items.length > 0 ? avgRating.toFixed(1) : "—"}</span>
        </div>
        <div className="text-xs font-bold text-slate-600">
          <p>후기 {items.length}건</p>
          <p className="mt-0.5 flex items-center gap-1">
            <Camera className="size-3.5" aria-hidden />
            사진 후기 {photoCount}건
          </p>
        </div>
        {canWrite ? (
          <Link href={writeHref} className={`${bm.btnNavy} ml-auto text-xs`}>
            후기 작성
          </Link>
        ) : (
          <p className="ml-auto text-[11px] font-semibold text-slate-500">구매 후 작성할 수 있습니다</p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["latest", "최신순"],
            ["rating", "평점순"],
            ["photo", "사진후기"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSort(id)}
            className={clsx(
              "rounded-full px-3 py-1.5 text-[11px] font-black",
              sort === id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
          <Star className="mx-auto size-8 text-slate-300" aria-hidden />
          <p className="mt-3 text-sm font-black text-slate-800">아직 등록된 후기가 없습니다</p>
          <Link href={writeHref} className={`${bm.btnSecondary} mt-4 inline-flex text-xs`}>
            첫 후기 작성하기
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {sorted.map((item) => (
            <li key={item.id}>
              <ReviewCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
