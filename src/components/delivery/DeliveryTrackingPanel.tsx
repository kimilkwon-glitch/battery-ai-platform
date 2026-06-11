"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Clock, Copy, MapPin, Package, Truck } from "lucide-react";
import type { DeliveryTrackProgress, DeliveryTrackResult } from "@/lib/delivery/sweettracker-types";
import { bm } from "@/lib/design-tokens";

type Props = {
  courierCode: string;
  courierName: string;
  invoiceNumber: string;
  /** 조회 전 헤더 배지 (주문상태 등, 표시용) */
  idleStatusLabel?: string;
  trackButtonLabel?: string;
  className?: string;
  /** customer: 주문상세 카드 / admin: 관리자 테스트 */
  variant?: "customer" | "admin";
};

type TrackState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "success"; data: DeliveryTrackResult; fetchedAt: string }
  | { phase: "error"; message: string };

type StatusTone = "pending" | "transit" | "delivered" | "unavailable" | "idle";

function statusToneFromLabel(label: string): StatusTone {
  const t = label.trim();
  if (/배송완료|배달완료|수취/.test(t)) return "delivered";
  if (/배송중|이동|간선|출고|배달|운송/.test(t)) return "transit";
  if (/집화|접수|준비|등록|상품/.test(t)) return "pending";
  if (/없|불가|오류|미등록|반영/.test(t)) return "unavailable";
  return "transit";
}

function badgeClass(tone: StatusTone): string {
  switch (tone) {
    case "delivered":
      return "bg-emerald-100 text-emerald-800 ring-emerald-200/80";
    case "transit":
      return "bg-blue-100 text-blue-800 ring-blue-200/80";
    case "pending":
      return "bg-slate-100 text-slate-700 ring-slate-200/80";
    case "unavailable":
      return "bg-amber-100 text-amber-900 ring-amber-200/80";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200/80";
  }
}

function badgeLabel(tone: StatusTone, statusText?: string): string {
  if (tone === "delivered") return "배송완료";
  if (tone === "transit") return "배송중";
  if (tone === "pending") return "집화·접수";
  if (tone === "unavailable") return "조회불가";
  if (statusText) {
    const short = statusText.split("·")[0]?.trim() ?? statusText;
    return short.length > 10 ? `${short.slice(0, 10)}…` : short;
  }
  return "조회 전";
}

function shortStatusLine(status: string): string {
  const part = status.split("·")[0]?.trim() ?? status;
  return part.length > 24 ? `${part.slice(0, 24)}…` : part;
}

function timelineNewestFirst(items: DeliveryTrackProgress[]): DeliveryTrackProgress[] {
  return [...items].reverse();
}

function latestSnapshot(data: DeliveryTrackResult): {
  statusLine: string;
  location: string;
  time: string;
} {
  const newest = timelineNewestFirst(data.progresses)[0];
  return {
    statusLine: shortStatusLine(data.status),
    location: newest?.location && newest.location !== "—" ? newest.location : "—",
    time: data.lastUpdatedAt || newest?.time || "—",
  };
}

