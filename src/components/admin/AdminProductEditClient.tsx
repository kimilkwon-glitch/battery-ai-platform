"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AdminProductReviewBadge,
  AdminProductSaleBadge,
} from "@/components/admin/AdminProductReviewBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { computeFulfillmentPrices } from "@/lib/admin/products/product-fulfillment-prices";
import { productIdToPathSegment } from "@/lib/admin/products/product-id";
import { formatPriceWon } from "@/lib/pricing/order-price";
import type {
  AdminProductDetail,
  AdminProductPriceHistoryEntry,
  AdminProductSaleStatus,
} from "@/types/admin-product";

type Props = {
  initial: AdminProductDetail;
  priceHistory: AdminProductPriceHistoryEntry[];
};

const REASON_OPTIONS = [
  "",
  "가격 정책 변경",
  "스마트스토어 동기화",
  "오입력 수정",
  "프로모션 종료",
  "기타",
];

function parsePriceInput(raw: string): number | null {
  const t = raw.replace(/,/g, "").trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function AdminProductEditClient({ initial, priceHistory }: Props) {
  const [item, setItem] = useState(initial);
  const [internetInput, setInternetInput] = useState(
    initial.internetPrice != null ? String(initial.internetPrice) : "",
  );
  const [onsiteInput, setOnsiteInput] = useState(
    initial.onsitePrice != null ? String(initial.onsitePrice) : "",
  );
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [adminName, setAdminName] = useState(initial.adminName);
  const [seoName, setSeoName] = useState(initial.seoNameCandidate);
  const [saleStatus, setSaleStatus] = useState<AdminProductSaleStatus>(initial.saleStatus);
  const [visible, setVisible] = useState(initial.visible);
  const [memo, setMemo] = useState(initial.memo);
  const [description, setDescription] = useState(initial.description);
  const [cautions, setCautions] = useState(initial.cautions);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const internetPrice = parsePriceInput(internetInput);
  const onsitePrice = parsePriceInput(onsiteInput);
  const fulfillment = useMemo(
    () => computeFulfillmentPrices(internetPrice, onsitePrice),
    [internetPrice, onsitePrice],
  );

  const hasChanges =
    displayName !== initial.displayName ||
    adminName !== initial.adminName ||
    seoName !== initial.seoNameCandidate ||
    saleStatus !== initial.saleStatus ||
    visible !== initial.visible ||
    memo !== initial.memo ||
    description !== initial.description ||
    cautions !== initial.cautions ||
    internetPrice !== initial.internetPrice ||
    onsitePrice !== initial.onsitePrice;

  const handleSave = async () => {
    if (!hasChanges) return;
    const ok = window.confirm("변경 내용을 저장할까요?\n(오버라이드 JSON에 기록됩니다.)");
    if (!ok) return;

    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(
        `/api/admin/products/${productIdToPathSegment(item.productId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName,
            adminName,
            seoNameCandidate: seoName,
            internetPrice,
            onsitePrice,
            saleStatus,
            visible,
            memo,
            description,
            cautions,
            reason: reason || undefined,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? "저장에 실패했습니다.");
        return;
      }
      if (data.item) setItem(data.item as AdminProductDetail);
      setSaved(true);
    } catch {
      setError("저장 요청에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={ADMIN_ROUTES.products}
          className="text-sm font-bold text-blue-700 hover:underline"
        >
          ← 제품 목록
        </Link>
        <AdminProductSaleBadge status={saleStatus} />
        <AdminProductReviewBadge status={item.reviewStatus} />
      </div>

      {item.reviewLabels.length > 0 ? (
        <Card>
          <CardContent className="pt-4 text-sm text-amber-900">
            <p className="font-bold">검수 메모</p>
            <ul className="mt-1 list-inside list-disc">
              {item.reviewLabels.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">브랜드</span>
                <Input value={item.brandLabel} readOnly className="bg-slate-50" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">규격</span>
                <Input value={item.batteryCode} readOnly className="bg-slate-50 font-mono" />
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-bold text-slate-500">관리자용 상품명</span>
              <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-bold text-slate-500">고객용 표시 상품명</span>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-bold text-slate-500">SEO/스마트스토어 상품명 후보</span>
              <Input value={seoName} onChange={(e) => setSeoName(e.target.value)} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">판매 상태</span>
                <select
                  className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                  value={saleStatus}
                  onChange={(e) => setSaleStatus(e.target.value as AdminProductSaleStatus)}
                >
                  <option value="selling">판매중</option>
                  <option value="hidden">숨김</option>
                  <option value="stopped">판매중지</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">노출 여부</span>
                <select
                  className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                  value={visible ? "true" : "false"}
                  onChange={(e) => setVisible(e.target.value === "true")}
                >
                  <option value="true">노출</option>
                  <option value="false">숨김</option>
                </select>
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-bold text-slate-500">운영 메모</span>
              <Textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={2} />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">가격 관리</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">인터넷가 (원)</span>
                <Input
                  value={internetInput}
                  onChange={(e) => setInternetInput(e.target.value)}
                  className="text-right tabular-nums"
                  inputMode="numeric"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-bold text-slate-500">출장가 (원)</span>
                <Input
                  value={onsiteInput}
                  onChange={(e) => setOnsiteInput(e.target.value)}
                  className="text-right tabular-nums"
                  inputMode="numeric"
                />
              </label>
            </div>
            <div className="rounded-md border border-slate-100 bg-slate-50 p-3 text-sm">
              <p className="mb-2 text-xs font-bold text-slate-500">수령/장착 방식별 자동 계산</p>
              <dl className="space-y-1">
                {(
                  [
                    ["택배 발송", fulfillment.delivery],
                    ["출장교체", fulfillment.onsiteInstall],
                    ["내방교체", fulfillment.storeInstall],
                    ["내방수령/셀프교체", fulfillment.storePickupSelf],
                  ] as [string, number | null][]
                ).map(([label, v]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-slate-600">{label}</dt>
                    <dd className="font-mono font-bold tabular-nums">
                      {v == null ? "—" : formatPriceWon(v)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-bold text-slate-500">가격 변경 사유</span>
              <select
                className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {REASON_OPTIONS.map((r) => (
                  <option key={r || "none"} value={r}>
                    {r || "선택 (선택사항)"}
                  </option>
                ))}
              </select>
            </label>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">상세페이지 관리 (뼈대)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-xs text-slate-500">
            상태: {item.hasDetailPage ? "상세페이지 연결됨" : "상세페이지 없음"} · 이미지:{" "}
            {item.hasHeroImage ? "있음" : "없음"}
            {item.detailHref ? (
              <>
                {" "}
                ·{" "}
                <a href={item.detailHref} className="text-blue-700 hover:underline" target="_blank">
                  고객 상세 미리보기
                </a>
              </>
            ) : null}
          </p>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-500">대표 설명</span>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-500">주의사항</span>
            <Textarea value={cautions} onChange={(e) => setCautions(e.target.value)} rows={2} />
          </label>
          <div className="rounded border border-dashed border-slate-200 p-3 text-xs text-slate-500">
            핵심 장점·적용 차량·배송 안내 등 세부 블록 편집은 추후 CMS 연동 예정. 현재는 읽기 전용
            샘플만 표시합니다.
            <ul className="mt-2 list-inside list-disc">
              {item.detailContent.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {priceHistory.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">가격 변경 이력</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-xs">
              {priceHistory.slice(0, 10).map((h) => (
                <li key={h.id} className="rounded border border-slate-100 px-2 py-1">
                  {h.createdAt.slice(0, 16)} · {h.field}: {h.previousValue ?? "—"} → {h.nextValue ?? "—"}
                  {h.reason ? ` (${h.reason})` : ""}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <p className="text-sm font-bold text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? <p className="text-sm font-bold text-emerald-700">저장되었습니다.</p> : null}

      <div className="flex gap-2">
        <Button type="button" onClick={handleSave} disabled={!hasChanges || saving}>
          {saving ? "저장 중…" : "변경 저장"}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          새로고침
        </Button>
      </div>
    </div>
  );
}
