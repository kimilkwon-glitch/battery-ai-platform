/**
 * 주문 클레임 — 개발 전용 JSON fallback (.data/commerce-claims.json)
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  ClaimHistoryRecord,
  ClaimReasonCode,
  ClaimStatus,
  ClaimType,
  CommerceClaimRecord,
  CommerceClaimSummary,
} from "@/types/commerce-claim";
import type { CommerceOrderRecord } from "@/types/commerce-payment";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "commerce-claims.json");

type StorePayload = {
  version: 1;
  claims: CommerceClaimRecord[];
  histories: ClaimHistoryRecord[];
};

const globalCache = globalThis as typeof globalThis & {
  __bmClaimStore?: StorePayload;
};

function emptyPayload(): StorePayload {
  return { version: 1, claims: [], histories: [] };
}

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function loadPayload(): Promise<StorePayload> {
  if (globalCache.__bmClaimStore) return globalCache.__bmClaimStore;
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as StorePayload;
    if (parsed?.version === 1 && Array.isArray(parsed.claims)) {
      globalCache.__bmClaimStore = parsed;
      return parsed;
    }
  } catch {
    /* first run */
  }
  const payload = emptyPayload();
  await savePayload(payload);
  return payload;
}

async function savePayload(payload: StorePayload): Promise<void> {
  globalCache.__bmClaimStore = payload;
  await ensureDataDir();
  await writeFile(STORE_FILE, JSON.stringify(payload, null, 2), "utf8");
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function toSummary(row: CommerceClaimRecord): CommerceClaimSummary {
  return {
    id: row.id,
    orderId: row.orderId,
    orderNumber: row.orderNumber,
    claimType: row.claimType,
    claimStatus: row.claimStatus,
    reasonCode: row.reasonCode,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    productName: row.productName,
    fulfillmentType: row.fulfillmentType,
    orderStatus: row.orderStatus,
    paymentStatus: row.paymentStatus,
    assignedTo: row.assignedTo,
    requestedAt: row.requestedAt,
    updatedAt: row.updatedAt,
  };
}

export type ClaimCreateInput = {
  order: CommerceOrderRecord;
  claimType: ClaimType;
  reasonCode: ClaimReasonCode;
  reasonText?: string;
  customerMessage: string;
  customerName: string;
  customerPhone: string;
  attachmentUrls?: string[];
  estimatedRefundAmount?: number | null;
};

export type ClaimListFilters = {
  claimType?: ClaimType | "all" | null;
  claimStatus?: ClaimStatus | "all" | null;
  q?: string | null;
  orderId?: string | null;
  limit?: number;
};

export async function claimCreate(input: ClaimCreateInput): Promise<CommerceClaimRecord> {
  const payload = await loadPayload();
  const now = new Date().toISOString();
  const order = input.order;
  const row: CommerceClaimRecord = {
    id: newId("clm"),
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    claimType: input.claimType,
    claimStatus: "REQUESTED",
    reasonCode: input.reasonCode,
    reasonText: input.reasonText?.trim() || undefined,
    customerMessage: input.customerMessage.trim(),
    customerName: input.customerName.trim() || order.customerName,
    customerPhone: input.customerPhone.trim() || order.customerPhone,
    attachmentUrls: input.attachmentUrls?.filter(Boolean) ?? [],
    adminMemo: "",
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    productName: order.productName,
    batteryCode: order.batteryCode,
    fulfillmentType: order.fulfillmentType,
    returnBatteryOption: order.returnBatteryOption,
    finalAmount: order.finalAmount,
    deliveryFee: order.deliveryFee,
    promotionDiscountTotal: order.promotionDiscountTotal,
    estimatedRefundAmount: input.estimatedRefundAmount ?? order.finalAmount,
    requestedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  payload.claims.unshift(row);
  payload.histories.unshift({
    id: newId("clh"),
    claimId: row.id,
    previousStatus: null,
    nextStatus: "REQUESTED",
    memo: "고객 요청 접수",
    actorType: "customer",
    actorName: row.customerName,
    createdAt: now,
  });
  await savePayload(payload);
  return row;
}

export async function claimList(filters: ClaimListFilters = {}): Promise<CommerceClaimSummary[]> {
  const payload = await loadPayload();
  let rows = [...payload.claims];
  if (filters.orderId) {
    rows = rows.filter((r) => r.orderId === filters.orderId);
  }
  const type = filters.claimType?.trim();
  if (type && type !== "all") {
    rows = rows.filter((r) => r.claimType === type);
  }
  const status = filters.claimStatus?.trim();
  if (status && status !== "all") {
    rows = rows.filter((r) => r.claimStatus === status);
  }
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    rows = rows.filter((r) => {
      const hay = [
        r.orderNumber,
        r.customerName,
        r.customerPhone,
        r.productName,
        r.batteryCode,
        r.customerMessage,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }
  const limit = filters.limit ?? 500;
  return rows.slice(0, limit).map(toSummary);
}

export async function claimGetById(id: string): Promise<CommerceClaimRecord | null> {
  const payload = await loadPayload();
  return payload.claims.find((c) => c.id === id) ?? null;
}

export async function claimListByOrderId(orderId: string): Promise<CommerceClaimRecord[]> {
  const payload = await loadPayload();
  return payload.claims.filter((c) => c.orderId === orderId);
}

export async function claimListHistories(claimId: string): Promise<ClaimHistoryRecord[]> {
  const payload = await loadPayload();
  return payload.histories
    .filter((h) => h.claimId === claimId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
  const payload = await loadPayload();
  const idx = payload.claims.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  const now = new Date().toISOString();
  const prev = payload.claims[idx]!;
  const next: CommerceClaimRecord = {
    ...prev,
    ...patch,
    updatedAt: now,
  };
  payload.claims[idx] = next;
  if (history) {
    payload.histories.unshift({
      id: newId("clh"),
      claimId: id,
      previousStatus: history.previousStatus,
      nextStatus: history.nextStatus,
      memo: history.memo,
      actorType: history.actorType,
      actorName: history.actorName,
      createdAt: now,
    });
  }
  await savePayload(payload);
  return next;
}

export type ClaimTransitionResult =
  | { ok: true; claim: CommerceClaimRecord; transitioned: boolean }
  | { ok: false; code: string; message: string; status: number; claim?: CommerceClaimRecord };

export async function claimTransitionStatus(
  id: string,
  input: {
    expectedStatuses: ClaimStatus[];
    nextStatus: ClaimStatus;
    patch?: Partial<
      Pick<
        CommerceClaimRecord,
        | "adminMemo"
        | "customerReply"
        | "needsCustomerNotice"
        | "assignedTo"
        | "reviewedAt"
        | "completedAt"
      >
    >;
    history?: {
      previousStatus: ClaimStatus | null;
      nextStatus: ClaimStatus;
      memo?: string;
      actorType: "admin" | "system";
      actorName?: string;
    };
  },
): Promise<ClaimTransitionResult> {
  const payload = await loadPayload();
  const idx = payload.claims.findIndex((c) => c.id === id);
  if (idx < 0) {
    return { ok: false, code: "NOT_FOUND", message: "요청을 찾을 수 없습니다.", status: 404 };
  }
  const prev = payload.claims[idx]!;
  if (prev.claimStatus === input.nextStatus) {
    return { ok: true, claim: prev, transitioned: false };
  }
  if (!input.expectedStatuses.includes(prev.claimStatus)) {
    const refreshed = payload.claims[idx]!;
    if (refreshed.claimStatus === input.nextStatus) {
      return { ok: true, claim: refreshed, transitioned: false };
    }
    return {
      ok: false,
      code: "CLAIM_TRANSITION_CONFLICT",
      message: "다른 관리자가 먼저 처리했거나 상태가 변경되었습니다.",
      status: 409,
      claim: refreshed,
    };
  }
  const now = new Date().toISOString();
  const next: CommerceClaimRecord = {
    ...prev,
    ...input.patch,
    claimStatus: input.nextStatus,
    updatedAt: now,
  };
  payload.claims[idx] = next;
  if (input.history) {
    payload.histories.unshift({
      id: newId("clh"),
      claimId: id,
      previousStatus: input.history.previousStatus,
      nextStatus: input.history.nextStatus,
      memo: input.history.memo,
      actorType: input.history.actorType,
      actorName: input.history.actorName,
      createdAt: now,
    });
  }
  await savePayload(payload);
  return { ok: true, claim: next, transitioned: true };
}

export const CLAIM_STORE_PATH = STORE_FILE;
