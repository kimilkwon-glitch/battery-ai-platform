"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
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
      <Link
        href={HUB_GUIDE}
        className={clsx(
          "portal-nav-link inline-flex shrink-0 items-center whitespace-nowrap rounded-full",
          active && "portal-nav-link--active portal-nav-link--guide-active",
        )}
        onClick={close}
      >
        <span className="portal-nav-link__text">배터리 가이드</span>
      </Link>

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

/** 모바일 — 화살표 없이 가이드 허브로 이동 (하위 메뉴는 /guides에서 확인) */
export function GuideMobileAccordion() {
  const pathname = usePathname();
  const active = isGuideHubPath(pathname);

  return (
    <Link
      href={HUB_GUIDE}
      className={clsx(
        "portal-nav-link inline-flex shrink-0 items-center whitespace-nowrap rounded-full",
        active && "portal-nav-link--active portal-nav-link--guide-active",
      )}
    >
      <span className="portal-nav-link__text">배터리 가이드</span>
    </Link>
  );
}
