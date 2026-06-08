"use client";

import Image from "next/image";
import { useState } from "react";
import {
  type ContentUiIconKey,
  getContentUiIconSrc,
} from "@/lib/content-ui-icons";

export type ContentUiIconSize = 32 | 36 | 44 | 48 | 52;

const SIZE_CLASS: Record<ContentUiIconSize, string> = {
  32: "h-8 w-8",
  36: "h-9 w-9",
  44: "h-11 w-11",
  48: "h-12 w-12",
  52: "h-[52px] w-[52px]",
};

const INNER_PAD: Record<ContentUiIconSize, number> = {
  32: 4,
  36: 4,
  44: 6,
  48: 8,
  52: 8,
};

type Props = {
  iconKey: ContentUiIconKey;
  size?: ContentUiIconSize;
  rounded?: "lg" | "xl" | "2xl";
  className?: string;
};

const ROUNDED_CLASS = {
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
} as const;

/** 작은 UI 아이콘 — FAQ·진단 사례·버튼 보조용 (16:9 콘텐츠 썸네일 아님) */
export function ContentUiIcon({
  iconKey,
  size = 48,
  rounded = "xl",
  className = "",
}: Props) {
  const [src, setSrc] = useState(getContentUiIconSrc(iconKey));
  const inner = size - INNER_PAD[size];

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-slate-50 ring-1 ring-slate-200/70 ${SIZE_CLASS[size]} ${ROUNDED_CLASS[rounded]} ${className}`}
    >
      <Image
        alt=""
        aria-hidden
        className="object-contain"
        height={inner}
        sizes={`${inner}px`}
        loading="lazy"
        onError={() => setSrc(getContentUiIconSrc("faq"))}
        src={src}
        unoptimized
        width={inner}
      />
    </span>
  );
}
