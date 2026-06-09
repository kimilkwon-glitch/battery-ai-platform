"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminStatusTabs } from "@/components/admin/AdminStatusTabs";
import type { PromotionRecord, PromotionUpsertInput } from "@/types/promotion";
import {
  DEFAULT_PROMOTION_IDS,
  DEFAULT_PROMOTION_SEEDS,
  formatAdminPromotionDiscount,
  formatAdminPromotionType,
  PRICE_POLICY_PROMO_IDS,
} from "@/lib/promotion/default-promotions";
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

const FULFILLMENT_OPTIONS = [
  { value: "delivery", label: "택배 주문" },
  { value: "visit_install", label: "출장 교체" },
  { value: "store_install", label: "매장 교체" },
  { value: "store_pickup_self", label: "매장 수령" },
] as const;

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

function seedToForm(seed: (typeof DEFAULT_PROMOTION_SEEDS)[number]): PromotionUpsertInput {
  return {
    title: seed.title,
    description: seed.description,
    status: seed.status,
    type: seed.type,
    discountType: seed.discountType,
    discountValue: seed.discountValue,
    maxDiscountAmount: seed.maxDiscountAmount,
    minOrderAmount: seed.minOrderAmount,
    firstOrderOnly: seed.firstOrderOnly,
    newMemberOnly: seed.newMemberOnly,
    memberOnly: seed.memberOnly,
    allowedFulfillmentTypes: seed.allowedFulfillmentTypes,
    stackable: seed.stackable,
    priority: seed.priority,
    imageUrl: seed.imageUrl,
    bannerImageUrl: seed.bannerImageUrl,
    badgeText: seed.badgeText,
    showOnMain: seed.showOnMain,
    showOnBenefitsPage: seed.showOnBenefitsPage,
  };
}

