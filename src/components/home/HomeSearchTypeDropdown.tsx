"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Battery,
  Car,
  Check,
  ChevronDown,
  HelpCircle,
  LayoutGrid,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import {
  HOME_SEARCH_TYPE_MENU,
  type HomeSearchType,
} from "@/lib/home-search-types";

const TYPE_ICONS = {
  all: LayoutGrid,
  vehicle: Car,
  battery: Battery,
  symptom: Zap,
  qa: HelpCircle,
} as const;

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

type Props = {
  value: HomeSearchType;
  onChange: (value: HomeSearchType) => void;
};

export function HomeSearchTypeDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const selected = HOME_SEARCH_TYPE_MENU.find((o) => o.id === value) ?? HOME_SEARCH_TYPE_MENU[0]!;
  const SelectedIcon = TYPE_ICONS[selected.id];

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const idx = HOME_SEARCH_TYPE_MENU.findIndex((o) => o.id === value);
    setFocusIndex(idx >= 0 ? idx : 0);
  }, [open, value]);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(17.5 * 16, Math.max(rect.width, window.innerWidth - 32));
    setMenuPos({
      top: rect.bottom + 6,
      left: Math.min(rect.left, window.innerWidth - width - 16),
      width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  function selectType(id: HomeSearchType) {
    onChange(id);
    close();
    triggerRef.current?.focus();
  }

  function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onMenuKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((i) => (i + 1) % HOME_SEARCH_TYPE_MENU.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((i) => (i - 1 + HOME_SEARCH_TYPE_MENU.length) % HOME_SEARCH_TYPE_MENU.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const item = HOME_SEARCH_TYPE_MENU[focusIndex];
      if (item) selectType(item.id);
    } else if (e.key === "Tab") {
      close();
    }
  }

  const menuContent = open && menuPos ? (
    <ul
      ref={menuRef}
      id="home-search-type-menu"
      role="listbox"
      aria-label="검색 유형"
      tabIndex={-1}
      onKeyDown={onMenuKeyDown}
      className="home-search-type-menu home-search-type-menu--portal overflow-hidden rounded-xl border border-slate-200/95 bg-white py-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
      style={{
        position: "fixed",
        top: menuPos.top,
        left: menuPos.left,
        width: menuPos.width,
        zIndex: 9999,
      }}
    >
      {HOME_SEARCH_TYPE_MENU.map((item, index) => {
        const Icon = TYPE_ICONS[item.id];
        const isSelected = item.id === value;
        const isFocused = index === focusIndex;
        return (
          <li key={item.id} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              className={clsx(
                "flex min-h-[2.75rem] w-full items-center gap-3 px-3 py-2 text-left transition",
                isSelected && "bg-blue-50/80",
                isFocused && !isSelected && "bg-slate-50",
                "hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none",
              )}
              onMouseEnter={() => setFocusIndex(index)}
              onClick={() => selectType(item.id)}
            >
              <span
                className={clsx(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg ring-1",
                  isSelected
                    ? "bg-blue-600 text-white ring-blue-600"
                    : "bg-slate-50 text-slate-600 ring-slate-200/90",
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-slate-900">{item.label}</span>
                <span className="mt-0.5 block text-[11px] font-medium leading-snug text-slate-500">
                  {item.hint}
                </span>
              </span>
              {isSelected ? (
                <Check className="size-4 shrink-0 text-blue-600" aria-hidden />
              ) : (
                <span className="size-4 shrink-0" aria-hidden />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  ) : null;

  return (
    <div ref={wrapRef} className="home-search-type-dropdown relative z-[2] shrink-0">
      <button
        ref={triggerRef}
        type="button"
        id="home-search-type"
        className={clsx(
          "home-search-type-trigger flex h-full min-h-0 w-full items-center gap-1 border-0 bg-slate-50/90 text-left transition",
          "rounded-l-[1.375rem] rounded-r-none max-sm:rounded-none",
          "hover:bg-slate-100/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400/70",
          open && "bg-white ring-2 ring-inset ring-blue-400/50",
        )}
        aria-label="검색 유형 선택"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="home-search-type-menu"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="home-search-type-trigger__icon hidden size-7 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 ring-1 ring-slate-200/80 sm:flex">
          <SelectedIcon className="size-3.5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-800">{selected.label}</span>
        <ChevronDown
          className={clsx("size-3.5 shrink-0 text-slate-400 transition", open && "rotate-180 text-blue-600")}
          aria-hidden
        />
      </button>

      {mounted && menuContent ? createPortal(menuContent, document.body) : null}
    </div>
  );
}
