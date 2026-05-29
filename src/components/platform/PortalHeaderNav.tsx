"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HUB_BRANDS, HUB_SHOP_ANCHORS, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { HUB_SYMPTOMS } from "@/lib/platform-hub-routes";

/** 상단 카테고리 — 검색은 메인 통합검색만, 더보기 없이 전체 노출 */
export const portalNavPrimary = [
  ["홈", "/"],
  ["배터리 업그레이드", "/compare"],
  ["증상진단", HUB_SYMPTOMS],
  ["브랜드 안내", HUB_BRANDS],
  ["매장·출장 안내", HUB_STORE_DETAIL],
  ["택배주문", HUB_SHOP_ANCHORS.delivery],
] as const;

export const portalNav = portalNavPrimary as unknown as [string, string][];

function isNavActive(pathname: string, label: string, href: string): boolean {
  if (label === "홈") return pathname === "/";
  if (label === "브랜드 안내") return pathname === "/brands" || pathname.startsWith("/brands/");
  if (label === "매장·출장 안내") {
    return pathname === "/service-center" || pathname.startsWith("/service-center/");
  }
  const base = href.split("?")[0]!.split("#")[0]!;
  if (pathname === base) return true;
  if (base !== "/" && pathname.startsWith(`${base}/`)) return true;
  return false;
}

function NavPill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      className={`portal-nav-link inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-2 text-[12px] font-extrabold lg:px-3 lg:text-[13px] xl:px-3.5 xl:py-2.5 xl:text-sm ${
        active ? "portal-nav-link--active" : ""
      }`}
      href={href}
    >
      <span className="portal-nav-link__text">{label}</span>
    </Link>
  );
}

export function useNavViewport(): "desktop" | "mobile" | null {
  const [viewport, setViewport] = useState<"desktop" | "mobile" | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setViewport(mq.matches ? "desktop" : "mobile");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return viewport;
}

export function PortalSiteNav({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname();

  if (variant === "desktop") {
    return (
      <nav
        className="portal-header-desktop-nav flex w-full max-w-[calc(100%-4.5rem)] flex-nowrap items-center justify-center gap-1 lg:gap-1.5 xl:gap-2"
        aria-label="주요 메뉴"
      >
        {portalNavPrimary.map(([label, href]) => (
          <NavPill
            active={isNavActive(pathname, label, href)}
            href={href}
            key={`${label}-${href}`}
            label={label}
          />
        ))}
      </nav>
    );
  }

  return (
    <nav className="border-t border-slate-100 bg-white" aria-label="모바일 메뉴">
      <div className="portal-header-mobile-nav mx-auto flex max-w-[1440px] flex-nowrap items-center justify-start gap-2 overflow-x-auto px-3 py-2.5">
        {portalNavPrimary.map(([label, href]) => (
          <NavPill
            active={isNavActive(pathname, label, href)}
            href={href}
            key={`m-${label}-${href}`}
            label={label}
          />
        ))}
      </div>
    </nav>
  );
}
