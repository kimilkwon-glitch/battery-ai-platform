"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ADMIN_NAV_GROUPS,
  ADMIN_NAV_ITEMS,
  ADMIN_ROUTES,
} from "@/lib/admin/admin-nav";
import { BUILD_STAMP } from "@/lib/build-stamp";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export function AdminShell({ children, title, description }: Props) {
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
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-slate-950 text-slate-100 lg:block">
          <div className="border-b border-slate-800 px-4 py-4">
            <p className="text-xs font-bold text-slate-400">Battery Manager</p>
            <p className="text-sm font-black">운영 콘솔</p>
          </div>
          <nav className="space-y-4 p-3" aria-label="관리자 메뉴">
            {ADMIN_NAV_GROUPS.map((group) => {
              const items = ADMIN_NAV_ITEMS.filter((i) => i.group === group);
              if (!items.length) return null;
              return (
                <div key={group}>
                  <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {group}
                  </p>
                  <ul className="space-y-0.5">
                    {items.map((item) => {
                      const active =
                        pathname === item.href ||
                        (item.href !== ADMIN_ROUTES.hub && pathname.startsWith(item.href));
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "block rounded-md px-2 py-1.5 text-xs font-semibold transition-colors",
                              active
                                ? "bg-blue-600 text-white"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white",
                            )}
                          >
                            {item.label}
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
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
            <div>
              {title ? (
                <h1 className="text-base font-black text-slate-900">{title}</h1>
              ) : (
                <p className="text-sm font-black text-slate-900">운영 콘솔</p>
              )}
              {description ? (
                <p className="text-xs text-slate-500">{description}</p>
              ) : null}
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
                      "shrink-0 rounded-md px-2 py-1 text-[10px] font-bold",
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
