"use client";

import { useSearchParams } from "next/navigation";
import { ReviewWriteForm } from "@/components/reviews/ReviewWriteForm";

export function ReviewWritePageClient() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? undefined;
  const orderNumber = params.get("orderNumber") ?? undefined;
  const battery = params.get("battery") ?? undefined;

  return (
    <ReviewWriteForm
      orderId={orderId}
      orderNumber={orderNumber}
      batteryCode={battery}
    />
  );
}
