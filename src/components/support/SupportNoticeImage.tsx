"use client";

import { useState } from "react";

/** 공지 첨부 이미지 — 파일 없으면 숨김(표·텍스트 본문만 표시) */
export function SupportNoticeImage({ src, alt }: { src: string; alt: string }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain p-2"
        onError={() => setVisible(false)}
      />
    </div>
  );
}
