"use client";

import { BatteryImageCard, batteryImageFit } from "@/components/BatteryThumbnail";
import { getBattery, searchUrl } from "@/lib/platform-data";

const listings = [
  { code: "AGM80L", meta: "인기", note: "ISG 세단/SUV · 검색 24,821" },
  { code: "AGM60L", meta: "실사", note: "소형 SUV·ISG · 검색 5,120" },
  { code: "DIN74L", meta: "주의", note: "일반 차량 · 검색 9,742" },
  { code: "AGM70L", meta: "규격확인", note: "중형 SUV · 인기 규격" },
] as const;

export function SearchBatteryCards() {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {listings.map(({ code, meta, note }) => {
        const b = getBattery(code);
        return (
          <BatteryImageCard
            key={code}
            code={code}
            imageSet={b.images}
            role="main"
            capacity={b.capacity}
            cca={b.cca}
            terminal={b.terminal}
            type={b.type}
            meta={note}
            href={searchUrl(code)}
            ratio="16/9"
            fit={batteryImageFit(code)}
            badge={meta}
          />
        );
      })}
    </div>
  );
}
