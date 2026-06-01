"use client";

import { useEffect, useState } from "react";
import { bm } from "@/lib/design-tokens";

export function CartToast({
  message,
  visible,
  onDismiss,
}: {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShow(false);
      return;
    }
    setShow(true);
    const t = window.setTimeout(() => {
      setShow(false);
      onDismiss();
    }, 2800);
    return () => window.clearTimeout(t);
  }, [visible, onDismiss]);

  if (!show) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 px-4 md:bottom-6"
      role="status"
      aria-live="polite"
    >
      <p
        className={`${bm.card} border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center text-xs font-black text-emerald-950 shadow-lg`}
      >
        {message}
      </p>
    </div>
  );
}
