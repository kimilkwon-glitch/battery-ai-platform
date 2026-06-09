"use client";

import { cn } from "@/lib/utils";

export type AdminStatusTab = {
  id: string;
  label: string;
  count?: number;
  tone?: "default" | "warning" | "danger" | "info";
};

type Props = {
  tabs: AdminStatusTab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  scrollable?: boolean;
};

/** 스마트스토어식 상태 탭 — 클릭 시 실제 필터로 동작 */
export function AdminStatusTabs({
  tabs,
  activeId,
  onChange,
  className,
  scrollable = true,
}: Props) {
  return (
    <div
      className={cn(
        "admin-status-tabs",
        scrollable && "admin-status-tabs--scroll",
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              "admin-status-tabs__tab",
              active && "admin-status-tabs__tab--active",
              tab.tone && tab.tone !== "default" && `admin-status-tabs__tab--${tab.tone}`,
            )}
            onClick={() => onChange(tab.id)}
          >
            <span className="admin-status-tabs__label">{tab.label}</span>
            {tab.count !== undefined ? (
              <span className="admin-status-tabs__count">{tab.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
