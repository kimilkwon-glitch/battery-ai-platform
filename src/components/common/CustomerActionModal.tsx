"use client";

import { useEffect, type ReactNode } from "react";
import { bm } from "@/lib/design-tokens";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function CustomerActionModal({
  open,
  onClose,
  title,
  titleId = "customer-action-modal-title",
  children,
  footer,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="배경 닫기"
        onClick={onClose}
      />
      <div className={`${bm.card} relative z-10 w-full max-w-md overflow-hidden p-5 shadow-2xl sm:p-6`}>
        <h2 id={titleId} className="text-lg font-black text-slate-950 sm:text-xl">
          {title}
        </h2>
        <div className="mt-3">{children}</div>
        {footer ? <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">{footer}</div> : null}
      </div>
    </div>
  );
}
