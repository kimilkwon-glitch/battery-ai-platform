import { USED_BATTERY_PACKING_NOTICE } from "@/data/used-battery-return-guide";
import { bm } from "@/lib/design-tokens";

export function UsedBatteryPackingNotice() {
  return (
    <section
      className={`${bm.card} ${bm.cardPad} border-amber-100/90 bg-amber-50/25`}
      data-component="used-battery-packing-notice"
    >
      <h2 className="text-base font-black text-amber-950">{USED_BATTERY_PACKING_NOTICE.title}</h2>
      <ul className="mt-3 list-none space-y-2 p-0">
        {USED_BATTERY_PACKING_NOTICE.items.map((item) => (
          <li
            key={item}
            className="flex gap-2 rounded-lg border border-amber-100/80 bg-white/70 px-3 py-2 text-xs font-medium leading-relaxed text-amber-950"
          >
            <span className="shrink-0 font-black text-amber-600" aria-hidden>
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
