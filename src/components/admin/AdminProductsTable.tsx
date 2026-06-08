"use client";

import Link from "next/link";
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
    { key: "brand", label: "브랜드", render: (r) => r.brandLabel },
    { key: "batteryCode", label: "규격", render: (r) => <span className="font-mono text-xs">{r.batteryCode}</span> },
    { key: "adminName", label: "상품명", render: (r) => r.adminName },
    { key: "displayName", label: "표시 상품명", render: (r) => r.displayName },
    {
      key: "internetPrice",
      label: "인터넷가",
      className: "text-right tabular-nums",
      render: (r) => priceCell(r.internetPrice),
    },
    {
      key: "onsitePrice",
      label: "출장가",
      className: "text-right tabular-nums",
      render: (r) => priceCell(r.onsitePrice),
    },
    {
      key: "delivery",
      label: "택배 발송",
      className: "text-right tabular-nums text-xs",
      render: (r) => priceCell(r.fulfillmentPrices.delivery),
    },
    {
      key: "onsiteInstall",
      label: "출장교체",
      className: "text-right tabular-nums text-xs",
      render: (r) => priceCell(r.fulfillmentPrices.onsiteInstall),
    },
    {
      key: "storeInstall",
      label: "내방교체",
      className: "text-right tabular-nums text-xs",
      render: (r) => priceCell(r.fulfillmentPrices.storeInstall),
    },
    {
      key: "storePickup",
      label: "내방수령",
      className: "text-right tabular-nums text-xs",
      render: (r) => priceCell(r.fulfillmentPrices.storePickupSelf),
    },
    {
      key: "saleStatus",
      label: "판매 상태",
      render: (r) => <AdminProductSaleBadge status={r.saleStatus} />,
    },
    {
      key: "visible",
      label: "노출",
      render: (r) => (r.visible ? "노출" : "숨김"),
    },
    {
      key: "sellable",
      label: "판매 가능",
      render: (r) => (r.sellable ? "가능" : "불가"),
    },
    {
      key: "image",
      label: "이미지",
      render: (r) => (r.hasHeroImage ? "있음" : "없음"),
    },
    {
      key: "detail",
      label: "상세",
      render: (r) => (r.hasDetailPage ? "연결" : "없음"),
    },
    {
      key: "review",
      label: "검수",
      render: (r) => <AdminProductReviewBadge status={r.reviewStatus} />,
    },
    {
      key: "updatedAt",
      label: "수정일",
      render: (r) => (r.updatedAt ? r.updatedAt.slice(0, 10) : "—"),
    },
    {
      key: "manage",
      label: "관리",
      render: (r) => (
        <Link
          href={`/admin/products/${productIdToPathSegment(r.productId)}`}
          className="text-xs font-bold text-blue-700 hover:underline"
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
    />
  );
}
