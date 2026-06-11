"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ReviewWriteForm } from "@/components/reviews/ReviewWriteForm";
import type { ReviewWriteOrderContext } from "@/lib/reviews/review-write-types";

export function ReviewWritePageClient() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? undefined;
  const orderNumber = params.get("orderNumber") ?? undefined;
  const battery = params.get("battery") ?? undefined;

  const [orderContext, setOrderContext] = useState<ReviewWriteOrderContext | null>(null);
  const [contextLoading, setContextLoading] = useState(Boolean(orderId));
  const [verifiedContact, setVerifiedContact] = useState("");

  const loadContext = useCallback(
    async (contact?: string) => {
      const qs = new URLSearchParams();
      if (orderId) qs.set("orderId", orderId);
      else if (orderNumber) {
        qs.set("orderNumber", orderNumber);
        const phone = contact?.trim();
        if (!phone) {
          setOrderContext(null);
          setContextLoading(false);
          return;
        }
        qs.set("contact", phone);
      } else {
        setContextLoading(false);
        return;
      }

      setContextLoading(true);
      try {
        const res = await fetch(`/api/reviews/context?${qs.toString()}`, {
          credentials: "include",
        });
        const data = (await res.json()) as {
          ok?: boolean;
          context?: ReviewWriteOrderContext;
        };
        if (res.ok && data.ok && data.context) {
          setOrderContext(data.context);
        } else {
          setOrderContext(null);
        }
      } catch {
        setOrderContext(null);
      } finally {
        setContextLoading(false);
      }
    },
    [orderId, orderNumber],
  );

  useEffect(() => {
    if (orderId) {
      void loadContext();
      return;
    }
    if (orderNumber && verifiedContact) {
      void loadContext(verifiedContact);
    }
  }, [orderId, orderNumber, verifiedContact, loadContext]);

  const handleContactVerified = (contact: string) => {
    setVerifiedContact(contact);
  };

  const defaultVehicle = orderContext?.vehicleName ?? "";
  const defaultServiceType = orderContext?.serviceType ?? "";

  return (
    <ReviewWriteForm
      orderId={orderId}
      orderNumber={orderNumber}
      batteryCode={orderContext?.batteryCode ?? battery}
      defaultVehicle={defaultVehicle}
      defaultServiceType={defaultServiceType}
      orderContext={orderContext}
      contextLoading={contextLoading}
      onContactVerified={orderNumber && !orderId ? handleContactVerified : undefined}
    />
  );
}
