"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/lib/admin/admin-nav";
import { bm } from "@/lib/design-tokens";

export function AdminPageNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <nav
      className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2"
      aria-label="관리자 메뉴"
    >
      {ADMIN_NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-black ${
              active
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => void handleLogout()}
        className={`${bm.btnTertiary} ml-auto text-[10px]`}
      >
        로그아웃
      </button>
    </nav>
  );
}
