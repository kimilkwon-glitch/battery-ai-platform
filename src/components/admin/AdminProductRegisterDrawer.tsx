"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { productIdToPathSegment } from "@/lib/admin/products/product-id";
import type { AdminProductBrand, AdminProductSaleStatus } from "@/types/admin-product";

const BRANDS: { value: AdminProductBrand; label: string }[] = [
  { value: "rocket", label: "로케트" },
  { value: "solite", label: "쏠라이트" },
  { value: "delco", label: "델코" },
  { value: "atlas", label: "아트라스" },
];

const BATTERY_CODES = [
  "40L", "50L", "60L", "70L", "80L", "90L", "100L", "100R",
  "CMF40L", "CMF50L", "CMF60L", "CMF70L", "CMF80L", "CMF90L", "CMF100L",
  "GB40L", "GB50L", "GB60L", "GB70L", "GB80L", "GB90L", "GB100L",
  "AGM60L", "AGM70L", "AGM80L", "AGM80R", "AGM90L", "AGM100L",
  "DIN50L", "DIN60L", "DIN74L", "DIN80L", "DIN100L",
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AdminProductRegisterDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const [brand, setBrand] = useState<AdminProductBrand>("rocket");
  const [batteryCode, setBatteryCode] = useState("CMF80L");
  const [displayName, setDisplayName] = useState("");
  const [internetPrice, setInternetPrice] = useState("");
  const [onsitePrice, setOnsitePrice] = useState("");
  const [saleStatus, setSaleStatus] = useState<AdminProductSaleStatus>("selling");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          batteryCode,
          displayName: displayName.trim() || `${BRANDS.find((b) => b.value === brand)?.label} ${batteryCode}`,
          internetPrice: internetPrice ? Number(internetPrice.replace(/\D/g, "")) : null,
          onsitePrice: onsitePrice ? Number(onsitePrice.replace(/\D/g, "")) : null,
          saleStatus,
          visible: true,
          sellable: saleStatus === "selling",
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? "등록에 실패했습니다.");
        return;
      }
      onClose();
      router.refresh();
      if (data.item?.productId) {
        router.push(`/admin/products/${productIdToPathSegment(data.item.productId)}`);
      }
    } catch {
      setError("등록 요청을 처리하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-drawer" role="dialog" aria-modal="true">
      <button type="button" className="admin-drawer__backdrop" aria-label="닫기" onClick={onClose} />
      <div className="admin-drawer__panel">
        <div className="admin-drawer__header">
          <h2 className="admin-drawer__title">상품 정보 등록·보완</h2>
          <button type="button" className="admin-drawer__close" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="admin-drawer__body space-y-4">
          <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900">
            카탈로그에 있는 브랜드·규격의 가격·판매 정보를 저장합니다. 신규 규격 추가가 아닌 운영 정보 보완입니다.
          </p>
          <label className="admin-field">
            <span>브랜드 *</span>
            <select value={brand} onChange={(e) => setBrand(e.target.value as AdminProductBrand)}>
              {BRANDS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>규격 *</span>
            <select value={batteryCode} onChange={(e) => setBatteryCode(e.target.value)}>
              {BATTERY_CODES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>상품명 *</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="고객에게 보이는 상품명"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="admin-field">
              <span>인터넷 택배가</span>
              <input
                value={internetPrice}
                onChange={(e) => setInternetPrice(e.target.value)}
                placeholder="예: 89000"
                inputMode="numeric"
              />
            </label>
            <label className="admin-field">
              <span>출장교체가</span>
              <input
                value={onsitePrice}
                onChange={(e) => setOnsitePrice(e.target.value)}
                placeholder="예: 99000"
                inputMode="numeric"
              />
            </label>
          </div>
          <p className="text-sm font-medium text-slate-500">
            매장수령가·내방가는 인터넷가/출장가 기준으로 자동 계산됩니다.
          </p>
          <label className="admin-field">
            <span>판매상태</span>
            <select
              value={saleStatus}
              onChange={(e) => setSaleStatus(e.target.value as AdminProductSaleStatus)}
            >
              <option value="selling">판매중</option>
              <option value="hidden">숨김</option>
              <option value="stopped">판매중지</option>
            </select>
          </label>
          <label className="admin-field">
            <span>상세 설명</span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상품 상세 설명 (등록 후 상세 수정에서 보강 가능)"
            />
          </label>
          {error ? (
            <p className="text-sm font-bold text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="admin-drawer__footer">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={saving}
            onClick={() => void handleSubmit()}
          >
            {saving ? "저장 중…" : "정보 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
