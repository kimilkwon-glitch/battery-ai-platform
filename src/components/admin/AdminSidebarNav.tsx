"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_NAV_GROUPS,
  ADMIN_NAV_ITEMS,
  ADMIN_ROUTES,
  adminNavGroupForPath,
  type AdminNavGroup,
} from "@/lib/admin/admin-nav";
import type { AdminNavBadges } from "@/lib/admin/data/nav-badges";
import { cn } from "@/lib/utils";

function badgeTone(count: number, active: boolean): string {
  if (active) return "admin-sidebar__badge admin-sidebar__badge--active";
  if (count > 0) return "admin-sidebar__badge admin-sidebar__badge--warn";
  return "admin-sidebar__badge admin-sidebar__badge--idle";
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== ADMIN_ROUTES.hub && pathname.startsWith(href));
}

type Props = {
  navBadges?: AdminNavBadges;
  onNavigate?: () => void;
  className?: string;
};

export function AdminSidebarNav({ navBadges, onNavigate, className }: Props) {
  const pathname = usePathname();
  const activeGroup = adminNavGroupForPath(pathname);

  const defaultOpen = useMemo(() => {
    const map: Record<AdminNavGroup, boolean> = {
      "운영 현황": true,
      "주문/고객": true,
      "상품/DB": false,
      "콘텐츠/마케팅": false,
      "이미지/에셋": false,
      시스템: false,
    };
    if (activeGroup) map[activeGroup] = true;
    return map;
  }, [activeGroup]);

  const [openGroups, setOpenGroups] = useState(defaultOpen);

  useEffect(() => {
    if (activeGroup) {
      setOpenGroups((prev) => ({ ...prev, [activeGroup]: true }));
    }
  }, [activeGroup]);

  const toggle = (group: AdminNavGroup) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <nav className={cn("admin-sidebar-nav", className)} aria-label="관리자 메뉴">
      {ADMIN_NAV_GROUPS.map((group) => {
        const items = ADMIN_NAV_ITEMS.filter((i) => i.group === group);
        if (!items.length) return null;
        const expanded = openGroups[group];
        const groupActive = items.some((i) => isActive(pathname, i.href));

        return (
          <div key={group} className="admin-sidebar-nav__group">
            <button
              type="button"
              className={cn(
                "admin-sidebar-nav__group-btn",
                groupActive && "admin-sidebar-nav__group-btn--active",
              )}
              onClick={() => toggle(group)}
              aria-expanded={expanded}
            >
              <span>{group}</span>
              <span className="admin-sidebar-nav__chevron" aria-hidden>
                {expanded ? "▾" : "▸"}
              </span>
            </button>
            {expanded ? (
              <ul className="admin-sidebar-nav__list">
                {items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const badge = navBadges?.[item.href];
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn("admin-sidebar__link", active && "admin-sidebar__link--active")}
                      >
                        <span>{item.label}</span>
                        {badge !== undefined ? (
                          <span className={badgeTone(badge, active)}>{badge}</span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
