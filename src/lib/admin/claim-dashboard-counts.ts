import type { CommerceClaimRecord, CommerceClaimSummary } from "@/types/commerce-claim";
import type { ClaimStatus, ClaimType } from "@/types/commerce-claim";

type ClaimRow = CommerceClaimRecord | CommerceClaimSummary;

/** 고객이 접수했고 운영자 처리 전 — 요청/처리중 */
export const CLAIM_REQUEST_OPEN_STATUSES = new Set<ClaimStatus>(["REQUESTED", "REVIEWING"]);

/** 진행 중(승인·수거 등) — 요청 카드에는 미포함 */
export const CLAIM_IN_PROGRESS_STATUSES = new Set<ClaimStatus>([
  "APPROVED",
  "RETURN_PICKUP_PENDING",
  "RETURN_RECEIVED",
]);

/** 종료된 클레임 */
export const CLAIM_DONE_STATUSES = new Set<ClaimStatus>(["COMPLETED", "REJECTED", "REFUNDED"]);

export function countClaimsByTypeRequested(claims: ClaimRow[], type: ClaimType): number {
  return claims.filter(
    (c) => c.claimType === type && CLAIM_REQUEST_OPEN_STATUSES.has(c.claimStatus),
  ).length;
}

/** 운영자 답변·안내가 필요한 건 (확인중) */
export function countClaimsNeedingCustomerNotice(claims: ClaimRow[]): number {
  return claims.filter((c) => c.claimStatus === "REVIEWING").length;
}

export function countClaimsCompleted(claims: ClaimRow[]): number {
  return claims.filter((c) => CLAIM_DONE_STATUSES.has(c.claimStatus)).length;
}

export function countReturnExchangeRequested(claims: ClaimRow[]): number {
  return (
    countClaimsByTypeRequested(claims, "RETURN") + countClaimsByTypeRequested(claims, "EXCHANGE")
  );
}

/** 주문 작업대 취소·반품/교환 탭 필터용 */
export function buildClaimWorkbenchContext(claims: ClaimRow[]): {
  cancelRequestOrderIds: Set<string>;
  returnExchangeOrderIds: Set<string>;
} {
  const cancelRequestOrderIds = new Set<string>();
  const returnExchangeOrderIds = new Set<string>();
  for (const c of claims) {
    if (!CLAIM_REQUEST_OPEN_STATUSES.has(c.claimStatus)) continue;
    const orderId = c.orderId?.trim();
    if (!orderId) continue;
    if (c.claimType === "CANCEL") cancelRequestOrderIds.add(orderId);
    if (c.claimType === "RETURN" || c.claimType === "EXCHANGE") {
      returnExchangeOrderIds.add(orderId);
    }
  }
  return { cancelRequestOrderIds, returnExchangeOrderIds };
}
