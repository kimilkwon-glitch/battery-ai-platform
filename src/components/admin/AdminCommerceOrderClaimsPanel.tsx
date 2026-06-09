"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import {
  CLAIM_REASON_LABELS,
  CLAIM_STATUS_LABELS,
  CLAIM_TYPE_LABELS,
  type CommerceClaimRecord,
} from "@/types/commerce-claim";
import { bm } from "@/lib/design-tokens";

type Props = {
  orderId: string;
};

export function AdminCommerceOrderClaimsPanel({ orderId }: Props) {
  const [claims, setClaims] = useState<CommerceClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/commerce-claims?orderId=${encodeURIComponent(orderId)}`, {
      credentials: "include",
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.ok) {
      setClaims((data.claims ?? data.items ?? []) as CommerceClaimRecord[]);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <section className={`${bm.card} ${bm.cardPad} text-xs font-medium text-slate-500`}>
        클레임 불러오는 중…
      </section>
    );
  }

  if (claims.length === 0) {
    return (
      <section className={`${bm.card} ${bm.cardPad} text-xs font-medium text-slate-500`}>
        접수된 취소/반품/환불 요청이 없습니다.
      </section>
    );
  }

  return (
    <section className={`${bm.card} ${bm.cardPad} space-y-3 border-amber-200 bg-amber-50/30`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-amber-950">취소/반품/환불 요청</h3>
        <Link
          href={ADMIN_ROUTES.commerceClaims}
          className="text-[11px] font-bold text-blue-700 hover:underline"
        >
          클레임 관리
        </Link>
      </div>
      {claims.map((claim) => (
        <article
          key={claim.id}
          className="rounded-xl border border-amber-100 bg-white p-3 text-xs shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-black text-amber-900">
              {CLAIM_TYPE_LABELS[claim.claimType]}
            </span>
            <span className="font-bold text-slate-700">{CLAIM_STATUS_LABELS[claim.claimStatus]}</span>
            {claim.needsCustomerNotice ? (
              <span className="rounded bg-red-100 px-1.5 py-0.5 font-bold text-red-800">고객 안내 필요</span>
            ) : null}
          </div>
          <p className="mt-2 font-medium text-slate-600">
            사유: {CLAIM_REASON_LABELS[claim.reasonCode]} · {claim.customerMessage.slice(0, 80)}
            {claim.customerMessage.length > 80 ? "…" : ""}
          </p>
          <Link
            href={`${ADMIN_ROUTES.commerceClaims}?claimId=${encodeURIComponent(claim.id)}`}
            className="mt-2 inline-block font-bold text-blue-700 hover:underline"
          >
            상세 처리
          </Link>
        </article>
      ))}
    </section>
  );
}
