import Link from "next/link";
import { USED_BATTERY_GUIDE_LINKS, USED_BATTERY_ORDER_PRECHECK } from "@/data/used-battery-return-guide";
import { bm } from "@/lib/design-tokens";

export function UsedBatteryOrderPrecheck() {
  const data = USED_BATTERY_ORDER_PRECHECK;

  return (
    <div className="space-y-4" data-component="used-battery-order-precheck" id="used-battery-precheck">
      <h2 className="text-base font-black text-slate-950">{data.title}</h2>
      <p className="text-sm font-medium leading-relaxed text-slate-600">{data.intro}</p>

      <ul className="list-none space-y-2 p-0">
        {data.checklist.map((item, i) => (
          <li
            key={item}
            className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-black text-white">
              {i + 1}
            </span>
            <span className="text-sm font-medium text-slate-700">{item}</span>
          </li>
        ))}
      </ul>

      <Link className={`${bm.btnNavy} inline-flex text-xs`} href={USED_BATTERY_GUIDE_LINKS.fullGuide}>
        폐전지 반납 안내 자세히 보기 →
      </Link>
    </div>
  );
}
