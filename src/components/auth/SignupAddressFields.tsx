"use client";

import { useRef } from "react";
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
  const detailRef = useRef<HTMLInputElement>(null);
  const req = required ? <span className="text-red-600">*</span> : null;

  return (
    <fieldset className="bm-auth-address space-y-3">
      <legend className="bm-auth-section__title">주소</legend>
      <div className="bm-auth-postcode-row">
        <label className="bm-auth-field bm-auth-field--grow">
          <span className="bm-auth-field__label">우편번호 {req}</span>
          <input
            type="text"
            readOnly
            className="bm-auth-field__input bg-slate-50"
            value={postalCode}
            placeholder="주소 찾기 후 자동 입력"
            aria-readonly="true"
          />
        </label>
        <DaumPostcodeSearchButton
          label="주소 찾기"
          className="bm-auth-postcode-btn"
          onSelect={(result) => {
            onChange({ postalCode: result.postalCode, address1: result.address1 });
            requestAnimationFrame(() => detailRef.current?.focus());
          }}
        />
      </div>
      <label className="bm-auth-field">
        <span className="bm-auth-field__label">기본주소 {req}</span>
        <input
          type="text"
          readOnly
          className="bm-auth-field__input bg-slate-50"
          value={address1}
          placeholder="주소 찾기 후 자동 입력"
          aria-readonly="true"
        />
      </label>
      <label className="bm-auth-field">
        <span className="bm-auth-field__label">상세주소 {req}</span>
        <input
          ref={detailRef}
          type="text"
          autoComplete="address-line2"
          className="bm-auth-field__input"
          value={address2}
          onChange={(e) => onChange({ address2: e.target.value })}
          placeholder="동·호수 등 상세주소를 입력해 주세요"
        />
      </label>
    </fieldset>
  );
}
