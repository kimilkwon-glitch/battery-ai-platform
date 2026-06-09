import { isAdminTestOrderRequestRecord } from "@/lib/admin/admin-test-data-filter";
import { maskPhone } from "@/lib/order-request/order-request-summary";
import {
  ORDER_REQUEST_LAST_KEY,
  ORDER_REQUESTS_LIST_KEY,
  type OrderRequest,
  type OrderRequestAdminMeta,
  type OrderRequestAdminStatus,
  type OrderRequestRecord,
} from "@/types/order-request";

const META_KEY = "battery-manager-order-request-admin-meta-v1" as const;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function defaultAdminStatus(request: OrderRequest): OrderRequestAdminStatus {
  if (request.staffSummary.reviewFlags.length > 0) return "pending_review";
  return "prepared";
}

function loadMetaMap(): Record<string, OrderRequestAdminMeta> {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, OrderRequestAdminMeta>;
  } catch {
    return {};
  }
}

function saveMetaMap(map: Record<string, OrderRequestAdminMeta>): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(META_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function toRecord(request: OrderRequest, meta?: OrderRequestAdminMeta): OrderRequestRecord {
  const adminStatus = meta?.adminStatus ?? defaultAdminStatus(request);
  return {
    ...request,
    adminStatus,
    staffNotes: meta?.staffNotes,
    updatedAt: meta?.updatedAt ?? request.updatedAt,
  };
}

function parseRequest(raw: string): OrderRequest | null {
  try {
    return JSON.parse(raw) as OrderRequest;
  } catch {
    return null;
  }
}

/** 8차 접수 시 목록에 추가 (order-request-storage에서 호출) */
export function appendOrderRequestToList(request: OrderRequest): void {
  if (!isBrowser()) return;
  try {
    const existing = listRawOrderRequests();
    const filtered = existing.filter((r) => r.id !== request.id);
    const next = [request, ...filtered];
    localStorage.setItem(ORDER_REQUESTS_LIST_KEY, JSON.stringify(next));
    const meta = loadMetaMap();
    if (!meta[request.id]) {
      meta[request.id] = {
        adminStatus: defaultAdminStatus(request),
        updatedAt: new Date().toISOString(),
      };
      saveMetaMap(meta);
    }
  } catch {
    /* ignore */
  }
}

function listRawOrderRequests(): OrderRequest[] {
  if (!isBrowser()) return [];
  const out: OrderRequest[] = [];
  const seen = new Set<string>();

  try {
    const listRaw = localStorage.getItem(ORDER_REQUESTS_LIST_KEY);
    if (listRaw) {
      const parsed = JSON.parse(listRaw) as unknown;
      if (Array.isArray(parsed)) {
        for (const row of parsed) {
          if (row && typeof row === "object" && typeof (row as OrderRequest).id === "string") {
            const req = row as OrderRequest;
            if (!seen.has(req.id)) {
              seen.add(req.id);
              out.push(req);
            }
          }
        }
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const lastRaw = localStorage.getItem(ORDER_REQUEST_LAST_KEY);
    if (lastRaw) {
      const last = parseRequest(lastRaw);
      if (last && !seen.has(last.id)) {
        out.unshift(last);
      }
    }
  } catch {
    /* ignore */
  }

  return out.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function listOrderRequestRecords(): OrderRequestRecord[] {
  const meta = loadMetaMap();
  return listRawOrderRequests()
    .map((r) => toRecord(r, meta[r.id]))
    .filter((r) => !isAdminTestOrderRequestRecord(r));
}

export function updateOrderRequestAdminMeta(
  id: string,
  patch: Partial<Pick<OrderRequestAdminMeta, "adminStatus" | "staffNotes">>,
): void {
  const meta = loadMetaMap();
  const prev = meta[id] ?? {
    adminStatus: "prepared" as OrderRequestAdminStatus,
    updatedAt: new Date().toISOString(),
  };
  meta[id] = {
    ...prev,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  saveMetaMap(meta);
}

export function getOrderRequestSummaryStats(records: OrderRequestRecord[]) {
  return {
    total: records.length,
    needsReview: records.filter(
      (r) =>
        r.adminStatus === "pending_review" ||
        r.staffSummary.reviewFlags.length > 0,
    ).length,
    contacted: records.filter((r) => r.adminStatus === "contacted").length,
    usedBatteryReturn: records.filter((r) => r.usedBatteryReturnOption === "return").length,
    visitInstall: records.filter((r) => r.fulfillment.method === "visit_install").length,
  };
}

export { maskPhone, META_KEY };