function DeliveryTimeline({ items }: { items: DeliveryTrackProgress[] }) {
  const ordered = timelineNewestFirst(items);
  if (ordered.length === 0) return null;

  return (
    <div className="delivery-tracking-timeline">
      <p className="mb-3 text-xs font-black text-slate-800">배송 진행</p>
      <ol className="space-y-0">
        {ordered.map((p, i) => {
          const isLatest = i === 0;
          const isLast = i === ordered.length - 1;
          const title =
            p.location && p.location !== "—"
              ? `${p.location}${p.status && p.status !== "—" ? ` · ${p.status}` : ""}`
              : p.status;

          return (
            <li key={`${p.time}-${p.status}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
              <div className="flex w-3 shrink-0 flex-col items-center pt-1">
                <span
                  className={`size-2.5 shrink-0 rounded-full ring-2 ring-white ${
                    isLatest ? "bg-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.18)]" : "bg-slate-300"
                  }`}
                  aria-hidden
                />
                {!isLast ? (
                  <span className="mt-1 w-px flex-1 bg-gradient-to-b from-slate-200 to-slate-100" />
                ) : null}
              </div>
              <div
                className={`min-w-0 flex-1 rounded-xl px-3 py-2.5 ${
                  isLatest
                    ? "border border-blue-100/90 bg-blue-50/70"
                    : "border border-transparent bg-white/60"
                }`}
              >
                <p
                  className={`break-words text-sm font-black leading-snug ${
                    isLatest ? "text-slate-900" : "text-slate-700"
                  }`}
                >
                  {title}
                </p>
                {p.time && p.time !== "—" ? (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <Clock className="size-3 shrink-0" aria-hidden />
                    {p.time}
                  </p>
                ) : null}
                {p.description && p.description !== p.status && p.description !== title ? (
                  <p className="mt-1 break-words text-[11px] leading-relaxed text-slate-600">
                    {p.description}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function DeliveryTrackingPanel({
  courierCode,
  courierName,
  invoiceNumber,
  trackButtonLabel = "배송조회하기",
  idleStatusLabel,
  className = "",
  variant = "customer",
}: Props) {
  const [state, setState] = useState<TrackState>({ phase: "idle" });
  const [copied, setCopied] = useState(false);

  const canTrack = Boolean(courierCode.trim() && invoiceNumber.trim());
  const isCustomer = variant === "customer";

  const track = useCallback(async () => {
    if (!canTrack || state.phase === "loading") return;
    setState({ phase: "loading" });
    try {
      const res = await fetch("/api/delivery/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courierCode: courierCode.trim(),
          invoiceNumber: invoiceNumber.trim(),
        }),
        cache: "no-store",
      });
      const data = (await res.json()) as DeliveryTrackResult | { ok: false; message: string };
      if (!data.ok) {
        setState({
          phase: "error",
          message:
            data.message ||
            "택배사 집화 전이거나 운송장 정보가 아직 반영되지 않았습니다.",
        });
        return;
      }
      setState({
        phase: "success",
        data,
        fetchedAt: new Date().toISOString(),
      });
    } catch {
      setState({
        phase: "error",
        message: "배송조회 중 오류가 발생했습니다.",
      });
    }
  }, [canTrack, courierCode, invoiceNumber, state.phase]);

  const copyInvoice = useCallback(async () => {
    if (!invoiceNumber.trim()) return;
    try {
      await navigator.clipboard.writeText(invoiceNumber.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [invoiceNumber]);

  const headerBadge = useMemo(() => {
    if (state.phase === "success") {
      const tone = statusToneFromLabel(state.data.status);
      return { tone, text: badgeLabel(tone, state.data.status) };
    }
    if (state.phase === "error") {
      return { tone: "unavailable" as const, text: "조회불가" };
    }
    if (idleStatusLabel?.trim()) {
      const tone = statusToneFromLabel(idleStatusLabel);
      return { tone, text: idleStatusLabel.trim() };
    }
    return { tone: "idle" as const, text: "조회 전" };
  }, [state, idleStatusLabel]);

  const buttonLabel =
    state.phase === "loading"
      ? "조회 중..."
      : state.phase === "idle"
        ? trackButtonLabel
        : "다시 조회하기";

  const shellClass = isCustomer
    ? "rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50/40 via-white to-slate-50/90 p-4 shadow-sm sm:p-5"
    : "rounded-xl border border-slate-200 bg-slate-50/50 p-3";

  const snapshot =
    state.phase === "success" ? latestSnapshot(state.data) : null;

  return (
    <article className={`delivery-tracking-panel ${shellClass} ${className}`}>
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-black text-slate-900">배송조회</h3>
        <span
          className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${badgeClass(headerBadge.tone)}`}
        >
          {headerBadge.text}
        </span>
      </header>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-white/80 bg-white/70 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">택배사</p>
          <p className="mt-1 text-sm font-black text-slate-900">{courierName || "—"}</p>
        </div>
        <div className="rounded-xl border border-white/80 bg-white/70 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">운송장번호</p>
          <div className="mt-1 flex min-w-0 items-start justify-between gap-2">
            <p className="break-all font-mono text-sm font-black leading-snug text-slate-900">
              {invoiceNumber || "—"}
            </p>
            {invoiceNumber.trim() ? (
              <button
                type="button"
                onClick={() => void copyInvoice()}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                aria-label="운송장번호 복사"
              >
                {copied ? (
                  <>
                    <Check className="size-3 text-emerald-600" aria-hidden />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="size-3" aria-hidden />
                    복사
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {state.phase === "success" && snapshot ? (
        <div className="mt-4 rounded-xl border border-blue-100/80 bg-gradient-to-br from-blue-50/80 to-white px-4 py-3.5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-700">
              <Truck className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="text-base font-black text-slate-900">{snapshot.statusLine}</p>
              {snapshot.location !== "—" ? (
                <p className="flex items-center gap-1.5 break-words text-sm font-semibold text-slate-700">
                  <MapPin className="size-3.5 shrink-0 text-slate-400" aria-hidden />
                  {snapshot.location}
                </p>
              ) : null}
              {snapshot.time !== "—" ? (
                <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Clock className="size-3.5 shrink-0" aria-hidden />
                  {snapshot.time}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {state.phase === "success" && state.data.progresses.length > 0 ? (
        <div className="mt-4 rounded-xl border border-slate-100/90 bg-white/55 px-3 py-3 sm:px-4">
          <DeliveryTimeline items={state.data.progresses} />
        </div>
      ) : null}

      {state.phase === "error" ? (
        <div
          className="mt-4 rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-orange-50/40 px-4 py-3.5"
          role="alert"
        >
          <div className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Package className="size-4" aria-hidden />
            </span>
            <div className="space-y-1 text-sm leading-relaxed">
              {isCustomer ? (
                <>
                  <p className="font-black text-amber-950">아직 배송 정보가 없습니다.</p>
                  <p className="font-medium text-amber-900/90">집화 전이거나 운송장 반영 전입니다.</p>
                  <p className="text-xs font-medium text-amber-800/80">잠시 후 다시 조회해 주세요.</p>
                </>
              ) : (
                <p className="font-medium text-amber-950">{state.message}</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={!canTrack || state.phase === "loading"}
        onClick={() => void track()}
        className={`${bm.btnNavy} mt-4 w-full justify-center text-xs disabled:pointer-events-none disabled:opacity-50`}
      >
        {buttonLabel}
      </button>

      {!isCustomer && state.phase === "success" ? (
        <details className="mt-3 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-[11px]">
          <summary className="cursor-pointer font-bold text-slate-600">응답 상세 (디버그)</summary>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-slate-600">
            {JSON.stringify(state.data, null, 2)}
          </pre>
        </details>
      ) : null}

      {!isCustomer && state.phase === "error" ? (
        <details className="mt-3 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-[11px]">
          <summary className="cursor-pointer font-bold text-slate-600">오류 상세 (디버그)</summary>
          <pre className="mt-2 whitespace-pre-wrap break-all font-mono text-slate-600">{state.message}</pre>
        </details>
      ) : null}
    </article>
  );
}
