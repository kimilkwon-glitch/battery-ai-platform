"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminOrderDetailModal, AdminOrderNumberButton } from "@/components/admin/AdminOrderDetailModal";
import { AdminDangerActionDialog } from "@/components/admin/AdminDangerActionDialog";
import type { AdminDangerActionConfig } from "@/components/admin/AdminDangerActionDialog";
import {
  commerceOrderToDangerSummary,
  dangerConfigClaimApproved,
  dangerConfigClaimRefunded,
  dangerConfigClaimRejected,
} from "@/lib/admin/admin-danger-action-presets";
import { isAdminTestCommerceOrder } from "@/lib/admin/admin-test-data-filter";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { fulfillmentTypeLabel, orderStatusLabel, paymentStatusLabel } from "@/lib/orders/commerce-order-mine";
import { claimRefundPolicyLines } from "@/lib/claims/claim-refund-estimate";
import { returnBatteryLabel } from "@/lib/payment/commerce-order-admin-mapper";
import { bm } from "@/lib/design-tokens";
import {
  ADMIN_CLAIM_STATUS_ACTIONS,
  ADMIN_CLAIM_STATUS_LABELS,
  CLAIM_REASON_LABELS,
  CLAIM_TYPE_LABELS,
  type ClaimHistoryRecord,
  type ClaimStatus,
  type ClaimType,
  type CommerceClaimRecord,
  type CommerceClaimSummary,
} from "@/types/commerce-claim";
import type { CommerceOrderRecord } from "@/types/commerce-payment";
import { CLAIM_REQUEST_OPEN_STATUSES } from "@/lib/admin/claim-dashboard-counts";

const TYPE_FILTERS: { id: ClaimType | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "CANCEL", label: "취소" },
  { id: "RETURN", label: "반품" },
  { id: "REFUND", label: "환불" },
  { id: "EXCHANGE", label: "교환" },
  { id: "OTHER", label: "기타" },
];

const STATUS_FILTERS: { id: ClaimStatus | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  ...ADMIN_CLAIM_STATUS_ACTIONS.map((a) => ({ id: a.status, label: ADMIN_CLAIM_STATUS_LABELS[a.status] })),
];

