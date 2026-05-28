import Link from "next/link";
import { BatteryProductImage } from "@/components/media/BatteryProductImage";
import { getBatteryImageSet } from "@/lib/battery-alias-map";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";

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
      className={`inline-flex items-center gap-1 rounded-lg bg-white ring-1 ring-slate-200 transition hover:ring-blue-300 ${
        compact ? "px-1 py-0.5" : "px-1.5 py-1"
      }`}
    >
      <BatteryProductImage
        code={code}
        variant={compact ? "chip" : "chipMd"}
        imageSet={imageSet?.main ? imageSet : undefined}
        role="main"
      />
      <span className="min-w-0">
        <span className="block text-[10px] font-black text-slate-900">{label ?? code}</span>
        {!compact && display.terminalLabel ? (
          <span className="block text-[9px] font-semibold text-slate-500">{display.typeLabel}</span>
        ) : null}
      </span>
    </Link>
  );
}
