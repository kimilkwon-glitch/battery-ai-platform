"use client";

import Link from "next/link";
import {
  CART_CHECKOUT_POLICY,
  CART_DESIGN_COPY,
  CART_DESIGN_LINKS,
  CART_DESIGN_PHILOSOPHY_BULLETS,
  CART_DEMO_ITEMS,
  CART_FLOW_SCENARIOS,
  CART_GUEST_FLOW,
  CART_NEEDS_REVIEW_COPY,
  CART_ORDER_CHECKLIST,
  CART_PRODUCT_PAGE_LINKS,
  CART_RISK_ITEMS,
  CART_USED_BATTERY_BOX_COPY,
  FITMENT_STATUS_LABELS,
  FULFILLMENT_METHOD_LABELS,
  INSTALL_METHOD_LABELS,
  PHASE_6_SCOPE,
  USED_BATTERY_RETURN_LABELS,
  summarizeCartDemo,
} from "@/data/cart-flow-guide";
import type { BatteryCartItem, FitmentStatus } from "@/types/cart";
import { bm } from "@/lib/design-tokens";

function fitmentTone(status: FitmentStatus): string {
  switch (status) {
    case "confirmed":
      return "bg-emerald-50 text-emerald-900 ring-emerald-200";
    case "needs_photo_check":
      return "bg-amber-50 text-amber-950 ring-amber-200";
    case "needs_customer_confirm":
      return "bg-blue-50 text-blue-900 ring-blue-200";
    default:
      return "bg-slate-100 text-slate-800 ring-slate-200";
  }
}

