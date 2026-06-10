"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { productIdToPathSegment } from "@/lib/admin/products/product-id";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type {
  AdminProductReviewStatus,
  AdminProductRow,
  AdminProductSaleStatus,
} from "@/types/admin-product";

type Props = {
  row: AdminProductRow;
  onUpdated: (row: AdminProductRow) => void;
};

export function AdminProductInlineEdit({ row, onUpdated }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [internetPrice, setInternetPrice] = useState(row.internetPrice?.toString() ?? "");
  const [onsitePrice, setOnsitePrice] = useState(row.onsitePrice?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/products/${productIdToPathSegment(row.productId)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.ok && data.item) {
        onUpdated(data.item as AdminProductRow);
        setFeedback("저장됨");
        router.refresh();
      } else {
        setFeedback(data.message ?? "저장 실패");
      }
    } catch {
      setFeedback("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const savePrices = async () => {
    await patch({
      internetPrice: internetPrice ? Number(internetPrice.replace(/\D/g, "")) : null,
      onsitePrice: onsitePrice ? Number(onsitePrice.replace(/\D/g, "")) : null,
      reason: "목록 바로수정",
    });
    setEditing(false);
  };

  return (
    <div className="admin-product-inline">
      <div className="admin-cell-price">
        <p className="admin-cell-primary">
          택배 {row.internetPrice != null ? formatPriceWon(row.internetPrice) : "—"}
        </p>
        <p className="admin-cell-muted">
          출장 {row.onsitePrice != null ? formatPriceWon(row.onsitePrice) : "—"}
        </p>
        <p className="admin-cell-muted text-xs">
          매장 {row.fulfillmentPrices.storePickupSelf != null ? formatPriceWon(row.fulfillmentPrices.storePickupSelf) : "—"}
        </p>
        {(row.internetPrice == null || row.onsitePrice == null) && (
          <span className="admin-order-ops-badge admin-order-ops-badge--amber mt-1">가격 누락</span>
        )}
      </div>
      {editing ? (
        <div className="admin-product-inline__form">
          <input
            className="admin-product-inline__input"
            value={internetPrice}
            onChange={(e) => setInternetPrice(e.target.value)}
            placeholder="택배가"
            inputMode="numeric"
          />
          <input
            className="admin-product-inline__input"
            value={onsitePrice}
            onChange={(e) => setOnsitePrice(e.target.value)}
            placeholder="출장가"
            inputMode="numeric"
          />
          <div className="flex gap-1">
            <button
              type="button"
              className="admin-btn admin-btn--primary admin-btn--sm"
              disabled={saving}
              onClick={() => void savePrices()}
            >
              저장
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => setEditing(false)}
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--sm mt-1"
          onClick={() => setEditing(true)}
        >
          바로수정
        </button>
      )}
      {feedback ? <p className="text-xs font-bold text-emerald-700">{feedback}</p> : null}
    </div>
  );
}

export function AdminProductSaleSelect({
  row,
  onUpdated,
}: {
  row: AdminProductRow;
  onUpdated: (row: AdminProductRow) => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  return (
    <select
      className="admin-product-inline__select"
      value={row.saleStatus}
      disabled={saving}
      onChange={(e) => {
        const saleStatus = e.target.value as AdminProductSaleStatus;
        setSaving(true);
        void fetch(`/api/admin/products/${productIdToPathSegment(row.productId)}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ saleStatus, reason: "판매상태 변경" }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.ok && data.item) onUpdated(data.item as AdminProductRow);
            router.refresh();
          })
          .finally(() => setSaving(false));
      }}
    >
      <option value="selling">판매중</option>
      <option value="hidden">숨김</option>
      <option value="stopped">판매중지</option>
    </select>
  );
}

export function AdminProductReviewSelect({
  row,
  onUpdated,
}: {
  row: AdminProductRow;
  onUpdated: (row: AdminProductRow) => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  return (
    <select
      className="admin-product-inline__select"
      value={row.reviewStatus}
      disabled={saving}
      onChange={(e) => {
        const reviewStatusOverride = e.target.value as AdminProductReviewStatus;
        setSaving(true);
        void fetch(`/api/admin/products/${productIdToPathSegment(row.productId)}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviewStatusOverride, reason: "검수상태 변경" }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.ok && data.item) onUpdated(data.item as AdminProductRow);
            router.refresh();
          })
          .finally(() => setSaving(false));
      }}
    >
      <option value="ok">정상</option>
      <option value="needs_review">확인 필요</option>
      <option value="price_missing">가격 누락</option>
      <option value="image_missing">이미지 누락</option>
      <option value="detail_missing">상세 누락</option>
      <option value="notation_check">표기 확인</option>
    </select>
  );
}
