import { Info } from "lucide-react";
import { ORDER_REQUEST_VEHICLE_GUIDANCE_COPY } from "@/data/order-request-copy";

export function OrderRequestVehicleGuidance({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`flex gap-3 rounded-xl border border-slate-200/90 bg-slate-50/90 px-3.5 py-3 ${className}`}
      data-order-request-vehicle-guidance
      aria-label="차량 정보 안내"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
      <div className="min-w-0 space-y-1 text-xs font-medium leading-relaxed text-slate-600">
        <p>{ORDER_REQUEST_VEHICLE_GUIDANCE_COPY.line1}</p>
        <p>{ORDER_REQUEST_VEHICLE_GUIDANCE_COPY.line2}</p>
      </div>
    </aside>
  );
}
