import Link from "next/link";
import { QnaChipBatteryImage } from "@/components/battery/QnaChipBatteryImage";
import { QNA_CHIP_IMAGE_BOX } from "@/lib/battery-image-stage";
import { getBatteryImageSet } from "@/lib/battery-alias-map";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";

/** Q&A·가이드 관련 배터리 칩 — QnaChipBatteryImage 직접 연결 */
export function BatteryMiniSpecLink({
  code,
  label,
  compact = false,
}: {
  code: string;
  label?: string;
  compact?: boolean;
}) {
  const display = parseBatterySpecDisplay(code);
  const imageSet = getBatteryImageSet(code, "rocket");

  return (
    <Link
      href={`/batteries/${encodeURIComponent(code)}`}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1 transition hover:border-blue-300 hover:ring-1 hover:ring-blue-200"
      data-qna-battery-chip={code}
    >
      <span className={QNA_CHIP_IMAGE_BOX}>
        <QnaChipBatteryImage code={code} imageSet={imageSet} role="main" />
      </span>
      <span className="min-w-0 leading-none">
        <span className="block text-[11px] font-bold text-slate-900">{label ?? code}</span>
        {!compact && display.terminalLabel ? (
          <span className="mt-0.5 block text-[9px] font-semibold text-slate-500">
            {display.typeLabel}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