function DemoCartItemCard({ item }: { item: BatteryCartItem }) {
  const fit = FITMENT_STATUS_LABELS[item.fitmentStatus];
  const ub = USED_BATTERY_RETURN_LABELS[item.usedBatteryReturn.option];
  const fulfillment = FULFILLMENT_METHOD_LABELS[item.fulfillment.method];
  const install = INSTALL_METHOD_LABELS[item.install.method];
  const unit = item.finalPrice ?? item.basePrice ?? 0;
  const price = unit * item.quantity;

  return (
    <article
      className={`${bm.card} ${bm.cardPad} space-y-3 border-slate-200/90`}
      data-preview-cart-item={item.id}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
            설계 예시 · 동작 없음
          </p>
          <h3 className="text-sm font-black text-slate-950">{item.productName}</h3>
          <p className="text-xs font-bold text-slate-600">
            {item.brandName} · {item.batterySpec}
            {item.terminalDirection && item.terminalDirection !== "unknown"
              ? ` · 단자 ${item.terminalDirection}`
              : " · 단자 확인 필요"}
          </p>
        </div>
        <span className="text-sm font-black text-blue-700 tabular-nums">
          {price.toLocaleString()}원
        </span>
      </div>

      {item.vehicle?.displayName ? (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
          차량: {item.vehicle.displayName}
          {item.vehicle.generationName ? ` · ${item.vehicle.generationName}` : ""}
          {item.vehicle.year ? ` · ${item.vehicle.year}` : ""}
        </p>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-bold text-slate-500">
          차량 정보 없음
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${fitmentTone(item.fitmentStatus)}`}
        >
          {fit.badge}
        </span>
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-black text-violet-900 ring-1 ring-violet-200">
          {ub.badge}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-700 ring-1 ring-slate-200">
          {fulfillment}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600 ring-1 ring-slate-200">
          {install}
        </span>
      </div>

      <p className="text-[11px] font-medium leading-relaxed text-slate-600">{fit.message}</p>

      {item.warnings.length > 0 && (
        <ul className="list-disc space-y-1 pl-4 text-[11px] font-bold text-amber-900">
          {item.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      {item.customerMemo && (
        <p className="text-[11px] font-medium text-slate-500">
          메모: {item.customerMemo}
        </p>
      )}

      <div className="flex flex-wrap gap-2 opacity-60">
        <span className={`${bm.btnTertiary} pointer-events-none text-[10px]`}>수량 {item.quantity}</span>
        <span className={`${bm.btnTertiary} pointer-events-none text-[10px]`}>수정</span>
        <span className={`${bm.btnTertiary} pointer-events-none text-[10px] text-red-700`}>삭제</span>
      </div>
    </article>
  );
}

export function CartDesignPreview() {
  const summary = summarizeCartDemo(CART_DEMO_ITEMS);

  return (
    <div className="cart-design-preview space-y-6" data-page="cart-design-preview">
      <p className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/80 px-4 py-3 text-sm font-bold leading-relaxed text-blue-950">
        {CART_DESIGN_COPY.banner}
      </p>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">{CART_DESIGN_COPY.philosophyTitle}</h2>
        <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
          {CART_DESIGN_COPY.philosophyBody}
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-4 text-xs font-medium text-slate-700">
          {CART_DESIGN_PHILOSOPHY_BULLETS.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">장바구니 UX 흐름 (A–E)</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {CART_FLOW_SCENARIOS.map((flow) => (
            <div
              key={flow.id}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-3"
            >
              <p className="text-[10px] font-black text-blue-700">흐름 {flow.id}</p>
              <h3 className="mt-0.5 text-xs font-black text-slate-900">{flow.title}</h3>
              <ol className="mt-2 list-decimal space-y-0.5 pl-4 text-[11px] font-medium text-slate-600">
                {flow.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad} border-blue-100/80`}>
        <h2 className="text-sm font-black text-slate-900">6차 목표: 장바구니 상단 요약 (예시)</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-700">
          <span className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
            담긴 상품 {summary.itemCount}개
          </span>
          {summary.hasNeedsReviewItem && (
            <span className="rounded-lg bg-amber-50 px-3 py-2 text-amber-950 ring-1 ring-amber-200">
              확인 필요 항목 있음
            </span>
          )}
          {summary.hasNoReturnItem && (
            <span className="rounded-lg bg-slate-100 px-3 py-2 ring-1 ring-slate-200">
              미반납 조건 포함
            </span>
          )}
          <span className="rounded-lg bg-blue-50 px-3 py-2 text-blue-900 ring-1 ring-blue-100">
            예상 합계 {summary.estimatedTotal.toLocaleString()}원
          </span>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black text-slate-900">예시 상품 카드 (더미 3건)</h2>
        {CART_DEMO_ITEMS.map((item) => (
          <DemoCartItemCard key={item.id} item={item} />
        ))}
      </section>

      {summary.hasNeedsReviewItem && (
        <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <h2 className="text-sm font-black text-amber-950">{CART_NEEDS_REVIEW_COPY.title}</h2>
          <p className="mt-1 text-xs font-medium text-amber-900">{CART_NEEDS_REVIEW_COPY.body}</p>
          <ul className="mt-2 list-disc pl-4 text-[11px] font-bold text-amber-900/90">
            {CART_NEEDS_REVIEW_COPY.triggers.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      <section className={`${bm.card} ${bm.cardPad} border-emerald-100/80`}>
        <h2 className="text-sm font-black text-slate-900">{CART_USED_BATTERY_BOX_COPY.title}</h2>
        <p className="mt-1 text-xs font-medium text-slate-600">{CART_USED_BATTERY_BOX_COPY.body}</p>
        <Link className={`${bm.btnTertiary} mt-3 inline-flex text-xs`} href={CART_USED_BATTERY_BOX_COPY.href}>
          {CART_USED_BATTERY_BOX_COPY.linkLabel} →
        </Link>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">주문 전 체크리스트 (장바구니 연동)</h2>
        <ul className="mt-2 list-none space-y-2 p-0">
          {CART_ORDER_CHECKLIST.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
            >
              <span className="size-4 rounded border-2 border-slate-300" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <Link className={`${bm.btnSecondary} mt-3 inline-flex text-xs`} href={CART_DESIGN_LINKS.orderChecklist}>
          주문 전 체크 페이지 →
        </Link>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">다음 단계 CTA (6차 · 예시)</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={`${bm.btnNavy} pointer-events-none opacity-50`}
            title={CART_CHECKOUT_POLICY.recommendation}
          >
            주문하기 (확인 필요 시 비활성)
          </span>
          <Link className={bm.btnSecondary} href={CART_DESIGN_LINKS.photoCheck}>
            사진 확인 먼저 하기
          </Link>
          <Link className={bm.btnTertiary} href={CART_DESIGN_LINKS.hub}>
            고객센터 문의
          </Link>
          <Link className={bm.btnTertiary} href="/shop">
            계속 쇼핑하기
          </Link>
        </div>
        <p className="mt-3 text-[11px] font-medium text-slate-500">
          정책: {CART_CHECKOUT_POLICY.rationale}
        </p>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">{CART_CHECKOUT_POLICY.title}</h2>
        <ul className="mt-2 space-y-2">
          {CART_CHECKOUT_POLICY.rules.map((r) => (
            <li key={r.condition} className="rounded-lg bg-slate-50 px-3 py-2 text-[11px]">
              <span className="font-black text-slate-800">{r.action}</span>
              <span className="font-medium text-slate-600"> — {r.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">{CART_GUEST_FLOW.title}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs font-medium text-slate-600">
          {CART_GUEST_FLOW.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">상품·차량·검색 연결 (요약)</h2>
        <dl className="mt-2 space-y-2 text-xs">
          <div>
            <dt className="font-black text-slate-800">배터리 상세</dt>
            <dd className="font-medium text-slate-600">
              {CART_PRODUCT_PAGE_LINKS.batteryDetail.addToCartPlacement} ·{" "}
              {CART_PRODUCT_PAGE_LINKS.batteryDetail.usedBatteryPlacement}
            </dd>
          </div>
          <div>
            <dt className="font-black text-slate-800">차량 상세</dt>
            <dd className="font-medium text-slate-600">
              {CART_PRODUCT_PAGE_LINKS.vehicleDetail.addToCartPlacement} ·{" "}
              {CART_PRODUCT_PAGE_LINKS.vehicleDetail.vehicleAutoFill}
            </dd>
          </div>
          <div>
            <dt className="font-black text-slate-800">검색 결과</dt>
            <dd className="font-medium text-slate-600">{CART_PRODUCT_PAGE_LINKS.searchResults.policy}</dd>
          </div>
        </dl>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">위험 요소와 대응</h2>
        <div className="mt-3 space-y-3">
          {CART_RISK_ITEMS.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-200/80 p-3">
              <p className="text-xs font-black text-slate-900">{r.risk}</p>
              <p className="mt-1 text-[11px] font-medium text-slate-600">
                대응: {r.mitigations.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad} border-violet-100/80 bg-violet-50/20`}>
        <h2 className="text-sm font-black text-slate-900">6차 실제 개발 범위 (제안)</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs font-medium text-slate-700">
          {PHASE_6_SCOPE.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="mt-3 text-[11px] font-bold text-slate-500">
          상세 설계 문서: {CART_DESIGN_LINKS.doc} · 기존 쇼핑 스텁:{" "}
          <Link className="text-blue-700 underline" href={CART_DESIGN_LINKS.existingShopCart}>
            {CART_DESIGN_LINKS.existingShopCart}
          </Link>
        </p>
      </section>
    </div>
  );
}
