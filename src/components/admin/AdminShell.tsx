"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ADMIN_NAV_GROUPS,
  ADMIN_NAV_ITEMS,
  ADMIN_ROUTES,
} from "@/lib/admin/admin-nav";
import type { AdminNavBadges } from "@/lib/admin/data/nav-badges";
import { BUILD_STAMP } from "@/lib/build-stamp";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  navBadges?: AdminNavBadges;
};

function badgeTone(count: number, active: boolean): string {
  if (active) return "admin-sidebar__badge admin-sidebar__badge--active";
  if (count > 0) return "admin-sidebar__badge admin-sidebar__badge--warn";
  return "admin-sidebar__badge admin-sidebar__badge--idle";
}

export function AdminShell({ children, title, description, navBadges }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-100" data-admin-console data-build-version={BUILD_STAMP}>
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 border-r border-slate-800 bg-slate-950 text-slate-100 lg:block">
          <div className="border-b border-slate-800 px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Battery Manager
            </p>
            <p className="admin-sidebar__brand-title">운영 콘솔</p>
          </div>
          <nav className="space-y-3 p-3" aria-label="관리자 메뉴">
            {ADMIN_NAV_GROUPS.map((group) => {
              const items = ADMIN_NAV_ITEMS.filter((i) => i.group === group);
              if (!items.length) return null;
              return (
                <div key={group}>
                  <p className="admin-sidebar__group mb-1.5">{group}</p>
                  <ul className="space-y-0.5">
                    {items.map((item) => {
                      const active =
                        pathname === item.href ||
                        (item.href !== ADMIN_ROUTES.hub && pathname.startsWith(item.href));
                      const badge = navBadges?.[item.href];
                      const showBadge = badge !== undefined;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "admin-sidebar__link",
                              active && "admin-sidebar__link--active",
                            )}
                          >
                            <span>{item.label}</span>
                            {showBadge ? (
                              <span className={badgeTone(badge, active)}>{badge}</span>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
          <div className="border-t border-slate-800 p-3">
            <p className="font-mono text-[9px] text-slate-500">{BUILD_STAMP}</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5 lg:px-6">
            <div>
              {title ? (
                <h1 className="admin-page-title">{title}</h1>
              ) : (
                <p className="admin-page-title">운영 콘솔</p>
              )}
              {description ? <p className="admin-page-desc">{description}</p> : null}
            </div>
            <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
              로그아웃
            </Button>
          </header>

          <div className="border-b border-slate-200 bg-white px-2 py-2 lg:hidden">
            <div className="flex gap-1 overflow-x-auto">
              {ADMIN_NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-bold",
                      active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
