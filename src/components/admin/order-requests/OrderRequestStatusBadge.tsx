import type { OrderRequestAdminStatus } from "@/types/order-request";

const LABELS: Record<OrderRequestAdminStatus, { label: string; className: string }> = {
  prepared: { label: "접수 준비", className: "bg-slate-100 text-slate-800 ring-slate-200" },
  pending_review: {
    label: "확인 필요",
    className: "bg-amber-50 text-amber-950 ring-amber-200",
  },
  contacted: { label: "연락 완료", className: "bg-blue-50 text-blue-900 ring-blue-200" },
  closed: { label: "종료", className: "bg-emerald-50 text-emerald-900 ring-emerald-200" },
  canceled: { label: "취소", className: "bg-slate-200 text-slate-600 ring-slate-300" },
};

export function OrderRequestStatusBadge({ status }: { status: OrderRequestAdminStatus }) {
  const cfg = LABELS[status];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black ring-1 ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
