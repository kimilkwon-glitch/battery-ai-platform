"use client";

import type { AlimtalkEventType, NotificationLogRecord } from "@/lib/notifications/alimtalk-types";

const ORDER_ALIMTALK_EVENTS: { eventType: AlimtalkEventType; label: string }[] = [
  { eventType: "order_created", label: "주문완료 알림" },
  { eventType: "order_confirmed", label: "발주확인 알림" },
  { eventType: "order_shipped", label: "발송완료 알림" },
  { eventType: "cancel_refund", label: "취소/환불 알림" },
];

type BadgeKind = "sent" | "failed" | "none";

function badgeForEvent(logs: NotificationLogRecord[], eventType: AlimtalkEventType): BadgeKind {
  const relevant = logs.filter((l) => l.eventType === eventType);
  if (relevant.some((l) => l.status === "sent")) return "sent";
  if (relevant.length === 0) return "none";
  const latest = relevant[relevant.length - 1];
  if (latest.status === "failed") return "failed";
  return "none";
}

function badgeLabel(kind: BadgeKind): string {
  if (kind === "sent") return "발송완료";
  if (kind === "failed") return "실패";
  return "미발송";
}

function badgeClass(kind: BadgeKind): string {
  if (kind === "sent") return "admin-alimtalk-badge admin-alimtalk-badge--sent";
  if (kind === "failed") return "admin-alimtalk-badge admin-alimtalk-badge--failed";
  return "admin-alimtalk-badge admin-alimtalk-badge--none";
}

type Props = {
  logs: NotificationLogRecord[];
};

export function AdminOrderAlimtalkPanel({ logs }: Props) {
  return (
    <details className="admin-ops-collapsible admin-alimtalk-panel">
      <summary className="admin-ops-collapsible__summary">알림톡 발송 기록</summary>
      <div className="admin-ops-collapsible__body">
        <ul className="admin-alimtalk-status-list">
          {ORDER_ALIMTALK_EVENTS.map(({ eventType, label }) => {
            const kind = badgeForEvent(logs, eventType);
            return (
              <li key={eventType} className="admin-alimtalk-status-row">
                <span className="admin-alimtalk-status-row__label">{label}</span>
                <span className={badgeClass(kind)}>{badgeLabel(kind)}</span>
              </li>
            );
          })}
        </ul>
        {logs.length > 0 ? (
          <p className="admin-alimtalk-footnote">최근 {logs.length}건의 발송 시도가 기록되어 있습니다.</p>
        ) : (
          <p className="admin-alimtalk-footnote">아직 알림톡 발송 기록이 없습니다.</p>
        )}
      </div>
    </details>
  );
}
