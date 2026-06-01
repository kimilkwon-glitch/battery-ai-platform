import { USED_BATTERY_NOT_RETURNED } from "@/data/used-battery-return-guide";
import { bm } from "@/lib/design-tokens";

export function UsedBatteryNotReturnedNotice() {
  const data = USED_BATTERY_NOT_RETURNED;

  return (
    <section className={`${bm.card} ${bm.cardPad}`} data-component="used-battery-not-returned">
      <h2 className="text-base font-black text-slate-950">{data.title}</h2>
      {data.body.map((p) => (
        <p key={p} className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
          {p}
        </p>
      ))}
      <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2.5 text-xs font-bold leading-relaxed text-amber-950">
        주의: {data.caution}
      </p>
    </section>
  );
}
