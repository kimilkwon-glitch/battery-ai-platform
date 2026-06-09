"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  actionButtonLabel,
  getClaimUiConfig,
  type ClaimUiAction,
} from "@/lib/claims/claim-eligibility";
import { OrderClaimFormModal } from "@/components/orders/OrderClaimFormModal";
import { LEGAL_SHIPPING_RETURNS_PAGE } from "@/lib/legal/legal-routes";
import {
  CLAIM_STATUS_LABELS,
  CLAIM_TYPE_LABELS,
  type ClaimStatus,
  type ClaimType,
} from "@/types/commerce-claim";
import "@/styles/order-claim.css";

type OrderSnapshot = {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  customerName: string;
  customerPhone: string;
  finalAmount: number | null;
  deliveryFee?: number;
  promotionDiscountTotal?: number;
  returnBatteryOption?: string;
  batteryReturnFee?: number;
};

type PublicClaim = {
  id: string;
  claimType: ClaimType;
  claimStatus: ClaimStatus;
  customerReply?: string;
  requestedAt: string;
};

type Props = {
  order: OrderSnapshot;
};

export function OrderClaimActions({ order }: Props) {
  const ui = getClaimUiConfig(order.orderStatus);
  const [claims, setClaims] = useState<PublicClaim[]>([]);
  const [modalAction, setModalAction] = useState<ClaimUiAction | null>(null);

  const loadClaims = useCallback(async () => {
    const res = await fetch(`/api/orders/claims?orderId=${encodeURIComponent(order.orderId)}`, {
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.ok) setClaims(data.claims ?? []);
  }, [order.orderId]);

  useEffect(() => {
    void loadClaims();
  }, [loadClaims]);

  if (ui.showCompletedOnly) {
    const latest = claims[0];
    if (!latest) return null;
    return (
      <div className="order-claim-actions" data-order-claim-actions>
        <p className="order-claim-actions__hint">
          {CLAIM_TYPE_LABELS[latest.claimType]} · {CLAIM_STATUS_LABELS[latest.claimStatus]}
        </p>
        {latest.customerReply ? (
          <p className="order-claim-status-list">안내: {latest.customerReply}</p>
        ) : null}
      </div>
    );
  }

  if (ui.actions.length === 0) return null;

  const activeClaim = claims.find((c) => !["COMPLETED", "REJECTED", "REFUNDED"].includes(c.claimStatus));

  return (
    <div className="order-claim-actions" data-order-claim-actions>
      {ui.policyNote ? <p className="order-claim-actions__note">{ui.policyNote}</p> : null}
      {ui.hint ? <p className="order-claim-actions__hint">{ui.hint}</p> : null}

      {activeClaim ? (
        <p className="order-claim-status-list">
          접수된 {CLAIM_TYPE_LABELS[activeClaim.claimType]} — {CLAIM_STATUS_LABELS[activeClaim.claimStatus]}
          {activeClaim.customerReply ? ` · ${activeClaim.customerReply}` : ""}
        </p>
      ) : (
        <div className="order-claim-actions__btns">
          {ui.actions.map((action) => (
            <button
              key={action}
              type="button"
              className={`order-claim-actions__btn ${action === "cancel_request" ? "order-claim-actions__btn--primary" : ""}`}
              onClick={() => setModalAction(action)}
            >
              {actionButtonLabel(action)}
            </button>
          ))}
        </div>
      )}

      <p className="order-claim-actions__note mt-2">
        <Link href={LEGAL_SHIPPING_RETURNS_PAGE} className="font-bold text-blue-700 hover:underline">
          배송·반품·환불 기준
        </Link>
      </p>

      {modalAction ? (
        <OrderClaimFormModal
          open
          action={modalAction}
          order={order}
          onClose={() => setModalAction(null)}
          onSubmitted={() => {
            setModalAction(null);
            void loadClaims();
          }}
        />
      ) : null}
    </div>
  );
}