function formatDt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatAmount(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${n.toLocaleString("ko-KR")}원`;
}

function parseClaimType(raw: string | null): ClaimType | "all" {
  const allowed: ClaimType[] = ["CANCEL", "RETURN", "REFUND", "EXCHANGE", "OTHER"];
  if (raw && allowed.includes(raw as ClaimType)) return raw as ClaimType;
  return "all";
}

function parseClaimStatus(raw: string | null): ClaimStatus | "all" {
  const allowed: ClaimStatus[] = [
    "REQUESTED",
    "REVIEWING",
    "APPROVED",
    "REJECTED",
    "RETURN_PICKUP_PENDING",
    "RETURN_RECEIVED",
    "REFUNDED",
    "COMPLETED",
  ];
  if (raw && allowed.includes(raw as ClaimStatus)) return raw as ClaimStatus;
  return "all";
}

function parseClaimFilter(raw: string | null): "all" | "open" | "refund_required" {
  if (raw === "open" || raw === "refund_required") return raw;
  return "all";
}

function matchesDashboardClaimFilter(
  row: CommerceClaimSummary,
  filter: "all" | "open" | "refund_required",
): boolean {
  if (filter === "all") return true;
  if (filter === "open") {
    return CLAIM_REQUEST_OPEN_STATUSES.has(row.claimStatus);
  }
  return (
    row.claimType === "REFUND" &&
    (CLAIM_REQUEST_OPEN_STATUSES.has(row.claimStatus) || row.claimStatus === "APPROVED")
  );
}

export function AdminCommerceClaimsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialClaimId = searchParams.get("claimId")?.trim() ?? "";
  const initialQuery = searchParams.get("q")?.trim() || searchParams.get("query")?.trim() || "";

  const [items, setItems] = useState<CommerceClaimSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<ClaimType | "all">(
    parseClaimType(searchParams.get("type")),
  );
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "all">(
    parseClaimStatus(searchParams.get("status")),
  );
  const [dashboardFilter, setDashboardFilter] = useState<"all" | "open" | "refund_required">(
    parseClaimFilter(searchParams.get("filter")),
  );
  const [query, setQuery] = useState(initialQuery);
  const [selectedId, setSelectedId] = useState<string | null>(initialClaimId || null);
  const [detail, setDetail] = useState<{
    claim: CommerceClaimRecord;
    histories: ClaimHistoryRecord[];
    order: CommerceOrderRecord | null;
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [adminMemo, setAdminMemo] = useState("");
  const [customerReply, setCustomerReply] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [needsNotice, setNeedsNotice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dataScope, setDataScope] = useState<"production" | "test" | "all">("production");
  const [orderModalId, setOrderModalId] = useState<string | null>(null);
  const [dangerConfig, setDangerConfig] = useState<AdminDangerActionConfig | null>(null);
  const [dangerError, setDangerError] = useState<string | null>(null);
  const [pendingClaimPatch, setPendingClaimPatch] = useState<{
    claimStatus: ClaimStatus;
    adminMemo?: string;
    customerReply?: string;
  } | null>(null);

  const DANGER_CLAIM_STATUSES = new Set<ClaimStatus>(["APPROVED", "REJECTED", "REFUNDED"]);

  const scopedItems = useMemo(() => {
    let list = items;
    if (dataScope === "all") {
      list = items;
    } else {
      const isTest = (row: CommerceClaimSummary) =>
        isAdminTestCommerceOrder({
          customerName: row.customerName,
          customerPhone: row.customerPhone,
          orderNumber: row.orderNumber,
          productName: row.productName,
        });
      list = dataScope === "test" ? items.filter(isTest) : items.filter((row) => !isTest(row));
    }
    if (dashboardFilter !== "all") {
      list = list.filter((row) => matchesDashboardClaimFilter(row, dashboardFilter));
    }
    return list;
  }, [items, dataScope, dashboardFilter]);

  const syncUrl = useCallback(
    (patch: {
      type?: ClaimType | "all";
      status?: ClaimStatus | "all";
      filter?: "all" | "open" | "refund_required";
      q?: string;
      claimId?: string | null;
    }) => {
      const p = new URLSearchParams(searchParams.toString());
      const type = patch.type ?? typeFilter;
      const status = patch.status ?? statusFilter;
      const filter = patch.filter ?? dashboardFilter;
      const q = patch.q ?? query;

      if (type === "all") p.delete("type");
      else p.set("type", type);
      if (status === "all") p.delete("status");
      else p.set("status", status);
      if (filter === "all") p.delete("filter");
      else p.set("filter", filter);
      if (q.trim()) p.set("q", q.trim());
      else p.delete("q");
      if (patch.claimId === null) p.delete("claimId");
      else if (patch.claimId) p.set("claimId", patch.claimId);

      router.replace(`${ADMIN_ROUTES.commerceClaims}?${p.toString()}`);
    },
    [searchParams, router, typeFilter, statusFilter, dashboardFilter, query],
  );

  const loadList = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (query.trim()) params.set("q", query.trim());
    const res = await fetch(`/api/admin/commerce-claims?${params}`, { credentials: "include" });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.ok) setItems(data.items ?? []);
  }, [typeFilter, statusFilter, query]);

  const loadDetail = useCallback(async (claimId: string) => {
    setDetailLoading(true);
    const res = await fetch(`/api/admin/commerce-claims/${claimId}`, { credentials: "include" });
    const data = await res.json();
    setDetailLoading(false);
    if (res.ok && data.ok) {
      setDetail({
        claim: data.claim,
        histories: data.histories ?? [],
        order: data.order ?? null,
      });
      setAdminMemo(data.claim.adminMemo ?? "");
      setCustomerReply(data.claim.customerReply ?? "");
      setAssignedTo(data.claim.assignedTo ?? "");
      setNeedsNotice(Boolean(data.claim.needsCustomerNotice));
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId);
    else setDetail(null);
  }, [selectedId, loadDetail]);

  useEffect(() => {
    if (initialClaimId) setSelectedId(initialClaimId);
  }, [initialClaimId]);

  const patchClaim = async (patch: {
    claimStatus?: ClaimStatus;
    adminMemo?: string;
    customerReply?: string;
    needsCustomerNotice?: boolean;
    assignedTo?: string;
  }): Promise<boolean> => {
    if (!selectedId) return false;
    setSaving(true);
    const res = await fetch(`/api/admin/commerce-claims/${selectedId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok && data.ok) {
      setDetail({
        claim: data.claim,
        histories: data.histories ?? [],
        order: detail?.order ?? null,
      });
      void loadList();
      return true;
    }
    setDangerError(data.message ?? "저장에 실패했습니다.");
    return false;
  };

  const openClaimDanger = (status: ClaimStatus, label: string) => {
    if (!detail?.order) return;
    setDangerError(null);
    const summary = commerceOrderToDangerSummary(detail.order);
    let config: AdminDangerActionConfig;
    if (status === "REFUNDED") {
      config = dangerConfigClaimRefunded(summary, detail.claim.estimatedRefundAmount);
    } else if (status === "REJECTED") {
      config = dangerConfigClaimRejected(summary);
    } else if (status === "APPROVED") {
      config = dangerConfigClaimApproved(summary, detail.claim.claimType);
    } else {
      config = dangerConfigClaimApproved(summary, detail.claim.claimType);
    }
    setDangerConfig(config);
    setPendingClaimPatch({ claimStatus: status });
  };

  const handleClaimStatusClick = (status: ClaimStatus, label: string) => {
    if (DANGER_CLAIM_STATUSES.has(status)) {
      openClaimDanger(status, label);
      return;
    }
    void patchClaim({
      claimStatus: status,
      adminMemo,
      customerReply,
      assignedTo,
      needsCustomerNotice: needsNotice,
    });
  };

  const saveMemo = () => {
    void patchClaim({
      adminMemo,
      customerReply,
      assignedTo,
      needsCustomerNotice: needsNotice,
    });
  };

  return (
    <div className={`admin-claims-layout admin-claims-layout--workspace ${selectedId ? "has-detail" : "no-detail"}`}>
      <div className="admin-claims-layout__notice admin-workspace-notice admin-workspace-notice--claims">
        <p className="admin-workspace-notice__title">PG 환불 연동 안내</p>
        <p className="admin-workspace-notice__text">
          클레임 상태를 환불완료로 변경해도 실제 Toss 결제 취소·환불은 자동 처리되지 않습니다. 실제
          결제 취소·환불은 Toss 관리자 또는 결제 API 연동 후 별도로 처리해야 합니다.
        </p>
        <p className="admin-workspace-notice__sub">
          결제상태는 PG 환불 성공 시에만 환불완료로 변경됩니다.
        </p>
      </div>
      <div className="admin-claims-layout__main space-y-4">
        <label className="admin-claims-layout__scope inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          데이터 범위
          <select
            value={dataScope}
            onChange={(e) => setDataScope(e.target.value as "production" | "test" | "all")}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          >
            <option value="production">실제 클레임</option>
            <option value="test">테스트/UX2</option>
            <option value="all">전체</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setTypeFilter(f.id);
                setDashboardFilter("all");
                syncUrl({ type: f.id, filter: "all" });
              }}
              className={`admin-claims-filter-pill ${typeFilter === f.id ? "is-active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setStatusFilter(f.id);
                setDashboardFilter("all");
                syncUrl({ status: f.id, filter: "all" });
              }}
              className={`admin-claims-filter-pill admin-claims-filter-pill--status ${statusFilter === f.id ? "is-active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="주문번호, 고객명, 연락처, 상품명 검색"
          className="admin-claims-layout__search w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
        />

        <div className={`${bm.card} overflow-hidden`}>
          {loading ? (
            <p className="p-4 text-xs text-slate-500">목록 불러오는 중…</p>
          ) : scopedItems.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">접수된 클레임이 없습니다.</p>
          ) : (
            <div className="admin-data-table__wrap overflow-x-auto">
              <table className="admin-table admin-claims-table w-full min-w-[1040px] text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-2">요청일</th>
                    <th className="px-3 py-2">주문번호</th>
                    <th className="px-3 py-2">요청유형</th>
                    <th className="px-3 py-2">처리상태</th>
                    <th className="px-3 py-2">주문상태</th>
                    <th className="px-3 py-2">결제상태</th>
                    <th className="px-3 py-2">고객명</th>
                    <th className="px-3 py-2">연락처</th>
                    <th className="px-3 py-2">상품명</th>
                    <th className="px-3 py-2">수령방식</th>
                    <th className="px-3 py-2">요청사유</th>
                    <th className="px-3 py-2">담당자</th>
                    <th className="px-3 py-2">업데이트</th>
                  </tr>
                </thead>
                <tbody>
                  {scopedItems.map((row) => (
                    <tr
                      key={row.id}
                      className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 ${
                        selectedId === row.id ? "bg-blue-50/60" : ""
                      }`}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td className="whitespace-nowrap">{formatDt(row.requestedAt)}</td>
                      <td className="admin-table__mono" onClick={(e) => e.stopPropagation()}>
                        <AdminOrderNumberButton
                          orderId={row.orderId}
                          orderNumber={row.orderNumber}
                          onOpen={setOrderModalId}
                        />
                      </td>
                      <td className="font-bold">{CLAIM_TYPE_LABELS[row.claimType]}</td>
                      <td>
                        <span className="admin-order-status-badge">{ADMIN_CLAIM_STATUS_LABELS[row.claimStatus]}</span>
                      </td>
                      <td>{orderStatusLabel(row.orderStatus)}</td>
                      <td>{paymentStatusLabel(row.paymentStatus)}</td>
                      <td className="admin-table__customer-name">{row.customerName}</td>
                      <td className="admin-table__customer-phone">{row.customerPhone}</td>
                      <td className="admin-table__product-name max-w-[14rem]">{row.productName}</td>
                      <td className="px-3 py-2">{fulfillmentTypeLabel(row.fulfillmentType)}</td>
                      <td className="px-3 py-2">{CLAIM_REASON_LABELS[row.reasonCode]}</td>
                      <td className="px-3 py-2">{row.assignedTo ?? "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatDt(row.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedId ? (
      <aside className="admin-claims-layout__detail space-y-3 lg:sticky lg:top-4">
        {detailLoading ? (
          <p className={`${bm.card} ${bm.cardPad} text-xs text-slate-500`}>상세 불러오는 중…</p>
        ) : detail ? (
          <>
            <section className={`${bm.card} ${bm.cardPad} space-y-2 text-xs`}>
              <h3 className="font-black text-slate-900">요청 상세</h3>
              <p>
                <span className="font-bold text-slate-500">유형 </span>
                {CLAIM_TYPE_LABELS[detail.claim.claimType]} ·{" "}
                {ADMIN_CLAIM_STATUS_LABELS[detail.claim.claimStatus]}
              </p>
              <p>
                <span className="font-bold text-slate-500">사유 </span>
                {CLAIM_REASON_LABELS[detail.claim.reasonCode]}
              </p>
              <p className="rounded-lg bg-slate-50 p-2 font-medium text-slate-800">
                {detail.claim.customerMessage}
              </p>
              {detail.claim.attachmentUrls.length > 0 ? (
                <ul className="space-y-1">
                  {detail.claim.attachmentUrls.map((url) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                        첨부 이미지
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p>
                <span className="font-bold text-slate-500">주문번호 </span>
                <AdminOrderNumberButton
                  orderId={detail.claim.orderId}
                  orderNumber={detail.claim.orderNumber}
                  onOpen={setOrderModalId}
                />
                <Link
                  href={`${ADMIN_ROUTES.orders}?channel=commerce&orderId=${encodeURIComponent(detail.claim.orderId)}`}
                  className="ml-2 text-[11px] font-bold text-slate-500 hover:text-blue-700 hover:underline"
                >
                  주문 작업대에서 열기
                </Link>
              </p>
            </section>

            {detail.order ? (
              <section className={`${bm.card} ${bm.cardPad} space-y-2 text-xs`}>
                <h3 className="font-black text-slate-900">주문·결제</h3>
                <p>
                  {detail.order.customerName} · {detail.order.customerPhone}
                </p>
                <p>
                  {detail.order.productName} ({detail.order.batteryCode})
                </p>
                <p>수령: {fulfillmentTypeLabel(detail.order.fulfillmentType)}</p>
                <p>폐배터리: {returnBatteryLabel(detail.order.returnBatteryOption)}</p>
                <p>결제금액: {formatAmount(detail.order.finalAmount)}</p>
                <p>환불 예상: {formatAmount(detail.claim.estimatedRefundAmount)}</p>
                <div className="rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600">
                  {claimRefundPolicyLines(detail.order).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </section>
            ) : null}

            <section className={`${bm.card} ${bm.cardPad} space-y-2`}>
              <h3 className="text-xs font-black text-slate-900">처리</h3>
              <div className="flex flex-wrap gap-1.5">
                {ADMIN_CLAIM_STATUS_ACTIONS.map((a) => (
                  <button
                    key={a.status}
                    type="button"
                    disabled={saving || detail.claim.claimStatus === a.status}
                    title={a.hint}
                    onClick={() => handleClaimStatusClick(a.status, a.label)}
                    className={`rounded-lg border px-2 py-1 text-[11px] font-bold hover:bg-slate-50 disabled:opacity-40 ${
                      a.status === "REFUNDED"
                        ? "border-amber-300 bg-amber-50 text-amber-950"
                        : "border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              {detail.claim.claimStatus === "REFUNDED" ? (
                <p className="text-[11px] font-semibold leading-relaxed text-amber-800">
                  내부 환불완료 표시 상태입니다. 실제 PG 환불 여부는 결제상태·PG 관리자에서 별도
                  확인하세요.
                </p>
              ) : null}
              <label className="flex items-center gap-2 text-xs font-bold text-red-800">
                <input
                  type="checkbox"
                  checked={needsNotice}
                  onChange={(e) => setNeedsNotice(e.target.checked)}
                />
                고객에게 안내 필요
              </label>
              <label className="block text-xs font-bold text-slate-700">
                처리 담당자
                <input
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                고객 안내 (고객 화면 노출)
                <textarea
                  value={customerReply}
                  onChange={(e) => setCustomerReply(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                내부 메모
                <textarea
                  value={adminMemo}
                  onChange={(e) => setAdminMemo(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                />
              </label>
              <button
                type="button"
                disabled={saving}
                onClick={saveMemo}
                className={`${bm.btnNavy} w-full justify-center text-xs`}
              >
                메모·담당자 저장
              </button>
            </section>

            <section className={`${bm.card} ${bm.cardPad} space-y-2 text-xs`}>
              <h3 className="font-black text-slate-900">처리 이력</h3>
              {detail.histories.length === 0 ? (
                <p className="text-slate-500">이력 없음</p>
              ) : (
                <ul className="space-y-2">
                  {detail.histories.map((h) => (
                    <li key={h.id} className="rounded-lg bg-slate-50 p-2">
                      <p className="font-bold text-slate-800">
                        {h.previousStatus ? ADMIN_CLAIM_STATUS_LABELS[h.previousStatus] : "—"} →{" "}
                        {ADMIN_CLAIM_STATUS_LABELS[h.nextStatus]}
                      </p>
                      <p className="text-slate-600">
                        {formatDt(h.createdAt)} · {h.actorName ?? h.actorType}
                        {h.memo ? ` · ${h.memo}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </aside>
      ) : null}

      <AdminOrderDetailModal orderId={orderModalId} onClose={() => setOrderModalId(null)} />

      <AdminDangerActionDialog
        open={Boolean(dangerConfig && pendingClaimPatch)}
        config={dangerConfig}
        loading={saving}
        error={dangerError}
        onClose={() => {
          if (saving) return;
          setDangerConfig(null);
          setPendingClaimPatch(null);
          setDangerError(null);
        }}
        onConfirm={async (reason) => {
          if (!pendingClaimPatch) return;
          const patch = {
            claimStatus: pendingClaimPatch.claimStatus,
            adminMemo: reason ? `${adminMemo ? `${adminMemo}\n` : ""}${reason}` : adminMemo,
            customerReply:
              pendingClaimPatch.claimStatus === "REJECTED" && reason ? reason : customerReply,
            assignedTo,
            needsCustomerNotice: needsNotice,
          };
          const ok = await patchClaim(patch);
          if (ok) {
            setDangerConfig(null);
            setPendingClaimPatch(null);
          }
        }}
      />
    </div>
  );
}
