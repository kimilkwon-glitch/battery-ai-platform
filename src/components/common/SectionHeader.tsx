import { bm } from "@/lib/design-tokens";

export function SectionHeader({
  label,
  title,
  description,
  action,
}: {
  label?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {label ? <p className={bm.label}>{label}</p> : null}
        <h2 className="mt-0.5 text-base font-black tracking-tight text-slate-950 sm:text-lg">{title}</h2>
        {description ? <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
