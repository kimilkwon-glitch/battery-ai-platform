"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { GUIDE_HUB_ITEMS, isGuideHubPath } from "@/lib/guide-hub-routes";
import { HUB_GUIDE } from "@/lib/customer-hub-routes";

const CLOSE_DELAY_MS = 160;

function useCloseOnOutsideAndEscape(open: boolean, onClose: () => void, wrapRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) onClose();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, wrapRef]);
}

function useHoverCloseDelay() {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback((onClose: () => void) => {
    cancelClose();
    closeTimerRef.current = setTimeout(onClose, CLOSE_DELAY_MS);
  }, [cancelClose]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  return { cancelClose, scheduleClose };
}

export function GuideDesktopMegaMenu() {
  const pathname = usePathname();
  const active = isGuideHubPath(pathname);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { cancelClose, scheduleClose } = useHoverCloseDelay();

  const close = useCallback(() => {
    cancelClose();
    setOpen(false);
  }, [cancelClose]);

  const openMenu = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  useCloseOnOutsideAndEscape(open, close, wrapRef);

  return (
    <div
      ref={wrapRef}
      className={clsx("guide-menu-wrapper guide-mega-menu relative", open && "guide-menu-wrapper--open")}
      onMouseEnter={openMenu}
      onMouseLeave={() => scheduleClose(close)}
    >
      <div className="inline-flex items-center gap-0">
        <Link
          href={HUB_GUIDE}
          className={clsx(
            "portal-nav-link inline-flex shrink-0 items-center whitespace-nowrap rounded-full rounded-r-none pr-1",
            active && "portal-nav-link--active portal-nav-link--guide-active",
          )}
          onClick={close}
        >
          <span className="portal-nav-link__text">배터리 가이드</span>
        </Link>
        <button
          type="button"
          className={clsx(
            "portal-nav-link inline-flex shrink-0 items-center rounded-full rounded-l-none pl-0.5 pr-2",
            active && "portal-nav-link--active portal-nav-link--guide-active",
          )}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label="배터리 가이드 하위 메뉴"
          onClick={() => (open ? close() : openMenu())}
        >
          <ChevronDown
            className={clsx("size-3 opacity-60 transition", open && "rotate-180")}
            aria-hidden
          />
        </button>
      </div>

      {/* trigger↔panel 사이 hover 브리지(pt-2) + 패널을 wrapper 안에 유지 */}
      <div
        className={clsx(
          "guide-mega-dropdown absolute left-1/2 top-full z-[70] w-[min(520px,calc(100vw-2rem))] -translate-x-1/2",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        onMouseEnter={openMenu}
        onMouseLeave={() => scheduleClose(close)}
        aria-hidden={!open}
      >
        <div className="guide-mega-bridge pt-2" aria-hidden="true">
          <div
            className={clsx(
              "guide-mega-panel rounded-2xl border border-slate-200 bg-white p-4 shadow-xl transition duration-[var(--motion-fast)] ease-out",
              open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
            )}
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
                        "guide-mega-item flex min-h-[4.25rem] gap-3 rounded-xl border p-3 transition duration-[var(--motion-normal)] motion-safe:hover:-translate-y-0.5",
                        itemActive ? "guide-mega-item--active" : "border-slate-100 bg-slate-50/30",
                      )}
                      onClick={close}
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
              onClick={close}
            >
              가이드 허브 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GuideMobileAccordion() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(isGuideHubPath(pathname));
  const active = isGuideHubPath(pathname);
  const wrapRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setExpanded(false), []);

  useCloseOnOutsideAndEscape(expanded, close, wrapRef);

  return (
    <div ref={wrapRef} className="guide-mobile-accordion relative shrink-0">
      <div className="inline-flex items-center gap-0.5">
        <Link
          href={HUB_GUIDE}
          className={clsx(
            "portal-nav-link inline-flex shrink-0 items-center whitespace-nowrap rounded-full",
            active && "portal-nav-link--active portal-nav-link--guide-active",
          )}
        >
          <span className="portal-nav-link__text">배터리 가이드</span>
        </Link>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={clsx(
            "portal-nav-link inline-flex shrink-0 items-center rounded-full px-1.5",
            active && "portal-nav-link--active portal-nav-link--guide-active",
          )}
          aria-expanded={expanded}
          aria-haspopup="true"
          aria-label="배터리 가이드 하위 메뉴"
        >
          <ChevronDown
            className={clsx("size-3 opacity-60 transition", expanded && "rotate-180")}
            aria-hidden
          />
        </button>
      </div>
      <div
        className={clsx(
          "absolute left-0 right-0 top-full z-[70] border-t border-slate-100 bg-white px-3 py-3 shadow-md transition duration-[var(--motion-fast)] ease-out",
          expanded ? "pointer-events-auto visible opacity-100" : "pointer-events-none invisible opacity-0",
        )}
        aria-hidden={!expanded}
      >
        <Link
          href={HUB_GUIDE}
          className="mb-2 block rounded-lg bg-indigo-50 px-3 py-2.5 text-center text-xs font-black text-indigo-900"
          onClick={close}
        >
          배터리 가이드 전체 보기
        </Link>
        <ul className="space-y-1">
          {GUIDE_HUB_ITEMS.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="block rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-900"
                onClick={close}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
