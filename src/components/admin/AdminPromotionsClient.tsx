"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PromotionRecord, PromotionUpsertInput } from "@/types/promotion";
import { bm } from "@/lib/design-tokens";

type PromotionWithUsage = PromotionRecord & { usageCount?: number };

const EMPTY_FORM: PromotionUpsertInput = {
  title: "",
  description: "",
  status: "inactive",
  type: "automatic",
  discountType: "percent",
  discountValue: 0,
  maxDiscountAmount: null,
  minOrderAmount: null,
  startsAt: null,
  endsAt: null,
  usageLimitTotal: null,
  usageLimitPerMember: null,
  firstOrderOnly: false,
  newMemberOnly: false,
  memberOnly: false,
  allowedFulfillmentTypes: null,
  allowedBatterySpecs: null,
  allowedBrands: null,
  excludedBatterySpecs: null,
  excludedBrands: null,
  stackable: false,
  priority: 0,
  code: null,
  imageUrl: null,
  bannerImageUrl: null,
  badgeText: null,
  showOnMain: false,
  showOnBenefitsPage: false,
};

function statusBadge(promo: PromotionRecord): { label: string; className: string } {
  const now = new Date();
  if (promo.status === "inactive") {
    return { label: "비활성", className: "bg-slate-100 text-slate-600" };
  }
  if (promo.endsAt && new Date(promo.endsAt) < now) {
    return { label: "종료", className: "bg-slate-200 text-slate-700" };
  }
  if (promo.startsAt && new Date(promo.startsAt) > now) {
    return { label: "예정", className: "bg-blue-100 text-blue-800" };
  }
  if (promo.status === "active") {
    return { label: "진행중", className: "bg-emerald-100 text-emerald-800" };
  }
  return { label: promo.status, className: "bg-slate-100 text-slate-600" };
}

function parseCsv(value: string): string[] | null {
  const items = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? items : null;
}

function csvFromList(list: string[] | null): string {
  return list?.join(", ") ?? "";
}

