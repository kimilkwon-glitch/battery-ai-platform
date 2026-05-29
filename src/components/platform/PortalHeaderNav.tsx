"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HUB_VEHICLES } from "@/lib/customer-hub-routes";
import {
  HUB_ORDER_CHECKLIST,
  HUB_PHOTO_CHECK,
  HUB_SYMPTOMS,
} from "@/lib/platform-hub-routes";

/** 메인·전역 상단 — 통합검색 없음, 카테고리형 플랫 메뉴 */
export const portalNavPrimary = [
  ["차량검색", HUB_VEHICLES],
  ["규격검색", "/search"],
  ["배터리비교", "/compare"],
  ["사진확인", HUB_PHOTO_CHECK],
  ["증상진단", HUB_SYMPTOMS],
  ["주문 전 확인", HUB_ORDER_CHECKLIST],
  ["로케트", "/brands?brand=rocket"],
  ["쏠라이트", "/brands?brand=solite"],
] as const;

/** 보조 — 더보기 */
export const portalNavMore = [
  ["매장·택배", "/service"],
  ["Q&A", "/community"],
  ["가이드", "/guides"],
  ["브랜드 전체", "/brands"],
] as const;

export const portalNav = [...portalNavPrimary, ...portalNavMore] as unknown as [string, string][];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const base = href.split("?")[0]!;
  if (pathname === base) return true;
  if (base !== "/" && pathname.startsWith(`${base}/`)) return true;
  return false;
}

function NavPill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-black transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
      }`}
      href={href}
    >
      {label}
    </Link>
  );
}

function NavMoreMenu({
  pathname,
  align = "right",
}: {
  pathname: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const moreActive = portalNavMore.some(([, href]) => isActive(pathname, href));

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-black transition ${
          moreActive || open
            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
            : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        더보기
        <span className="text-[10px]" aria-hidden>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open ? (
        <div
          className={`absolute top-[calc(100%+6px)] z-50 min-w-[168px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {portalNavMore.map(([label, href]) => (
            <Link
              key={href}
              className={`block whitespace-nowrap px-4 py-2 text-xs font-black transition hover:bg-blue-50 ${
                isActive(pathname, href) ? "bg-blue-50 text-blue-700" : "text-slate-700"
              }`}
              href={href}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
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
      <nav className="flex shrink-0 items-center gap-1" aria-label="주요 메뉴">
        {portalNavPrimary.map(([label, href]) => (
          <NavPill active={isActive(pathname, href)} href={href} key={href} label={label} />
        ))}
        <NavMoreMenu pathname={pathname} />
      </nav>
    );
  }

  return (
    <nav className="border-t border-slate-100 bg-white" aria-label="모바일 메뉴">
      <div className="mx-auto flex max-w-[1440px] items-center gap-1.5 overflow-x-auto px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {portalNavPrimary.map(([label, href]) => (
          <NavPill active={isActive(pathname, href)} href={href} key={`m-${href}`} label={label} />
        ))}
        <NavMoreMenu align="left" pathname={pathname} />
      </div>
    </nav>
  );
}
