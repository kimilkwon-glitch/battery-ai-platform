"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminMobileCard } from "@/components/admin/AdminMobileCard";
import {
  AdminDataTableClient,
  type AdminTableColumn,
  type AdminTableFilter,
  type AdminTableStatusTab,
} from "@/components/admin/AdminDataTableClient";
import {
  AdminProductInlineEdit,
  AdminProductReviewSelect,
  AdminProductSaleSelect,
} from "@/components/admin/AdminProductInlineEdit";
import { AdminCustomerPreviewLink } from "@/components/admin/AdminCustomerPreviewLink";
import { ADMIN_EMPTY_LIST_MESSAGE } from "@/lib/admin/admin-display-labels";
import { productIdToPathSegment } from "@/lib/admin/products/product-id";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type { AdminProductRow } from "@/types/admin-product";

function priceCell(v: number | null): string {
  return v == null ? "—" : formatPriceWon(v);
}

const BRAND_OPTIONS = [
  { value: "rocket", label: "로케트" },
  { value: "solite", label: "쏠라이트" },
  { value: "delco", label: "델코" },
  { value: "atlas", label: "아트라스" },
];

const REVIEW_OPTIONS = [
  { value: "price_missing", label: "가격 누락" },
  { value: "image_missing", label: "이미지 누락" },
  { value: "detail_missing", label: "상세 누락" },
  { value: "notation_check", label: "표기 확인" },
  { value: "needs_review", label: "확인 필요" },
];

const REVIEW_TO_TAB: Record<string, string> = {
  price_missing: "price_missing",
  image_missing: "image_missing",
  detail_missing: "detail_missing",
  needs_review: "needs_review",
};