export function AdminPromotionsClient() {
  const [items, setItems] = useState<PromotionWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PromotionUpsertInput>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/promotions", { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? "목록을 불러오지 못했습니다.");
        return;
      }
      setItems(data.items);
    } catch {
      setError("목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, status: "inactive" });
    setShowForm(true);
  };

  const openEdit = (item: PromotionRecord) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      status: item.status,
      type: item.type,
      discountType: item.discountType,
      discountValue: item.discountValue,
      maxDiscountAmount: item.maxDiscountAmount,
      minOrderAmount: item.minOrderAmount,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
      usageLimitTotal: item.usageLimitTotal,
      usageLimitPerMember: item.usageLimitPerMember,
      firstOrderOnly: item.firstOrderOnly,
      newMemberOnly: item.newMemberOnly,
      memberOnly: item.memberOnly,
      allowedFulfillmentTypes: item.allowedFulfillmentTypes,
      allowedBatterySpecs: item.allowedBatterySpecs,
      allowedBrands: item.allowedBrands,
      excludedBatterySpecs: item.excludedBatterySpecs,
      excludedBrands: item.excludedBrands,
      stackable: item.stackable,
      priority: item.priority,
      code: item.code,
      imageUrl: item.imageUrl,
      bannerImageUrl: item.bannerImageUrl,
      badgeText: item.badgeText,
      showOnMain: item.showOnMain,
      showOnBenefitsPage: item.showOnBenefitsPage,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const url = editingId
        ? `/api/admin/promotions/${encodeURIComponent(editingId)}`
        : "/api/admin/promotions";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? "저장에 실패했습니다.");
        return;
      }
      setShowForm(false);
      await load();
    } catch {
      setError("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    const res = await fetch(`/api/admin/promotions/${encodeURIComponent(id)}/toggle`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) await load();
  };

  const previewDiscount = useMemo(() => {
    if (form.discountType === "percent") return `${form.discountValue}%`;
    return `${form.discountValue?.toLocaleString()}원`;
  }, [form.discountType, form.discountValue]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-600">
          자동 혜택·쿠폰코드를 등록하고 메인/혜택 페이지 노출을 관리합니다.
        </p>
        <button type="button" className={`${bm.btnNavy} text-xs`} onClick={openCreate}>
          쿠폰/혜택 만들기
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-900" role="alert">
          {error}
        </p>
      ) : null}

      {showForm ? (
        <section className={`${bm.card} ${bm.cardPad} space-y-6`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900">
              {editingId ? "혜택 수정" : "새 혜택 만들기"}
            </h2>
            <button type="button" className="text-xs font-bold text-slate-500" onClick={() => setShowForm(false)}>
              닫기
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <fieldset className="space-y-3 rounded-xl border border-slate-100 p-4">
              <legend className="px-1 text-xs font-black text-slate-800">기본 정보</legend>
              <label className="block text-xs">
                <span className="font-bold text-slate-600">혜택명 (고객 표시)</span>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </label>
              <label className="block text-xs">
                <span className="font-bold text-slate-600">설명</span>
                <textarea
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  rows={2}
                  value={form.description ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </label>
              <label className="block text-xs">
                <span className="font-bold text-slate-600">상태</span>
                <select
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as PromotionRecord["status"],
                    }))
                  }
                >
                  <option value="active">활성 (진행)</option>
                  <option value="inactive">비활성</option>
                  <option value="scheduled">예정</option>
                </select>
              </label>
            </fieldset>

            <fieldset className="space-y-3 rounded-xl border border-slate-100 p-4">
              <legend className="px-1 text-xs font-black text-slate-800">혜택 유형</legend>
              <label className="block text-xs">
                <span className="font-bold text-slate-600">적용 방식</span>
                <select
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value as PromotionRecord["type"] }))
                  }
                >
                  <option value="automatic">자동 적용</option>
                  <option value="coupon_code">쿠폰코드 입력</option>
                </select>
              </label>
              {form.type === "coupon_code" ? (
                <label className="block text-xs">
                  <span className="font-bold text-slate-600">쿠폰코드</span>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2 uppercase"
                    value={form.code ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  />
                </label>
              ) : null}
            </fieldset>

            <fieldset className="space-y-3 rounded-xl border border-slate-100 p-4">
              <legend className="px-1 text-xs font-black text-slate-800">할인 조건</legend>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs">
                  <span className="font-bold text-slate-600">할인 방식</span>
                  <select
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={form.discountType}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        discountType: e.target.value as PromotionRecord["discountType"],
                      }))
                    }
                  >
                    <option value="percent">정률 (%)</option>
                    <option value="fixed_amount">정액 (원)</option>
                  </select>
                </label>
                <label className="block text-xs">
                  <span className="font-bold text-slate-600">할인값</span>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={form.discountValue}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, discountValue: Number(e.target.value) || 0 }))
                    }
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs">
                  <span className="font-bold text-slate-600">최대 할인금액</span>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={form.maxDiscountAmount ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        maxDiscountAmount: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                  />
                </label>
                <label className="block text-xs">
                  <span className="font-bold text-slate-600">최소 주문금액</span>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={form.minOrderAmount ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        minOrderAmount: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                  />
                </label>
              </div>
              <p className="text-[11px] font-semibold text-amber-800">미리보기: {previewDiscount} 할인</p>
            </fieldset>

            <fieldset className="space-y-3 rounded-xl border border-slate-100 p-4">
              <legend className="px-1 text-xs font-black text-slate-800">자동 적용 조건</legend>
              <div className="flex flex-wrap gap-3 text-xs">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={form.firstOrderOnly}
                    onChange={(e) => setForm((f) => ({ ...f, firstOrderOnly: e.target.checked }))}
                  />
                  첫 주문만
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={form.newMemberOnly}
                    onChange={(e) => setForm((f) => ({ ...f, newMemberOnly: e.target.checked }))}
                  />
                  신규 회원만
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={form.memberOnly}
                    onChange={(e) => setForm((f) => ({ ...f, memberOnly: e.target.checked }))}
                  />
                  회원 전용
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={form.stackable}
                    onChange={(e) => setForm((f) => ({ ...f, stackable: e.target.checked }))}
                  />
                  다른 혜택과 중복 적용
                </label>
              </div>
              <label className="block text-xs">
                <span className="font-bold text-slate-600">우선순위 (높을수록 먼저)</span>
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  value={form.priority ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) || 0 }))}
                />
              </label>
              <label className="block text-xs">
                <span className="font-bold text-slate-600">적용 수령/장착 (쉼표 구분)</span>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  placeholder="delivery, store_install"
                  value={csvFromList(form.allowedFulfillmentTypes ?? null)}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, allowedFulfillmentTypes: parseCsv(e.target.value) }))
                  }
                />
              </label>
            </fieldset>

            <fieldset className="space-y-3 rounded-xl border border-slate-100 p-4">
              <legend className="px-1 text-xs font-black text-slate-800">기간·사용 제한</legend>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs">
                  <span className="font-bold text-slate-600">시작일</span>
                  <input
                    type="datetime-local"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={form.startsAt ? form.startsAt.slice(0, 16) : ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        startsAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                      }))
                    }
                  />
                </label>
                <label className="block text-xs">
                  <span className="font-bold text-slate-600">종료일</span>
                  <input
                    type="datetime-local"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={form.endsAt ? form.endsAt.slice(0, 16) : ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        endsAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                      }))
                    }
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs">
                  <span className="font-bold text-slate-600">전체 사용 제한</span>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={form.usageLimitTotal ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        usageLimitTotal: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                  />
                </label>
                <label className="block text-xs">
                  <span className="font-bold text-slate-600">회원당 사용 제한</span>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={form.usageLimitPerMember ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        usageLimitPerMember: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="space-y-3 rounded-xl border border-slate-100 p-4 lg:col-span-2">
              <legend className="px-1 text-xs font-black text-slate-800">노출 위치·이미지</legend>
              <div className="flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={form.showOnMain}
                    onChange={(e) => setForm((f) => ({ ...f, showOnMain: e.target.checked }))}
                  />
                  메인 페이지 노출
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={form.showOnBenefitsPage}
                    onChange={(e) => setForm((f) => ({ ...f, showOnBenefitsPage: e.target.checked }))}
                  />
                  혜택 페이지 노출
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block text-xs">
                  <span className="font-bold text-slate-600">카드 이미지 URL</span>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={form.imageUrl ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value || null }))}
                  />
                </label>
                <label className="block text-xs">
                  <span className="font-bold text-slate-600">배너 이미지 URL</span>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={form.bannerImageUrl ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bannerImageUrl: e.target.value || null }))
                    }
                  />
                </label>
                <label className="block text-xs">
                  <span className="font-bold text-slate-600">뱃지 문구</span>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={form.badgeText ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, badgeText: e.target.value || null }))}
                  />
                </label>
              </div>
              {form.imageUrl ? (
                <div className="rounded-xl border bg-slate-50 p-3">
                  <p className="mb-2 text-[11px] font-bold text-slate-500">카드 미리보기</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="" className="max-h-32 rounded-lg object-contain" />
                </div>
              ) : null}
            </fieldset>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className={bm.btnTertiary} onClick={() => setShowForm(false)}>
              취소
            </button>
            <button type="button" className={bm.btnNavy} disabled={saving} onClick={() => void handleSave()}>
              {saving ? "저장 중…" : "저장"}
            </button>
          </div>
        </section>
      ) : null}

      <section className={`${bm.card} overflow-hidden`}>
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-slate-50 text-[11px] font-black uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">혜택명</th>
              <th className="px-4 py-3">유형</th>
              <th className="px-4 py-3">할인</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">사용량</th>
              <th className="px-4 py-3">노출</th>
              <th className="px-4 py-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  불러오는 중…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  등록된 혜택이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const badge = statusBadge(item);
                const discount =
                  item.discountType === "percent"
                    ? `${item.discountValue}%`
                    : `${item.discountValue.toLocaleString()}원`;
                return (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-bold text-slate-900">{item.title}</td>
                    <td className="px-4 py-3">
                      {item.type === "automatic" ? "자동" : `쿠폰 ${item.code ?? ""}`}
                    </td>
                    <td className="px-4 py-3">{discount}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{item.usageCount ?? 0}회</td>
                    <td className="px-4 py-3 text-[11px] text-slate-600">
                      {item.showOnMain ? "메인 " : ""}
                      {item.showOnBenefitsPage ? "혜택" : ""}
                      {!item.showOnMain && !item.showOnBenefitsPage ? "—" : ""}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="font-bold text-blue-700 hover:underline"
                          onClick={() => openEdit(item)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className="font-bold text-slate-600 hover:underline"
                          onClick={() => void handleToggle(item.id)}
                        >
                          {item.status === "active" ? "비활성" : "활성"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
