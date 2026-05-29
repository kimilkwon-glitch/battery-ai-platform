"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { GUIDE_HUB_ITEMS, isGuideHubPath } from "@/lib/guide-hub-routes";
import { HUB_GUIDE } from "@/lib/customer-hub-routes";

function GuideNavPill({ active, onClick }: { active: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "portal-nav-link inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-2.5 py-2 text-[12px] font-extrabold lg:px-3 lg:text-[13px] xl:px-3.5 xl:py-2.5 xl:text-sm",
        active && "portal-nav-link--active portal-nav-link--guide-active",
      )}
      aria-expanded={undefined}
      aria-haspopup="true"
    >
      <span className="portal-nav-link__text">배터리 가이드</span>
      <ChevronDown className="size-3 opacity-60" aria-hidden />
    </button>
  );
}

export function GuideDesktopMegaMenu() {
  const pathname = usePathname();
  const active = isGuideHubPath(pathname);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="guide-mega-menu relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <GuideNavPill active={active} onClick={() => setOpen((v) => !v)} />

      {open ? (
        <div
          className="guide-mega-panel absolute left-1/2 top-full z-[60] mt-2 w-[min(520px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          role="menu"
        >
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">배터리 가이드</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {GUIDE_HUB_ITEMS.map((item) => {
              const Icon = item.Icon;
              const itemActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    role="menuitem"
                    className={clsx(
                      "guide-mega-item flex gap-3 rounded-xl border p-3 transition duration-[var(--motion-normal)] motion-safe:hover:-translate-y-0.5",
                      itemActive ? "guide-mega-item--active" : "border-slate-100 bg-slate-50/30",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <span className="guide-mega-item__icon flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-slate-100">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-sm font-black text-slate-900">{item.label}</span>
                      <span className="mt-0.5 block text-[11px] font-medium leading-snug text-slate-500">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href={HUB_GUIDE}
            className="mt-3 block text-center text-[10px] font-bold text-slate-400 hover:text-blue-700"
            onClick={() => setOpen(false)}
          >
            가이드 허브 보기
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function GuideMobileAccordion() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(isGuideHubPath(pathname));
  const active = isGuideHubPath(pathname);

  return (
    <div className="guide-mobile-accordion shrink-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={clsx(
          "portal-nav-link inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-2.5 py-2 text-[12px] font-extrabold",
          active && "portal-nav-link--active",
        )}
        aria-expanded={expanded}
      >
        <span className="portal-nav-link__text">배터리 가이드</span>
        <ChevronDown
          className={clsx("size-3 opacity-60 transition", expanded && "rotate-180")}
          aria-hidden
        />
      </button>
      {expanded ? (
        <div className="absolute left-0 right-0 top-full z-[55] border-t border-slate-100 bg-white px-3 py-3 shadow-md">
          <ul className="space-y-1">
            {GUIDE_HUB_ITEMS.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
