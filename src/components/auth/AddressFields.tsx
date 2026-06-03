"use client";

import { bm } from "@/lib/design-tokens";

export type AddressValues = {
  zip: string;
  address: string;
  addressDetail: string;
};

type Props = {
  values: AddressValues;
  onChange: (patch: Partial<AddressValues>) => void;
  /** 추후 Daum/Kakao 주소 API 연동 시 search 버튼만 교체 */
  showSearchButton?: boolean;
};

export function AddressFields({ values, onChange, showSearchButton = true }: Props) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-black text-slate-900">주소</legend>
      <p className="text-xs font-medium text-slate-500">
        택배 배송·출장 상담 안내에 활용됩니다.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm font-bold text-slate-700">
          우편번호
          <input
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            className={`${bm.input} bm-input-field mt-1`}
            placeholder="12345"
            value={values.zip}
            onChange={(e) => onChange({ zip: e.target.value })}
          />
        </label>
        {showSearchButton ? (
          <button
            type="button"
            disabled
            title="주소 검색 연동 예정"
            className={`${bm.btnSecondary} min-h-[2.75rem] shrink-0 px-4 text-sm font-black opacity-60`}
          >
            주소 검색
          </button>
        ) : null}
      </div>
      <label className="block text-sm font-bold text-slate-700">
        주소
        <input
          type="text"
          autoComplete="street-address"
          className={`${bm.input} bm-input-field mt-1`}
          placeholder="도로명 또는 지번 주소"
          value={values.address}
          onChange={(e) => onChange({ address: e.target.value })}
        />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        상세주소
        <input
          type="text"
          autoComplete="address-line2"
          className={`${bm.input} bm-input-field mt-1`}
          placeholder="동·호수, 건물명"
          value={values.addressDetail}
          onChange={(e) => onChange({ addressDetail: e.target.value })}
        />
      </label>
    </fieldset>
  );
}
