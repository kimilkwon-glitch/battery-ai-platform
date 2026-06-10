/**
 * 클레임 저장소 파사드 — DATABASE_URL 시 Postgres, dev만 JSON fallback
 */

import path from "node:path";
import {
  assertOperationalStoreAvailable,
  isOperationalDbMode,
} from "@/lib/db/operational-store-config";
import type {
  ClaimHistoryRecord,
  ClaimStatus,
  CommerceClaimRecord,
  CommerceClaimSummary,
} from "@/types/commerce-claim";

export type { ClaimCreateInput, ClaimListFilters } from "@/lib/claims/claim-store.postgres";

async function getStore() {
  assertOperationalStoreAvailable("claims");
  if (isOperationalDbMode()) return import("@/lib/claims/claim-store.postgres");
  return import("@/lib/claims/claim-store.json");
}

export async function claimCreate(
  input: import("@/lib/claims/claim-store.postgres").ClaimCreateInput,
): Promise<CommerceClaimRecord> {
  return (await getStore()).claimCreate(input);
}

export async function claimList(
  filters: import("@/lib/claims/claim-store.postgres").ClaimListFilters = {},
): Promise<CommerceClaimSummary[]> {
  return (await getStore()).claimList(filters);
}

export async function claimGetById(id: string): Promise<CommerceClaimRecord | null> {
  return (await getStore()).claimGetById(id);
}

export async function claimListByOrderId(orderId: string): Promise<CommerceClaimRecord[]> {
  return (await getStore()).claimListByOrderId(orderId);
}

export async function claimListHistories(claimId: string): Promise<ClaimHistoryRecord[]> {
  return (await getStore()).claimListHistories(claimId);
}

export async function claimUpdate(
  id: string,
  patch: Partial<
    Pick<
      CommerceClaimRecord,
      | "claimStatus"
      | "adminMemo"
      | "customerReply"
      | "needsCustomerNotice"
      | "assignedTo"
      | "reviewedAt"
      | "completedAt"
    >
  >,
  history?: {
    previousStatus: ClaimStatus | null;
    nextStatus: ClaimStatus;
    memo?: string;
    actorType: "admin" | "system";
    actorName?: string;
  },
): Promise<CommerceClaimRecord | null> {
  return (await getStore()).claimUpdate(id, patch, history);
}

export const CLAIM_STORE_PATH = isOperationalDbMode()
  ? null
  : path.join(process.cwd(), ".data", "commerce-claims.json");
