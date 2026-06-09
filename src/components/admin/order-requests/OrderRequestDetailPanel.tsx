"use client";

import { useCallback, useEffect, useState } from "react";
import { FULFILLMENT_METHOD_LABELS } from "@/data/cart-flow-guide";
import { OrderRequestWorkflowBadge } from "@/components/admin/order-requests/OrderRequestWorkflowBadge";
import {
  ALL_REVIEW_FLAGS,
  REVIEW_FLAG_LABELS,
  WORKFLOW_STATUS_LABELS,
} from "@/lib/order-request/order-request-admin-constants";
import { persistedToOrderRequestRecord } from "@/lib/order-request/order-request-mapper";
import { patchAdminOrderRequest } from "@/lib/order-request/order-request-client-api";
import type {
  OrderRequestRecord,
  OrderRequestReviewFlag,
  OrderRequestWorkflowStatus,
} from "@/types/order-request";
const USED_BATTERY_FORM = {
  return: "반납",
  no_return: "미반납",
  unknown: "상담 시 확인",
} as const;

const WORKFLOW_OPTIONS = (
  Object.keys(WORKFLOW_STATUS_LABELS) as OrderRequestWorkflowStatus[]
).map((value) => ({
  value,
  label: WORKFLOW_STATUS_LABELS[value].label,
}));

