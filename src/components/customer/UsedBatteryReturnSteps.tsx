import { USED_BATTERY_RETURN_STEPS } from "@/data/used-battery-return-guide";
import { bm } from "@/lib/design-tokens";

export function UsedBatteryReturnSteps() {
  return (
    <section className={`${bm.card} ${bm.cardPad}`} data-component="used-battery-return-steps">
      <h2 className="text-base font-black text-slate-950">폐전지 반납 절차</h2>
      <p className="mt-1 text-xs font-medium text-slate-500">
        새 배터리 수령 후 순서대로 진행해 주세요.
      </p>
      <ol className="mt-4 list-none space-y-3 p-0">
        {USED_BATTERY_RETURN_STEPS.map((step) => (
          <li
            key={step.step}
            className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3 sm:px-4"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
              {step.step}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900">{step.title}</h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
