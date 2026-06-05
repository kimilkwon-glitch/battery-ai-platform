import { WORKFLOW_STATUS_LABELS } from "@/lib/order-request/order-request-admin-constants";
import type { OrderRequestWorkflowStatus } from "@/types/order-request";

export function OrderRequestWorkflowBadge({
  status,
}: {
  status: OrderRequestWorkflowStatus;
}) {
  const cfg = WORKFLOW_STATUS_LABELS[status];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-black ring-1 ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
