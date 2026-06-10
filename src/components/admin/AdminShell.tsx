"use client";

import { usePathname, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { ADMIN_NAV_ITEMS } from "@/lib/admin/admin-nav";
import type { AdminNavBadges } from "@/lib/admin/data/nav-badges";
import { BUILD_STAMP } from "@/lib/build-stamp";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  navBadges?: AdminNavBadges;
};

export function AdminShell({ children, navBadges }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLabel =
    ADMIN_NAV_ITEMS.find(
      (i) => pathname === i.href || (i.href !== "/admin" && pathname.startsWith(i.href)),
    )?.label ?? "운영 콘솔";

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-100" data-admin-console data-build-version={BUILD_STAMP}>
      <div className="flex min-h-screen">
        <aside className="admin-sidebar hidden w-[13.5rem] shrink-0 border-r border-slate-800 bg-slate-950 text-slate-100 lg:block">
          <div className="border-b border-slate-800 px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Battery Manager
            </p>
            <p className="admin-sidebar__brand-title">운영 콘솔</p>
          </div>
          <div className="max-h-[calc(100vh-5.5rem)] overflow-y-auto p-2">
            <Suspense fallback={null}>
              <AdminSidebarNav navBadges={navBadges} />
            </Suspense>
          </div>
          <div className="border-t border-slate-800 p-3">
            <p className="font-mono text-[9px] text-slate-500">{BUILD_STAMP}</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="admin-mobile-menu-btn lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="관리자 메뉴 열기"
              >
                ☰
              </button>
              <p className="truncate text-sm font-bold text-slate-600 lg:hidden">{currentLabel}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
              로그아웃
            </Button>
          </header>

          <main className="admin-main flex-1 p-3 sm:p-4 lg:p-5 xl:p-6">{children}</main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="admin-mobile-drawer lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="admin-mobile-drawer__backdrop"
            aria-label="메뉴 닫기"
            onClick={() => setMobileOpen(false)}
          />
          <div className="admin-mobile-drawer__panel">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <p className="text-sm font-black text-white">관리자 메뉴</p>
              <button
                type="button"
                className="text-slate-400"
                onClick={() => setMobileOpen(false)}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto p-2">
              <Suspense fallback={null}>
                <AdminSidebarNav
                  navBadges={navBadges}
                  onNavigate={() => setMobileOpen(false)}
                  className={cn(mobileOpen && "admin-sidebar-nav--drawer")}
                />
              </Suspense>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
