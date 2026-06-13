"use client";

import { DaumPostcodeSearchButton } from "@/components/address/DaumPostcodeSearch";
import { CheckoutAddressPurposeBanner } from "@/components/checkout/CheckoutAddressPurposeBanner";
import { CHECKOUT_ADDRESS_PURPOSE } from "@/data/checkout-address-copy";
import type { OrderRequestFulfillment } from "@/types/order-request";

const copy = CHECKOUT_ADDRESS_PURPOSE.visit_install;

type Props = {
  values: OrderRequestFulfillment;
  onChange: (patch: Partial<OrderRequestFulfillment>) => void;
  onApplyMemberProfile?: () => void;
  showMemberApply?: boolean;
};

const inputClass =
  "checkout-input mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-medium";

export function CheckoutVisitAddressSection({
  values,
  onChange,
  onApplyMemberProfile,
  showMemberApply,
}: Props) {
  return (
    <section
      className="checkout-card space-y-4"
      id="checkout-visit-address"
      data-checkout-info-section="visit_install"
    >
      <CheckoutAddressPurposeBanner title={copy.title} description={copy.description} />

      <div>
        <h2 className="checkout-card__title">방문 정보</h2>
        <p className="checkout-card__hint">출장 교체 받을 위치와 연락처를 입력해 주세요.</p>
      </div>

      {showMemberApply && onApplyMemberProfile ? (
        <button
          type="button"
          onClick={onApplyMemberProfile}
          className="checkout-btn-secondary min-h-[2.5rem] px-4 text-xs font-black"
        >
          회원정보와 동일
        </button>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="checkout-label">
            이름 <span className="text-red-600">*</span>
          </span>
          <input
            type="text"
            autoComplete="name"
            className={inputClass}
            value={values.recipientName ?? ""}
            onChange={(e) => onChange({ recipientName: e.target.value })}
            placeholder="홍길동"
          />
        </label>
        <label className="block">
          <span className="checkout-label">
            연락처 <span className="text-red-600">*</span>
          </span>
          <input
            type="tel"
            autoComplete="tel"
            className={inputClass}
            value={values.recipientPhone ?? ""}
            onChange={(e) => onChange({ recipientPhone: e.target.value })}
            placeholder="010-0000-0000"
          />
        </label>
      </div>

      <div className="space-y-2">
        <span className="checkout-label">
          방문 주소 <span className="text-red-600">*</span>
        </span>
        <p className="text-[11px] font-semibold leading-relaxed text-slate-600">{copy.readonlyHint}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="text-[11px] font-bold text-slate-600">우편번호</span>
            <input
              type="text"
              readOnly
              className={`${inputClass} bg-slate-50`}
              value={values.postalCode ?? ""}
              placeholder="주소 검색으로 입력"
            />
          </label>
          <DaumPostcodeSearchButton
            onSelect={({ postalCode, address1 }) =>
              onChange({
                postalCode,
                address1,
                region: `${postalCode} ${address1}`.trim(),
              })
            }
            label={copy.searchLabel}
            dialogTitle={copy.searchDialogTitle}
            className="checkout-btn-primary min-h-[2.75rem] w-full px-5 text-sm font-black sm:w-auto"
          />
        </div>
        <label className="block">
          <span className="text-[11px] font-bold text-slate-600">기본주소</span>
          <input
            type="text"
            readOnly
            className={`${inputClass} bg-slate-50`}
            value={values.address1 ?? ""}
            placeholder="주소 검색 버튼을 눌러 입력"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold text-slate-600">
            상세주소 <span className="text-red-600">*</span>
          </span>
          <input
            type="text"
            className={inputClass}
            value={values.address2 ?? ""}
            onChange={(e) => onChange({ address2: e.target.value })}
            placeholder="동·호수, 건물명, 주차 위치"
          />
        </label>
      </div>

      <label className="block">
        <span className="checkout-label">희망 날짜/시간 (선택)</span>
        <input
          type="text"
          className={inputClass}
          value={values.preferredTime ?? ""}
          onChange={(e) => onChange({ preferredTime: e.target.value })}
          placeholder="예: 주말 오전"
        />
      </label>

      <label className="block">
        <span className="checkout-label">출장 요청사항 (선택)</span>
        <textarea
          rows={3}
          className={inputClass}
          value={values.visitMessage ?? ""}
          onChange={(e) => onChange({ visitMessage: e.target.value })}
        />
      </label>
    </section>
  );
}
