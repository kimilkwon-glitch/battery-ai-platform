"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  HUB_BATTERY,
  HUB_PHOTO,
  HUB_QA,
  HUB_SEARCH,
  HUB_SHOP,
  HUB_STORE,
  HUB_VEHICLES,
} from "@/lib/customer-hub-routes";

export const portalNavPrimary = [
  ["통합검색", HUB_SEARCH],
  ["차종검색", HUB_VEHICLES],
  ["배터리", HUB_BATTERY],
  ["사진확인", HUB_PHOTO],
  ["매장·출장", HUB_STORE],
  ["택배·쇼핑", HUB_SHOP],
  ["Q&A", HUB_QA],
] as const;

/** 보조 메뉴 — 중복 항목 제거 */
export const portalNavMore = [
  ["가이드", "/guides"],
  ["비교", "/compare"],
  ["증상 확인", "/diagnosis"],
  ["브랜드", "/brands"],
] as const;

export const portalNav = [...portalNavPrimary, ...portalNavMore] as unknown as [string, string][];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const base = href.split("#")[0]!;
  return pathname === base || pathname.startsWith(`${base}/`);
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

/** 한 번에 desktop 또는 mobile 메뉴만 렌더 */
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