export function AdminProductsTable({ rows: initialRows }: { rows: AdminProductRow[] }) {
  const searchParams = useSearchParams();
  const reviewParam = searchParams.get("review");
  const initialStatusTab = reviewParam && REVIEW_TO_TAB[reviewParam] ? REVIEW_TO_TAB[reviewParam] : "all";
  const [rows, setRows] = useState(initialRows);

  const updateRow = (updated: AdminProductRow) => {
    setRows((prev) => prev.map((r) => (r.productId === updated.productId ? updated : r)));
  };

  const initialValues = useMemo((): Record<string, string> => {
    if (reviewParam === "price_missing") return { missingPrice: "yes" };
    if (reviewParam === "image_missing") return { missingImage: "yes" };
    if (reviewParam === "detail_missing") return { missingDetail: "yes" };
    if (reviewParam && REVIEW_TO_TAB[reviewParam]) return { reviewStatus: reviewParam };
    return {};
  }, [reviewParam]);

  const statusTabs: AdminTableStatusTab<AdminProductRow>[] = [
    { id: "all", label: "전체", match: () => true },
    { id: "selling", label: "판매중", match: (r) => r.saleStatus === "selling" },
    { id: "inactive", label: "비활성", match: (r) => r.saleStatus !== "selling" },
    {
      id: "price_missing",
      label: "가격 누락",
      tone: "danger",
      match: (r) => r.internetPrice == null || r.onsitePrice == null,
    },
    {
      id: "image_missing",
      label: "이미지 누락",
      tone: "warning",
      match: (r) => !r.hasHeroImage,
    },
    {
      id: "detail_missing",
      label: "상세 누락",
      tone: "warning",
      match: (r) => !r.hasDetailPage,
    },
    {
      id: "needs_review",
      label: "확인 필요",
      tone: "warning",
      match: (r) => r.reviewStatus === "needs_review" || r.reviewStatus === "notation_check",
    },
  ];

  const columns: AdminTableColumn<AdminProductRow>[] = [
    {
      key: "product",
      label: "상품",
      render: (r) => (
        <div className="admin-cell-product">
          <p className="admin-cell-primary admin-cell-primary--title">{r.displayName}</p>
          <p className="admin-cell-muted">
            {r.brandLabel} · <span className="font-mono font-semibold">{r.batteryCode}</span>
            {!r.visible ? (
              <span className="admin-order-ops-badge admin-order-ops-badge--violet ml-1">숨김</span>
            ) : null}
            {!r.hasHeroImage ? (
              <span className="admin-order-ops-badge admin-order-ops-badge--amber ml-1">이미지 없음</span>
            ) : null}
            {!r.hasDetailPage ? (
              <span className="admin-order-ops-badge admin-order-ops-badge--amber ml-1">상세 없음</span>
            ) : null}
          </p>
        </div>
      ),
    },
    {
      key: "internetPrice",
      label: "가격",
      className: "admin-cell-price",
      render: (r) => <AdminProductInlineEdit row={r} onUpdated={updateRow} />,
    },
    {
      key: "saleStatus",
      label: "판매",
      render: (r) => <AdminProductSaleSelect row={r} onUpdated={updateRow} />,
    },
    {
      key: "review",
      label: "검수",
      render: (r) => <AdminProductReviewSelect row={r} onUpdated={updateRow} />,
    },
    {
      key: "manage",
      label: "작업",
      className: "admin-cell-actions",
      render: (r) => (
        <div className="admin-action-buttons admin-action-buttons--wrap">
          <Link
            href={`/admin/products/${productIdToPathSegment(r.productId)}`}
            className="admin-btn admin-btn--secondary admin-btn--sm"
          >
            상세
          </Link>
          <Link
            href={`/admin/products/${productIdToPathSegment(r.productId)}#image`}
            className="admin-btn admin-btn--ghost admin-btn--sm"
          >
            이미지
          </Link>
          <Link
            href={`/admin/products/${productIdToPathSegment(r.productId)}#detail`}
            className="admin-btn admin-btn--ghost admin-btn--sm"
          >
            상세수정
          </Link>
          {r.hasDetailPage ? (
            <AdminCustomerPreviewLink href={`/battery/${r.batteryCode.toLowerCase()}`} label="고객화면" />
          ) : null}
        </div>
      ),
    },
  ];

  const filters: AdminTableFilter[] = [
    {
      key: "q",
      label: "검색",
      type: "search",
      placeholder: "브랜드·규격·상품명",
      match: (row, value) => {
        const r = row as AdminProductRow;
        const q = value.toLowerCase();
        return (
          r.brandLabel.toLowerCase().includes(q) ||
          r.batteryCode.toLowerCase().includes(q) ||
          r.displayName.toLowerCase().includes(q) ||
          r.adminName.toLowerCase().includes(q)
        );
      },
    },
    {
      key: "brand",
      label: "브랜드",
      type: "select",
      options: BRAND_OPTIONS,
      match: (row, value) => (row as AdminProductRow).brand === value,
    },
    {
      key: "batteryCode",
      label: "규격",
      type: "select",
      options: [
        { value: "40L", label: "40L" },
        { value: "50L", label: "50L" },
        { value: "60L", label: "60L" },
        { value: "80L", label: "80L" },
        { value: "90L", label: "90L" },
        { value: "100L", label: "100L" },
        { value: "GB80L", label: "GB80L" },
        { value: "CMF80L", label: "CMF80L" },
        { value: "DIN50L", label: "DIN50L" },
        { value: "DIN74L", label: "DIN74L" },
        { value: "AGM70L", label: "AGM70L" },
      ],
      match: (row, value) => (row as AdminProductRow).batteryCode.includes(value),
    },
    {
      key: "missingPrice",
      label: "가격 누락",
      type: "select",
      options: [{ value: "yes", label: "누락만" }],
      match: (row, value) => {
        if (value !== "yes") return true;
        const r = row as AdminProductRow;
        return r.internetPrice == null || r.onsitePrice == null;
      },
    },
    {
      key: "missingImage",
      label: "이미지",
      type: "select",
      options: [{ value: "yes", label: "누락만" }],
      match: (row, value) => {
        if (value !== "yes") return true;
        return !(row as AdminProductRow).hasHeroImage;
      },
    },
    {
      key: "reviewStatus",
      label: "검수",
      type: "select",
      options: REVIEW_OPTIONS,
      match: (row, value) => (row as AdminProductRow).reviewStatus === value,
    },
    {
      key: "saleStatus",
      label: "판매 상태",
      type: "select",
      options: [
        { value: "selling", label: "판매중" },
        { value: "hidden", label: "숨김" },
        { value: "stopped", label: "판매중지" },
      ],
      match: (row, value) => (row as AdminProductRow).saleStatus === value,
    },
  ];

  return (
    <AdminDataTableClient
      rows={rows}
      columns={columns}
      filters={filters}
      statusTabs={statusTabs}
      initialStatusTab={initialStatusTab}
      initialValues={initialValues}
      getRowId={(r) => r.productId}
      emptyMessage={ADMIN_EMPTY_LIST_MESSAGE}
      mobileCardRender={(r) => (
        <AdminMobileCard
          title={`${r.batteryCode} · ${r.displayName}`}
          lines={[
            `${r.brandLabel} · 택배 ${priceCell(r.internetPrice)} · 출장 ${priceCell(r.onsitePrice)}`,
            `${r.saleStatus} · ${r.visible ? "노출" : "숨김"}`,
          ]}
          actions={
            <Link
              href={`/admin/products/${productIdToPathSegment(r.productId)}`}
              className="admin-btn admin-btn--primary admin-btn--md"
            >
              수정
            </Link>
          }
        />
      )}
    />
  );
}