export function AdminPromotionsClient() {
  const [items, setItems] = useState<PromotionWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PromotionUpsertInput>(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [listFilter, setListFilter] = useState("all");

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

  const openCreate = (preset?: PromotionUpsertInput) => {
    setEditingId(null);
    setForm(preset ? { ...EMPTY_FORM, ...preset } : { ...EMPTY_FORM, status: "inactive" });
    setFormOpen(true);
  };

  const openPreset = (seedId: string) => {
    const existing = items.find((item) => item.id === seedId);
    if (existing) {
      openEdit(existing);
      return;
    }
    const seed = DEFAULT_PROMOTION_SEEDS.find((s) => s.id === seedId);
    if (seed) openCreate(seedToForm(seed));
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
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
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
      closeForm();
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

  const isPricePolicyForm =
    editingId != null && PRICE_POLICY_PROMO_IDS.has(editingId);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      switch (listFilter) {
        case "automatic":
          return item.type === "automatic";
        case "coupon":
          return item.type === "coupon_code";
        case "main":
          return item.showOnMain;
        case "benefits":
          return item.showOnBenefitsPage;
        case "active":
          return item.status === "active";
        case "inactive":
          return item.status === "inactive";
        default:
          return true;
      }
    });
  }, [items, listFilter]);

  const listFilterTabs = useMemo(
    () => [
      { id: "all", label: "전체", count: items.length },
      {
        id: "automatic",
        label: "자동 혜택",
        count: items.filter((i) => i.type === "automatic").length,
      },
      {
        id: "coupon",
        label: "쿠폰 코드",
        count: items.filter((i) => i.type === "coupon_code").length,
      },
      {
        id: "main",
        label: "메인 노출",
        count: items.filter((i) => i.showOnMain).length,
      },
      {
        id: "benefits",
        label: "상세페이지 노출",
        count: items.filter((i) => i.showOnBenefitsPage).length,
      },
      {
        id: "active",
        label: "활성",
        count: items.filter((i) => i.status === "active").length,
        tone: "info" as const,
      },
      {
        id: "inactive",
        label: "비활성",
        count: items.filter((i) => i.status === "inactive").length,
      },
    ],
    [items],
  );

  const toggleFulfillment = (value: string) => {
    setForm((f) => {
      const current = f.allowedFulfillmentTypes ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...f, allowedFulfillmentTypes: next.length ? next : null };
    });
  };

  return (
    <div className="admin-promotions">
      <div className="admin-promotions__header-actions">
        <button type="button" className="admin-btn admin-btn--primary admin-btn--md" onClick={() => openCreate()}>
          새 혜택 만들기
        </button>
      </div>

      <section className="admin-promotions__preset-cards">
        {DEFAULT_PROMOTION_SEEDS.map((seed) => {
          const existing = items.find((i) => i.id === seed.id);
          const badge = existing ? statusBadge(existing) : { label: "미등록", className: "bg-slate-100 text-slate-600" };
          return (
            <article key={seed.id} className="admin-promotions__preset-card">
              <h3 className="admin-promotions__preset-card-title">{seed.title}</h3>
              <p className="admin-promotions__preset-card-desc">{seed.description}</p>
              <dl className="admin-promotions__preset-card-meta">
                <div>
                  <dt>적용 방식</dt>
                  <dd>{seed.type === "automatic" ? "자동 혜택" : "쿠폰"}</dd>
                </div>
                <div>
                  <dt>적용 위치</dt>
                  <dd>
                    {[seed.showOnMain && "메인", seed.showOnBenefitsPage && "혜택페이지"]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </dd>
                </div>
                <div>
                  <dt>상태</dt>
                  <dd>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badge.className}`}>
                      {badge.label}
                    </span>
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                className="admin-btn admin-btn--secondary admin-btn--md mt-3"
                onClick={() => openPreset(seed.id)}
              >
                {existing ? "수정" : "만들기"}
              </button>
            </article>
          );
        })}
      </section>

      <AdminStatusTabs tabs={listFilterTabs} activeId={listFilter} onChange={setListFilter} />

      {error ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-900"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="admin-promotions__workspace">
        <section className="admin-promotions__list-card">
          <div className="admin-promotions__list-head">
            <h2 className="admin-promotions__list-title">
              등록된 혜택 ({filteredItems.length}/{items.length})
            </h2>
          </div>
          {loading ? (
            <p className="px-4 py-8 text-center text-sm font-medium text-slate-500">불러오는 중…</p>
          ) : filteredItems.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm font-medium text-slate-500">
              {items.length === 0
                ? "등록된 혜택이 없습니다. 상단 기본 혜택 카드에서 추가해 주세요."
                : "필터 조건에 맞는 혜택이 없습니다."}
            </p>
          ) : (
            <div>
              {filteredItems.map((item) => {
                const badge = statusBadge(item);
                const active = editingId === item.id && formOpen;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`admin-promotions__row${active ? " admin-promotions__row--active" : ""}`}
                    onClick={() => openEdit(item)}
                  >
                    <span className="admin-promotions__row-title">{item.title}</span>
                    <span className="admin-promotions__row-meta">
                      <span>{formatAdminPromotionType(item)}</span>
                      <span>{formatAdminPromotionDiscount(item)}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      {item.showOnMain ? <span>메인</span> : null}
                      {item.showOnBenefitsPage ? <span>혜택페이지</span> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="admin-promotions__form-card">
          {!formOpen ? (
            <div className="admin-promotions__empty-form">
              목록에서 혜택을 선택하거나 상단 프리셋으로 새 혜택을 만드세요.
            </div>
          ) : (
            <>
              <div className="admin-promotions__form-head">
                <h2 className="admin-promotions__form-title">
                  {editingId ? "혜택 수정" : "새 혜택 만들기"}
                </h2>
                <button type="button" className="text-xs font-bold text-slate-500" onClick={closeForm}>
                  닫기
                </button>
              </div>

              <div className="admin-promotions__form-body">
                <div className="admin-promotions__sections">
                  <section className="admin-promotions__section">
                    <h3 className="admin-promotions__section-title">1. 기본 정보</h3>
                    <div className="admin-promotions__fields">
                      <div className="admin-promotions__field">
                        <label>
                          <span>혜택명 (고객 표시)</span>
                          <input
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                          />
                        </label>
                      </div>
                      <div className="admin-promotions__field">
                        <label>
                          <span>설명</span>
                          <textarea
                            rows={2}
                            value={form.description ?? ""}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                          />
                        </label>
                      </div>
                      <div className="admin-promotions__field">
                        <label>
                          <span>상태</span>
                          <select
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
                      </div>
                    </div>
                  </section>

                  <section className="admin-promotions__section">
                    <h3 className="admin-promotions__section-title">2. 혜택 유형</h3>
                    <div className="admin-promotions__fields admin-promotions__fields--2col">
                      <div className="admin-promotions__field">
                        <label>
                          <span>적용 방식</span>
                          <select
                            value={form.type}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, type: e.target.value as PromotionRecord["type"] }))
                            }
                          >
                            <option value="automatic">자동 적용</option>
                            <option value="coupon_code">쿠폰 코드</option>
                          </select>
                        </label>
                      </div>
                      {form.type === "coupon_code" ? (
                        <div className="admin-promotions__field">
                          <label>
                            <span>쿠폰코드</span>
                            <input
                              className="uppercase"
                              value={form.code ?? ""}
                              onChange={(e) =>
                                setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                              }
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="admin-promotions__field">
                          <span className="text-xs font-semibold text-slate-500">
                            자동 적용 혜택은 주문 조건 충족 시 checkout에 반영됩니다.
                          </span>
                        </div>
                      )}
                    </div>
                    {isPricePolicyForm ? (
                      <p className="admin-promotions__policy-note">
                        운영 가격 정책 혜택입니다. 실제 금액은 pricing 정책(출장가−5,000원 / 택배비
                        미부과)에서 계산되며, checkout 중복 할인은 적용되지 않습니다.
                      </p>
                    ) : null}
                  </section>

                  <section className="admin-promotions__section">
                    <h3 className="admin-promotions__section-title">3. 할인 조건</h3>
                    <div className="admin-promotions__fields admin-promotions__fields--2col">
                      <div className="admin-promotions__field">
                        <label>
                          <span>할인 방식</span>
                          <select
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
                      </div>
                      <div className="admin-promotions__field">
                        <label>
                          <span>할인값</span>
                          <input
                            type="number"
                            value={form.discountValue}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, discountValue: Number(e.target.value) || 0 }))
                            }
                          />
                        </label>
                      </div>
                      <div className="admin-promotions__field">
                        <label>
                          <span>최대 할인금액</span>
                          <input
                            type="number"
                            value={form.maxDiscountAmount ?? ""}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                maxDiscountAmount: e.target.value ? Number(e.target.value) : null,
                              }))
                            }
                          />
                        </label>
                      </div>
                      <div className="admin-promotions__field">
                        <label>
                          <span>최소 주문금액</span>
                          <input
                            type="number"
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
                    </div>
                    <p className="mt-2 text-[11px] font-semibold text-amber-800">
                      미리보기: {previewDiscount} 할인
                    </p>
                  </section>

                  <section className="admin-promotions__section">
                    <h3 className="admin-promotions__section-title">4. 적용 대상</h3>
                    <div className="admin-promotions__checks">
                      <label>
                        <input
                          type="checkbox"
                          checked={form.firstOrderOnly}
                          onChange={(e) => setForm((f) => ({ ...f, firstOrderOnly: e.target.checked }))}
                        />
                        첫 주문
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={form.newMemberOnly}
                          onChange={(e) => setForm((f) => ({ ...f, newMemberOnly: e.target.checked }))}
                        />
                        신규 회원
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={form.memberOnly}
                          onChange={(e) => setForm((f) => ({ ...f, memberOnly: e.target.checked }))}
                        />
                        회원 전용
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={form.stackable}
                          onChange={(e) => setForm((f) => ({ ...f, stackable: e.target.checked }))}
                        />
                        다른 혜택과 중복
                      </label>
                    </div>
                    <div className="admin-promotions__fields mt-3">
                      <div className="admin-promotions__field">
                        <span>수령/장착 방식 (미선택 시 전체)</span>
                        <div className="admin-promotions__checks">
                          {FULFILLMENT_OPTIONS.map((opt) => (
                            <label key={opt.value}>
                              <input
                                type="checkbox"
                                checked={(form.allowedFulfillmentTypes ?? []).includes(opt.value)}
                                onChange={() => toggleFulfillment(opt.value)}
                              />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="admin-promotions__field">
                        <label>
                          <span>우선순위 (높을수록 먼저)</span>
                          <input
                            type="number"
                            value={form.priority ?? 0}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, priority: Number(e.target.value) || 0 }))
                            }
                          />
                        </label>
                      </div>
                      <div className="admin-promotions__field">
                        <label>
                          <span>규격 제한 (쉼표 구분, 선택)</span>
                          <input
                            placeholder="CMF90L, GB80L"
                            value={csvFromList(form.allowedBatterySpecs ?? null)}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                allowedBatterySpecs: parseCsv(e.target.value),
                              }))
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </section>

                  <section className="admin-promotions__section">
                    <h3 className="admin-promotions__section-title">5. 노출 설정</h3>
                    <div className="admin-promotions__checks">
                      <label>
                        <input
                          type="checkbox"
                          checked={form.showOnMain}
                          onChange={(e) => setForm((f) => ({ ...f, showOnMain: e.target.checked }))}
                        />
                        메인 혜택 섹션
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={form.showOnBenefitsPage}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, showOnBenefitsPage: e.target.checked }))
                          }
                        />
                        상세/혜택 페이지
                      </label>
                    </div>
                    <div className="admin-promotions__fields admin-promotions__fields--2col mt-3">
                      <div className="admin-promotions__field">
                        <label>
                          <span>시작일</span>
                          <input
                            type="datetime-local"
                            value={form.startsAt ? form.startsAt.slice(0, 16) : ""}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                startsAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                              }))
                            }
                          />
                        </label>
                      </div>
                      <div className="admin-promotions__field">
                        <label>
                          <span>종료일</span>
                          <input
                            type="datetime-local"
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
                    </div>
                  </section>

                  <section className="admin-promotions__section">
                    <h3 className="admin-promotions__section-title">6. 이미지·문구</h3>
                    <div className="admin-promotions__fields admin-promotions__fields--2col">
                      <div className="admin-promotions__field">
                        <label>
                          <span>카드 이미지 URL</span>
                          <input
                            value={form.imageUrl ?? ""}
                            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value || null }))}
                          />
                        </label>
                      </div>
                      <div className="admin-promotions__field">
                        <label>
                          <span>배너 이미지 URL</span>
                          <input
                            value={form.bannerImageUrl ?? ""}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, bannerImageUrl: e.target.value || null }))
                            }
                          />
                        </label>
                      </div>
                      <div className="admin-promotions__field">
                        <label>
                          <span>뱃지 문구</span>
                          <input
                            value={form.badgeText ?? ""}
                            onChange={(e) => setForm((f) => ({ ...f, badgeText: e.target.value || null }))}
                          />
                        </label>
                      </div>
                    </div>
                    {form.imageUrl ? (
                      <div className="mt-3 rounded-xl border bg-slate-50 p-3">
                        <p className="mb-2 text-[11px] font-bold text-slate-500">카드 미리보기</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.imageUrl} alt="" className="max-h-32 rounded-lg object-contain" />
                      </div>
                    ) : null}
                  </section>
                </div>

                <div className="admin-promotions__form-actions">
                  {editingId ? (
                    <button
                      type="button"
                      className={bm.btnTertiary}
                      onClick={() => void handleToggle(editingId)}
                    >
                      {items.find((i) => i.id === editingId)?.status === "active" ? "비활성" : "활성"}
                    </button>
                  ) : null}
                  <button type="button" className={bm.btnTertiary} onClick={closeForm}>
                    취소
                  </button>
                  <button
                    type="button"
                    className={bm.btnNavy}
                    disabled={saving}
                    onClick={() => void handleSave()}
                  >
                    {saving ? "저장 중…" : "저장"}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
