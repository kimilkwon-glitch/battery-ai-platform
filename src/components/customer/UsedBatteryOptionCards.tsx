import clsx from "clsx";
import { USED_BATTERY_OPTION_CARDS } from "@/data/used-battery-return-guide";
import { bm } from "@/lib/design-tokens";

const toneStyles = {
  blue: "border-blue-100 bg-gradient-to-br from-white to-blue-50/40",
  slate: "border-slate-200 bg-gradient-to-br from-white to-slate-50/80",
  emerald: "border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30",
} as const;

export function UsedBatteryOptionCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-3" data-component="used-battery-option-cards">
      {USED_BATTERY_OPTION_CARDS.map((card) => (
        <article
          key={card.id}
          className={clsx(`${bm.card} ${bm.cardPad} border`, toneStyles[card.tone])}
        >
          <h3 className="text-sm font-black text-slate-900">{card.title}</h3>
          <ul className="mt-3 list-none space-y-2 p-0">
            {card.bullets.map((item) => (
              <li
                key={item}
                className="text-xs font-medium leading-relaxed text-slate-600 before:mr-1.5 before:font-black before:text-slate-400 before:content-['·']"
              >
                {item}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
