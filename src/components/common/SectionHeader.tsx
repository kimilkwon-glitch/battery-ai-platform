import { IconBadge } from "@/components/common/IconBadge";
import { bm } from "@/lib/design-tokens";
import type { IconKey } from "@/lib/icon-map";

export function SectionHeader({
  label,
  title,
  description,
  action,
  iconKey,
}: {
  label?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  iconKey?: IconKey;
}) {
  return (
    <div className={`${bm.sectionHead} mb-4 flex flex-wrap items-end justify-between gap-3`}>
      <div className="min-w-0 flex-1">
        {label ? <p className={bm.label}>{label}</p> : null}
        <h2 className={`${bm.sectionTitle} mt-1 flex items-center gap-2`}>
          {iconKey ? <IconBadge iconKey={iconKey} size="md" className="!h-8 !w-8" /> : null}
          <span>{title}</span>
        </h2>
        {description ? <p className={`mt-1.5 max-w-2xl ${bm.textSub}`}>{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
