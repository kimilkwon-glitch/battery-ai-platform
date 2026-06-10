"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

export function AdminCommerceClaimsClient() {
  const searchParams = useSearchParams();
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
  }) => {
    if (!selectedId) return;
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
    }
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
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <p className="lg:col-span-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-relaxed text-amber-950">
        <strong className="font-black">PG 환불 미연동 안내:</strong> &quot;환불완료 상태로 변경&quot;은
        클레임·주문 <span className="font-black">내부 상태</span>만 바꿉니다. 실제 결제 취소/환불은
        토스페이먼츠 PG 관리자 또는 API 연동 후 별도로 처리해야 합니다. 결제상태는 PG 환불 성공 시에만
        자동으로 환불완료로 바뀝니다.
      </p>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTypeFilter(f.id)}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                typeFilter === f.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}
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
              onClick={() => setStatusFilter(f.id)}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                statusFilter === f.id ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-800"
              }`}
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
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />

        <div className={`${bm.card} overflow-hidden`}>
          {loading ? (
            <p className="p-4 text-xs text-slate-500">목록 불러오는 중…</p>
          ) : items.length === 0 ? (
            <p className="p-4 text-xs text-slate-500">접수된 클레임이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500">
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
                  {items.map((row) => (
                    <tr
                      key={row.id}
                      className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 ${
                        selectedId === row.id ? "bg-blue-50/60" : ""
                      }`}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">{formatDt(row.requestedAt)}</td>
                      <td className="px-3 py-2 font-mono">{row.orderNumber}</td>
                      <td className="px-3 py-2 font-bold">{CLAIM_TYPE_LABELS[row.claimType]}</td>
                      <td className="px-3 py-2">{ADMIN_CLAIM_STATUS_LABELS[row.claimStatus]}</td>
                      <td className="px-3 py-2">{orderStatusLabel(row.orderStatus)}</td>
                      <td className="px-3 py-2">{paymentStatusLabel(row.paymentStatus)}</td>
                      <td className="px-3 py-2">{row.customerName}</td>
                      <td className="px-3 py-2">{row.customerPhone}</td>
                      <td className="px-3 py-2 max-w-[120px] truncate">{row.productName}</td>
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

      <aside className="space-y-3 lg:sticky lg:top-4">
        {!selectedId ? (
          <p className={`${bm.card} ${bm.cardPad} text-xs text-slate-500`}>
            목록에서 요청을 선택하면 상세 처리 화면이 표시됩니다.
          </p>
        ) : detailLoading ? (
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
              <Link
                href={`${ADMIN_ROUTES.orders}?channel=commerce&orderId=${encodeURIComponent(detail.claim.orderId)}`}
                className="font-bold text-blue-700 hover:underline"
              >
                주문 {detail.claim.orderNumber} 보기
              </Link>
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
                    onClick={() => void patchClaim({ claimStatus: a.status, adminMemo, customerReply, assignedTo, needsCustomerNotice: needsNotice })}
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
    </div>
  );
}
