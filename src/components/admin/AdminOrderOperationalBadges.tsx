import type { OrderOperationalBadge } from "@/lib/admin/order-operational-badges";

const TONE_CLASS: Record<OrderOperationalBadge["tone"], string> = {
  amber: "admin-order-ops-badge--amber",
  rose: "admin-order-ops-badge--rose",
  sky: "admin-order-ops-badge--sky",
  violet: "admin-order-ops-badge--violet",
  slate: "admin-order-ops-badge--slate",
};

type Props = {
  badges: OrderOperationalBadge[];
  compact?: boolean;
};

export function AdminOrderOperationalBadges({ badges, compact = false }: Props) {
  if (badges.length === 0) return null;

  return (
    <div className={`admin-order-ops-badges ${compact ? "admin-order-ops-badges--compact" : ""}`}>
      {badges.map((badge) => (
        <span
          key={badge.id}
          className={`admin-order-ops-badge ${TONE_CLASS[badge.tone]}`}
          title={badge.label}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
