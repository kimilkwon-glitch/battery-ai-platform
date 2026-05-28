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
    <div className={`${bm.sectionHead} mb-4 flex flex-wrap items-end justify-between gap-3`}>
      <div className="min-w-0 flex-1">
        {label ? <p className={bm.label}>{label}</p> : null}
        <h2 className={`${bm.sectionTitle} mt-1`}>{title}</h2>
        {description ? <p className={`mt-1.5 max-w-2xl ${bm.textSub}`}>{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
