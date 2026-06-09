"use client";

import Link from "next/link";
import { AdminMobileCard } from "@/components/admin/AdminMobileCard";
import {
  AdminDataTableClient,
  type AdminTableColumn,
  type AdminTableFilter,
} from "@/components/admin/AdminDataTableClient";
import {
  AdminProductReviewBadge,
  AdminProductSaleBadge,
} from "@/components/admin/AdminProductReviewBadge";
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

export function AdminProductsTable({ rows }: { rows: AdminProductRow[] }) {
  const columns: AdminTableColumn<AdminProductRow>[] = [
    {
      key: "product",
      label: "상품",
      render: (r) => (
        <div>
          <p className="admin-cell-primary font-mono">{r.batteryCode}</p>
          <p className="admin-cell-muted admin-cell-clamp">{r.displayName}</p>
        </div>
      ),
    },
    { key: "brand", label: "브랜드", render: (r) => <span className="admin-cell-muted">{r.brandLabel}</span> },
    {
      key: "internetPrice",
      label: "인터넷가",
      className: "text-right tabular-nums",
      render: (r) => <span className="admin-cell-primary">{priceCell(r.internetPrice)}</span>,
    },
    {
      key: "onsitePrice",
      label: "출장가",
      className: "text-right tabular-nums",
      render: (r) => <span className="admin-cell-muted">{priceCell(r.onsitePrice)}</span>,
    },
    {
      key: "saleStatus",
      label: "판매",
      render: (r) => <AdminProductSaleBadge status={r.saleStatus} />,
    },
    {
      key: "review",
      label: "검수",
      render: (r) => <AdminProductReviewBadge status={r.reviewStatus} />,
    },
    {
      key: "manage",
      label: "",
      className: "admin-cell-actions",
      render: (r) => (
        <Link
          href={`/admin/products/${productIdToPathSegment(r.productId)}`}
          className="admin-btn admin-btn--secondary admin-btn--sm"
        >
          편집
        </Link>
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
      options: [{ value: "", label: "전체" }, ...BRAND_OPTIONS],
      match: (row, value) => (row as AdminProductRow).brand === value,
    },
    {
      key: "batteryCode",
      label: "규격",
      type: "select",
      options: [
        { value: "", label: "전체" },
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
      options: [
        { value: "", label: "전체" },
        { value: "yes", label: "누락만" },
      ],
      match: (row, value) => {
        if (value !== "yes") return true;
        const r = row as AdminProductRow;
        return r.internetPrice == null || r.onsitePrice == null;
      },
    },
    {
      key: "missingImage",
      label: "이미지 누락",
      type: "select",
      options: [
        { value: "", label: "전체" },
        { value: "yes", label: "누락만" },
      ],
      match: (row, value) => {
        if (value !== "yes") return true;
        return !(row as AdminProductRow).hasHeroImage;
      },
    },
    {
      key: "missingDetail",
      label: "상세 누락",
      type: "select",
      options: [
        { value: "", label: "전체" },
        { value: "yes", label: "누락만" },
      ],
      match: (row, value) => {
        if (value !== "yes") return true;
        return !(row as AdminProductRow).hasDetailPage;
      },
    },
    {
      key: "reviewStatus",
      label: "검수",
      type: "select",
      options: [{ value: "", label: "전체" }, ...REVIEW_OPTIONS],
      match: (row, value) => (row as AdminProductRow).reviewStatus === value,
    },
    {
      key: "saleStatus",
      label: "판매 상태",
      type: "select",
      options: [
        { value: "", label: "전체" },
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
      getRowId={(r) => r.productId}
      emptyMessage="등록된 제품이 없습니다."
      mobileCardRender={(r) => (
        <AdminMobileCard
          title={`${r.batteryCode} · ${r.displayName}`}
          lines={[
            `${r.brandLabel} · 인터넷 ${priceCell(r.internetPrice)}`,
            `${r.saleStatus} · ${r.visible ? "노출" : "숨김"}`,
          ]}
          actions={
            <Link
              href={`/admin/products/${productIdToPathSegment(r.productId)}`}
              className="admin-btn admin-btn--secondary admin-btn--sm"
            >
              편집
            </Link>
          }
        />
      )}
    />
  );
}