export function OrderRequestDetailPanel({
  record,
  detailLoading,
  onRecordChange,
}: {
  record: OrderRequestRecord;
  detailLoading?: boolean;
  onRecordChange: (next: OrderRequestRecord) => void;
}) {
  const fulfillment = FULFILLMENT_METHOD_LABELS[record.fulfillment.method];
  const statusValue = record.workflowStatus ?? "pending_review";
  const [internalMemo, setInternalMemo] = useState(record.staffNotes ?? "");
  const [selectedFlags, setSelectedFlags] = useState<OrderRequestReviewFlag[]>(
    record.reviewFlagKeys ?? [],
  );
  const [statusSaving, setStatusSaving] = useState(false);
  const [memoSaving, setMemoSaving] = useState(false);
  const [flagsSaving, setFlagsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    setInternalMemo(record.staffNotes ?? "");
    setSelectedFlags(record.reviewFlagKeys ?? []);
    setActionError(null);
    setActionSuccess(null);
  }, [record.id, record.staffNotes, record.reviewFlagKeys]);

  const applyRecord = useCallback(
    (patch: Parameters<typeof patchAdminOrderRequest>[1]) => {
      return patchAdminOrderRequest(record.id, patch);
    },
    [record.id],
  );

  const handleStatusChange = async (value: string) => {
    const prevStatus = statusValue;
    const nextStatus = value as OrderRequestWorkflowStatus;
    setStatusSaving(true);
    setActionError(null);
    setActionSuccess(null);

    const optimistic: OrderRequestRecord = {
      ...record,
      workflowStatus: nextStatus,
      adminStatus:
        nextStatus === "closed"
          ? "closed"
          : nextStatus === "canceled"
            ? "canceled"
            : nextStatus === "contacted" ||
                nextStatus === "waiting_customer" ||
                nextStatus === "quoted"
              ? "contacted"
              : "pending_review",
    };
    onRecordChange(optimistic);

    const res = await applyRecord({ status: nextStatus });
    setStatusSaving(false);
    if (res.ok && res.record) {
      onRecordChange(persistedToOrderRequestRecord(res.record));
      setActionSuccess("상태가 저장되었습니다.");
      return;
    }
    onRecordChange({ ...record, workflowStatus: prevStatus });
    setActionError(res.error ?? "상태 변경에 실패했습니다.");
  };

  const handleMemoSave = async () => {
    setMemoSaving(true);
    setActionError(null);
    setActionSuccess(null);
    const res = await applyRecord({ internalMemo: internalMemo.trim() });
    setMemoSaving(false);
    if (res.ok && res.record) {
      onRecordChange(persistedToOrderRequestRecord(res.record));
      setActionSuccess("직원 메모가 저장되었습니다.");
      return;
    }
    setActionError(res.error ?? "메모 저장에 실패했습니다.");
  };

  const handleFlagsSave = async () => {
    setFlagsSaving(true);
    setActionError(null);
    setActionSuccess(null);
    const res = await applyRecord({ reviewFlags: selectedFlags });
    setFlagsSaving(false);
    if (res.ok && res.record) {
      onRecordChange(persistedToOrderRequestRecord(res.record));
      setActionSuccess("확인 플래그가 저장되었습니다.");
      return;
    }
    setActionError(res.error ?? "플래그 저장에 실패했습니다.");
  };

  const toggleFlag = (flag: OrderRequestReviewFlag) => {
    setSelectedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag],
    );
  };

  const regionLine = record.fulfillment.region
    ? `출장 지역: ${record.fulfillment.region}`
    : null;
  const timeLine = record.fulfillment.preferredTime
    ? `희망 시간: ${record.fulfillment.preferredTime}`
    : null;

  return (
    <aside className="admin-panel admin-inquiries__detail">
      <div className="admin-inquiries__detail-inner">
      <div className="admin-inquiries__section flex flex-wrap items-center justify-between gap-2">
        <h2 className="admin-matching__detail-title">요청 상세</h2>
        <OrderRequestWorkflowBadge status={statusValue} />
      </div>
      {record.requestNumber ? (
        <p className="font-mono text-xs font-black text-blue-800">
          접수번호: {record.requestNumber}
        </p>
      ) : (
        <p className="font-mono text-[10px] text-slate-400">{record.id}</p>
      )}
      <p className="text-[11px] text-slate-500">
        접수일: {new Date(record.createdAt).toLocaleString("ko-KR")}
        {detailLoading ? " · 상세 불러오는 중…" : null}
      </p>

      {actionError ? (
        <p className="text-xs font-bold text-red-700" role="alert">
          {actionError}
        </p>
      ) : null}
      {actionSuccess ? (
        <p className="text-xs font-bold text-emerald-800" role="status">
          {actionSuccess}
        </p>
      ) : null}

      <section className="space-y-2 text-xs">
        <h3 className="font-black text-slate-800">고객 정보</h3>
        <p className="font-medium text-slate-700">
          {record.customer.name || "(이름 미입력)"}
        </p>
        <p className="font-medium text-slate-700">{record.customer.phone}</p>
        {record.customer.email ? (
          <p className="text-slate-600">{record.customer.email}</p>
        ) : null}
      </section>

      {record.items.length > 0 ? (
        <section className="space-y-2 text-xs">
          <h3 className="font-black text-slate-800">주문 상품</h3>
          <ul className="space-y-2">
            {record.items.map((item) => (
              <li key={item.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="font-black text-slate-900">
                  {item.productName || "배터리 상품"} · {item.batterySpec}
                </p>
                <p className="text-slate-600">수량 {item.quantity}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : detailLoading ? (
        <p className="text-xs text-slate-500">상품 정보를 불러오는 중…</p>
      ) : null}

      <section className="space-y-1 text-xs">
        <h3 className="font-black text-slate-800">차량</h3>
        <p className="font-medium text-slate-700">{record.staffSummary.vehicleLine}</p>
        {record.vehicle?.currentBatterySpec ? (
          <p className="text-slate-600">현재 규격: {record.vehicle.currentBatterySpec}</p>
        ) : null}
      </section>

      <section className="space-y-1 text-xs">
        <h3 className="font-black text-slate-800">폐전지</h3>
        <p className="font-medium">{USED_BATTERY_FORM[record.usedBatteryReturnOption]}</p>
      </section>

      <section className="space-y-1 text-xs">
        <h3 className="font-black text-slate-800">수령·설치</h3>
        <p className="font-medium">{fulfillment}</p>
        {record.staffSummary.storeOrRegionLine ? (
          <p className="text-slate-600">{record.staffSummary.storeOrRegionLine}</p>
        ) : null}
        {regionLine ? <p className="text-slate-600">{regionLine}</p> : null}
        {timeLine ? <p className="text-slate-600">{timeLine}</p> : null}
      </section>

      {record.memo ? (
        <section className="text-xs">
          <h3 className="font-black text-slate-800">고객 요청사항</h3>
          <p className="mt-1 whitespace-pre-wrap font-medium text-slate-700">{record.memo}</p>
        </section>
      ) : null}

      <section className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs space-y-2">
        <h3 className="font-black text-amber-950">확인 필요 플래그</h3>
        <ul className="space-y-1.5">
          {ALL_REVIEW_FLAGS.map((flag) => (
            <li key={flag}>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-amber-700"
                  checked={selectedFlags.includes(flag)}
                  onChange={() => toggleFlag(flag)}
                />
                <span className="font-bold text-amber-950">{REVIEW_FLAG_LABELS[flag]}</span>
              </label>
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled={flagsSaving}
          onClick={() => void handleFlagsSave()}
          className="admin-btn admin-btn--secondary admin-btn--md w-full disabled:opacity-50"
        >
          {flagsSaving ? "저장 중…" : "플래그 저장"}
        </button>
      </section>

      <section className="space-y-2">
        <label className="block text-xs font-black text-slate-800">
          상태 변경
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-bold"
            value={statusValue}
            disabled={statusSaving}
            onChange={(e) => void handleStatusChange(e.target.value)}
          >
            {WORKFLOW_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <p className="text-[10px] font-medium text-slate-500">
          상태 변경 시 고객에게 자동 문자·알림이 발송되지 않습니다.
        </p>

        <div className="space-y-1">
          <label className="block text-xs font-black text-slate-800">직원 메모</label>
          <p className="text-[10px] font-medium text-slate-500">
            직원 메모는 관리자 확인용이며 고객 화면에는 표시되지 않습니다.
          </p>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-medium"
            value={internalMemo}
            onChange={(e) => setInternalMemo(e.target.value)}
            placeholder="연락 내용, 확인 사항 등"
          />
          <button
            type="button"
            disabled={memoSaving}
            onClick={() => void handleMemoSave()}
            className="admin-btn admin-btn--primary admin-btn--md w-full disabled:opacity-50"
          >
            {memoSaving ? "저장 중…" : "메모 저장"}
          </button>
        </div>
      </section>
      </div>
    </aside>
  );
}
