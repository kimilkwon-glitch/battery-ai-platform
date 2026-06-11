"use client";

import { useState } from "react";

export type DeliverySyncSummary = {
  checked: number;
  updated: number;
  skipped: number;
};

type Props = {
  mode: "inTransit" | "selected";
  orderIds?: string[];
  limit?: number;
  label: string;
  confirmMessage?: string;
  hint?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  onComplete?: (summary: DeliverySyncSummary) => void;
  onReload?: boolean;
};

function formatSummary(data: DeliverySyncSummary): string {
  if (data.checked === 0) {
    return "송장 정보가 있는 배송중 주문이 없습니다.";
  }
  if (data.updated === 0) {
    return `${data.checked}건 확인 · 변경된 주문이 없습니다.`;
  }
  return `${data.checked}건 확인 · ${data.updated}건 배송완료 반영`;
}

export function AdminDeliverySyncButton({
  mode,
  orderIds,
  limit = 20,
  label,
  confirmMessage = "배송중 주문을 다시 조회합니다. 조회 건수가 사용될 수 있습니다.",
  hint,
  className,
  variant = "secondary",
  onComplete,
  onReload = true,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!confirm(confirmMessage)) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/delivery/sync", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          orderIds: mode === "selected" ? orderIds : undefined,
          limit: mode === "inTransit" ? limit : undefined,
        }),
      });
      const data = (await res.json()) as DeliverySyncSummary & { ok?: boolean; message?: string };

      setLoading(false);
      if (!res.ok || data.ok === false) {
        setError(data.message ?? "배송상태 재조회에 실패했습니다.");
        return;
      }

      const summary = {
        checked: data.checked ?? 0,
        updated: data.updated ?? 0,
        skipped: data.skipped ?? 0,
      };
      setMessage(formatSummary(summary));
      onComplete?.(summary);
      if (onReload && summary.updated > 0) {
        window.location.reload();
      }
    } catch {
      setLoading(false);
      setError("배송상태 재조회에 실패했습니다.");
    }
  };

  const btnClass =
    variant === "primary"
      ? "admin-btn admin-btn--primary admin-btn--md"
      : variant === "ghost"
        ? "admin-btn admin-btn--ghost admin-btn--md"
        : "admin-btn admin-btn--secondary admin-btn--md";

  return (
    <div className={`admin-delivery-sync${className ? ` ${className}` : ""}`}>
      <button type="button" className={btnClass} disabled={loading} onClick={() => void run()}>
        {loading ? "조회 중…" : label}
      </button>
      {hint ? <p className="admin-delivery-sync__hint">{hint}</p> : null}
      {message ? <p className="admin-delivery-sync__result">{message}</p> : null}
      {error ? <p className="admin-delivery-sync__error">{error}</p> : null}
    </div>
  );
}
