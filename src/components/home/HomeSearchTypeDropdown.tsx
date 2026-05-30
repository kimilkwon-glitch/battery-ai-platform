"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

type Props = {
  value: HomeSearchType;
  onChange: (value: HomeSearchType) => void;
};

export function HomeSearchTypeDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = HOME_SEARCH_TYPE_MENU.find((o) => o.id === value) ?? HOME_SEARCH_TYPE_MENU[0]!;
  const SelectedIcon = TYPE_ICONS[selected.id];

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const idx = HOME_SEARCH_TYPE_MENU.findIndex((o) => o.id === value);
    setFocusIndex(idx >= 0 ? idx : 0);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
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

  return (
    <div ref={wrapRef} className="home-search-type-dropdown relative shrink-0 sm:w-[8.125rem]">
      <button
        ref={triggerRef}
        type="button"
        id="home-search-type"
        className={clsx(
          "flex h-14 w-full items-center gap-1.5 rounded-t-2xl border-0 bg-slate-50/90 px-3 text-left transition sm:h-16 sm:rounded-l-2xl sm:rounded-tr-none",
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
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 ring-1 ring-slate-200/80">
          <SelectedIcon className="size-3.5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-800">{selected.label}</span>
        <ChevronDown
          className={clsx("size-3.5 shrink-0 text-slate-400 transition", open && "rotate-180 text-blue-600")}
          aria-hidden
        />
      </button>

      <ul
        id="home-search-type-menu"
        role="listbox"
        aria-label="검색 유형"
        tabIndex={-1}
        hidden={!open}
        onKeyDown={onMenuKeyDown}
        className={clsx(
          "absolute left-0 top-[calc(100%+6px)] z-[60] w-[min(17.5rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200/95 bg-white py-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.12)]",
          "sm:w-[17.5rem]",
          !open && "pointer-events-none",
        )}
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
    </div>
  );
}
