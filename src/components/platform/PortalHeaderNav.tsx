"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HUB_BENEFITS,
  HUB_BRANDS,
  HUB_REVIEWS,
  HUB_STORE_DETAIL,
  HUB_SUPPORT,
} from "@/lib/customer-hub-routes";
import { GuideDesktopMegaMenu, GuideMobileAccordion } from "@/components/platform/GuideMegaMenu";

/** 상단 카테고리 — 홈은 좌측 로고, 텍스트 홈 메뉴 없음 */
export const portalNavPrimary = [
  ["배터리 업그레이드", "/compare"],
  ["브랜드 안내", HUB_BRANDS],
  ["매장·출장 안내", HUB_STORE_DETAIL],
  ["혜택", HUB_BENEFITS],
  ["리뷰", HUB_REVIEWS],
  ["고객센터", HUB_SUPPORT],
] as const;

export const portalNav = portalNavPrimary as unknown as [string, string][];

function isNavActive(pathname: string, label: string, href: string): boolean {
  if (label === "브랜드 안내") return pathname === "/brands" || pathname.startsWith("/brands/");
  if (label === "매장·출장 안내") {
    return pathname === "/service-center" || pathname.startsWith("/service-center/");
  }
  if (label === "혜택") return pathname === "/benefits" || pathname.startsWith("/benefits/");
  if (label === "리뷰") return pathname === "/reviews" || pathname.startsWith("/reviews/");
  if (label === "고객센터") {
    return pathname === "/support" || pathname.startsWith("/support/");
  }
  const base = href.split("?")[0]!.split("#")[0]!;
  if (pathname === base) return true;
  if (base !== "/" && pathname.startsWith(`${base}/`)) return true;
  return false;
}

function NavPill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      className={`portal-nav-link inline-flex shrink-0 items-center whitespace-nowrap rounded-full ${
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
        className="portal-header-desktop-nav flex w-full max-w-full flex-nowrap items-center justify-center gap-0.5 lg:gap-1 xl:gap-1.5"
        aria-label="주요 메뉴"
      >
        {portalNavPrimary.slice(0, 2).map(([label, href]) => (
          <NavPill
            active={isNavActive(pathname, label, href)}
            href={href}
            key={`${label}-${href}`}
            label={label}
          />
        ))}
        <NavPill
          active={isNavActive(pathname, "매장·출장 안내", HUB_STORE_DETAIL)}
          href={HUB_STORE_DETAIL}
          label="매장·출장 안내"
        />
        <GuideDesktopMegaMenu />
        {portalNavPrimary.slice(3).map(([label, href]) => (
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
    <nav className="relative border-t border-slate-100 bg-white" aria-label="모바일 메뉴">
      <div className="portal-header-mobile-nav mx-auto flex max-w-[1440px] flex-nowrap items-center justify-start gap-2.5 overflow-x-auto px-3 py-3">
        {portalNavPrimary.slice(0, 2).map(([label, href]) => (
          <NavPill
            active={isNavActive(pathname, label, href)}
            href={href}
            key={`m-${label}-${href}`}
            label={label}
          />
        ))}
        <NavPill
          active={isNavActive(pathname, "매장·출장 안내", HUB_STORE_DETAIL)}
          href={HUB_STORE_DETAIL}
          label="매장·출장 안내"
        />
        <GuideMobileAccordion />
        {portalNavPrimary.slice(3).map(([label, href]) => (
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
