import type { VehicleBadgeToken } from "./VehicleSpecBadge";
import { VehicleSpecBadge } from "./VehicleSpecBadge";

const LEGEND_ITEMS: { token: VehicleBadgeToken; hint: string }[] = [
  { token: { kind: "agm" }, hint: "스탑앤고 특화" },
  { token: { kind: "isg" }, hint: "공회전 제어" },
  { token: { kind: "bms" }, hint: "배터리 등록" },
  { token: { kind: "upgrade" }, hint: "용량업 가능" },
  { token: { kind: "din" }, hint: "유럽형 규격" },
  { token: { kind: "smart" }, hint: "스마트 충전" },
];

/** 차종 빠른검색 — 배지 + 한 줄 설명 */
export function VehicleBadgeLegend() {
  return (
    <div
      className="mb-3 rounded-lg bg-slate-50/70 px-2.5 py-2 ring-1 ring-slate-100"
      aria-label="차량 카드 배지 안내"
    >
      <p className="mb-1.5 text-[10px] font-bold text-slate-400">카드 배지 안내</p>
      <div className="flex flex-wrap items-center gap-2">
        {LEGEND_ITEMS.map((item) => (
          <span className="inline-flex items-center gap-1" key={item.token.kind}>
            <VehicleSpecBadge token={item.token} />
            <span className="text-[12px] font-medium text-slate-600">
              <span className="text-slate-300" aria-hidden>
                ·{" "}
              </span>
              {item.hint}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
