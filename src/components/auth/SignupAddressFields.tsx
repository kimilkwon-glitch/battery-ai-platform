"use client";

import { DaumPostcodeSearchButton } from "@/components/address/DaumPostcodeSearch";

type Props = {
  postalCode: string;
  address1: string;
  address2: string;
  onChange: (patch: { postalCode?: string; address1?: string; address2?: string }) => void;
  required?: boolean;
};

export function SignupAddressFields({
  postalCode,
  address1,
  address2,
  onChange,
  required = true,
}: Props) {
  const req = required ? <span className="text-red-600">*</span> : null;

  return (
    <fieldset className="bm-auth-address space-y-3">
      <legend className="bm-auth-section__title">기본 배송지</legend>
      <p className="bm-auth-section__hint text-[11px] font-medium text-slate-500">
        주문서에 자동으로 불러올 기본 주소입니다.
      </p>
      <DaumPostcodeSearchButton
        label="주소 검색"
        onSelect={(result) =>
          onChange({ postalCode: result.postalCode, address1: result.address1 })
        }
      />
      <label className="bm-auth-field">
        <span className="bm-auth-field__label">우편번호 {req}</span>
        <input
          type="text"
          readOnly
          className="bm-auth-field__input bg-slate-50"
          value={postalCode}
          placeholder="주소 검색 후 자동 입력"
        />
      </label>
      <label className="bm-auth-field">
        <span className="bm-auth-field__label">기본주소 {req}</span>
        <input
          type="text"
          readOnly
          className="bm-auth-field__input bg-slate-50"
          value={address1}
          placeholder="주소 검색 후 자동 입력"
        />
      </label>
      <label className="bm-auth-field">
        <span className="bm-auth-field__label">상세주소 {req}</span>
        <input
          type="text"
          autoComplete="address-line2"
          className="bm-auth-field__input"
          value={address2}
          onChange={(e) => onChange({ address2: e.target.value })}
          placeholder="동·호수, 상세 주소"
        />
      </label>
    </fieldset>
  );
}
