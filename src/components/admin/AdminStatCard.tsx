import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number | string;
  href?: string;
  tone?: "default" | "warning" | "danger" | "info";
  sublabel?: string;
};

const valueToneClass: Record<NonNullable<Props["tone"]>, string> = {
  default: "admin-stat-card__value--default",
  warning: "admin-stat-card__value--warning",
  danger: "admin-stat-card__value--danger",
  info: "admin-stat-card__value--info",
};

export function AdminStatCard({ label, value, href, tone = "default", sublabel }: Props) {
  const num = typeof value === "number" ? value : Number(value);
  const isZero = !Number.isNaN(num) && num === 0;

  const inner = (
    <div className="admin-stat-card h-full">
      <p className="admin-stat-card__label">{label}</p>
      <p
        className={cn(
          "admin-stat-card__value",
          isZero ? "admin-stat-card__value--zero" : valueToneClass[tone],
        )}
      >
        {value}
      </p>
      {sublabel ? <p className="admin-stat-card__sublabel">{sublabel}</p> : null}
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
