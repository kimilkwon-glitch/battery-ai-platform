"use client";

import Image from "next/image";
import Link from "next/link";
import { BatteryMiniThumb } from "@/components/BatteryThumbnail";
import { carImageForPlatformVehicleId } from "@/lib/car-data";
import type { FeaturedSimilarQuestion } from "@/lib/inquiry-hub-data";
import { getBattery } from "@/lib/platform-data";

function CardImage({ item }: { item: FeaturedSimilarQuestion }) {
  const vehicleSrc = item.vehicleId ? carImageForPlatformVehicleId(item.vehicleId) : null;
  const battery = item.batteryCode ? getBattery(item.batteryCode) : null;

  return (
    <div
      className={
        item.imageKind === "vehicle"
          ? "relative h-28 w-full shrink-0 overflow-hidden rounded-lg sm:h-full sm:w-32"
          : "relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-slate-50 to-blue-50/40 ring-1 ring-slate-100 sm:h-full sm:w-32"
      }
    >
      {item.imageKind === "vehicle" && vehicleSrc ? (
        <div className="bm-vehicle-card-media bm-vehicle-card-media--bleed h-full min-h-28 w-full rounded-lg sm:min-h-full">
          <Image
            src={vehicleSrc}
            alt=""
            fill
            className="object-contain object-center !bg-transparent p-1"
            sizes="128px"
          />
        </div>
      ) : item.imageKind === "battery" && battery ? (
        <div className="flex h-full items-center justify-center p-2">
          <BatteryMiniThumb
            code={battery.code}
            imageSet={battery.images}
            role="main"
            className="h-20 w-full max-w-[100px]"
          />
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
          <svg className="size-8" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="5" y="8" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 8V6a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="text-[10px] font-bold">규격</span>
        </div>
      )}
    </div>
  );
}

export function InquirySimilarQuestionCard({ item }: { item: FeaturedSimilarQuestion }) {
  return (
    <Link
      href={item.href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md sm:flex-row"
    >
      <div className="p-3 sm:w-36 sm:shrink-0 sm:p-3">
        <CardImage item={item} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4 pt-0 sm:pt-4">
        <h3 className="text-sm font-black leading-snug text-slate-900 group-hover:text-blue-700">
          {item.title}
        </h3>
        <p className="mt-1 text-[11px] font-semibold text-slate-500">
          {item.questionType}
          {item.tags[0] ? ` · ${item.tags[0]}` : ""}
        </p>
        <p className="mt-2 flex-1 text-xs font-medium leading-relaxed text-slate-500">{item.summary}</p>
        <span className="mt-3 inline-flex w-fit rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white group-hover:bg-blue-700">
          답변 보기
        </span>
      </div>
    </Link>
  );
}

export function InquirySimilarQuestions({ items }: { items: FeaturedSimilarQuestion[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {items.map((item) => (
        <InquirySimilarQuestionCard item={item} key={item.id} />
      ))}
    </div>
  );
}
