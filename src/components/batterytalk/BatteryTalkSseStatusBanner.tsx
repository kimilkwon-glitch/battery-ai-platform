import { BATTERY_TALK_SSE_UNSTABLE_MESSAGE } from "@/lib/battery-talk/battery-talk-realtime-client";

type Props = {
  show: boolean;
  variant?: "customer" | "admin";
};

export function BatteryTalkSseStatusBanner({ show, variant = "customer" }: Props) {
  if (!show) return null;

  const className =
    variant === "customer"
      ? "shrink-0 border-b border-amber-100 bg-amber-50 px-3 py-1.5 text-[10px] font-medium leading-snug text-amber-900"
      : "mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-medium leading-snug text-amber-900";

  return (
    <p role="status" aria-live="polite" className={className}>
      {BATTERY_TALK_SSE_UNSTABLE_MESSAGE}
    </p>
  );
}
