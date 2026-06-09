import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { AdminBadgeTone } from "@/lib/admin/admin-status-tokens";

const TONE_VARIANT: Record<AdminBadgeTone, "info" | "warning" | "success" | "muted" | "danger"> = {
  info: "info",
  warning: "warning",
  success: "success",
  muted: "muted",
  danger: "danger",
};

type BadgeItem = { label: string; tone?: AdminBadgeTone };

type Props = {
  title: string;
  badges?: BadgeItem[];
  lines?: string[];
  actions?: ReactNode;
};

/** 모바일 관리자 목록 — 핵심 3~4줄 + 액션 */
export function AdminMobileCard({ title, badges, lines, actions }: Props) {
  return (
    <article className="admin-mobile-card">
      <div className="admin-mobile-card__head">
        <p className="admin-mobile-card__title">{title}</p>
        {badges && badges.length > 0 ? (
          <div className="admin-mobile-card__badges">
            {badges.map((b) => (
              <Badge key={b.label} variant={TONE_VARIANT[b.tone ?? "muted"]}>
                {b.label}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
      {lines && lines.length > 0 ? (
        <ul className="admin-mobile-card__lines">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      {actions ? <div className="admin-mobile-card__actions">{actions}</div> : null}
    </article>
  );
}
