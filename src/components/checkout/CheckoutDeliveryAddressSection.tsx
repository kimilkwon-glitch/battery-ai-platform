"use client";

import { DaumPostcodeSearchButton } from "@/components/address/DaumPostcodeSearch";
import type { OrderRequestFulfillment } from "@/types/order-request";

type Props = {
  values: OrderRequestFulfillment;
  onChange: (patch: Partial<OrderRequestFulfillment>) => void;
  onApplyMemberProfile?: () => void;
  showMemberApply?: boolean;
  showDefaultShipping?: boolean;
  onApplyDefaultShipping?: () => void;
  saveAsDefaultAddress?: boolean;
  onSaveAsDefaultAddressChange?: (checked: boolean) => void;
  showSaveAsDefault?: boolean;
};

const inputClass =
  "checkout-input mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-medium";

export function CheckoutDeliveryAddressSection({
  values,
  onChange,
  onApplyMemberProfile,
  showMemberApply,
  showDefaultShipping,
  onApplyDefaultShipping,
  saveAsDefaultAddress,
  onSaveAsDefaultAddressChange,
  showSaveAsDefault,
}: Props) {
  return (
    <section
      className="checkout-card space-y-4"
      id="checkout-delivery-address"
      data-checkout-info-section="delivery"
    >
      <div>
        <h2 className="checkout-card__title">배송지 정보</h2>
        <p className="checkout-card__hint">배터리를 받을 주소와 연락처를 입력해 주세요.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {showMemberApply && onApplyMemberProfile ? (
          <button
            type="button"
            onClick={onApplyMemberProfile}
            className="checkout-btn-secondary min-h-[2.5rem] px-4 text-xs font-black"
          >
            회원정보와 동일
          </button>
        ) : null}
        {showDefaultShipping && onApplyDefaultShipping ? (
          <button
            type="button"
            onClick={onApplyDefaultShipping}
            className="checkout-btn-secondary min-h-[2.5rem] px-4 text-xs font-black"
          >
            기본 배송지 불러오기
          </button>
        ) : null}
      </div>

      <div className="grid gap-3">
        <label className="block">
          <span className="checkout-label">
            받는 분 이름 <span className="text-red-600">*</span>
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
          주소 <span className="text-red-600">*</span>
        </span>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="text-[11px] font-bold text-slate-600">우편번호</span>
            <input
              type="text"
              readOnly
              inputMode="numeric"
              autoComplete="postal-code"
              className={`${inputClass} bg-slate-50`}
              value={values.postalCode ?? ""}
              placeholder="주소 검색으로 입력"
            />
          </label>
          <DaumPostcodeSearchButton
            onSelect={({ postalCode, address1 }) =>
              onChange({ postalCode, address1, region: `${postalCode} ${address1}`.trim() })
            }
            className="checkout-btn-primary min-h-[2.75rem] w-full px-5 text-sm font-black sm:w-auto"
          />
        </div>
        <label className="block">
          <span className="text-[11px] font-bold text-slate-600">기본주소</span>
          <input
            type="text"
            readOnly
            autoComplete="street-address"
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
            autoComplete="address-line2"
            className={inputClass}
            value={values.address2 ?? ""}
            onChange={(e) => onChange({ address2: e.target.value })}
            placeholder="동·호수, 건물명"
          />
        </label>
        {showSaveAsDefault && onSaveAsDefaultAddressChange ? (
          <label className="flex items-start gap-2 text-[11px] font-medium text-slate-700">
            <input
              type="checkbox"
              checked={Boolean(saveAsDefaultAddress)}
              onChange={(e) => onSaveAsDefaultAddressChange(e.target.checked)}
              className="mt-0.5"
            />
            <span>이 주소를 기본 배송지로 저장</span>
          </label>
        ) : null}
      </div>

      <label className="block">
        <span className="checkout-label">배송메시지</span>
        <textarea
          rows={3}
          className={inputClass}
          value={values.deliveryMessage ?? ""}
          onChange={(e) => onChange({ deliveryMessage: e.target.value })}
          placeholder="예: 부재 시 문 앞에 놓아주세요. 차량정보를 모르시면 여기에 적어주세요."
        />
      </label>
    </section>
  );
}
