"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignupAddressFields } from "@/components/auth/SignupAddressFields";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { patchCustomerProfile } from "@/lib/auth/customer-auth-client";
import {
  memberPreferredStoreToUi,
  uiPreferredStoreToMember,
} from "@/lib/auth/member-preferred-store";
import type { PreferredStoreId } from "@/lib/customer-profile-storage";
import { CUSTOMER_MYPAGE } from "@/lib/customer-auth-routes";

const STORE_OPTIONS: { id: PreferredStoreId; label: string }[] = [
  { id: "deokcheon", label: "덕천점" },
  { id: "hakjang", label: "학장점" },
  { id: "undecided", label: "아직 정하지 않음" },
];

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

type Props = {
  redirect?: string | null;
};

export function SocialProfileCompleteForm({ redirect }: Props) {
  const router = useRouter();
  const { member, isLoggedIn, ready, refresh } = useCustomerAuth();
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [preferredStore, setPreferredStore] = useState<PreferredStoreId>("undecided");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!member) return;
    setPhone(member.phone !== "미입력" ? member.phone : "");
    setPostalCode(member.zonecode ?? "");
    setAddress1(member.address ?? "");
    setAddress2(member.detailAddress ?? "");
    setPreferredStore(memberPreferredStoreToUi(member.preferredStore));
  }, [member]);

  if (!ready) {
    return <p className="text-sm font-medium text-slate-500">로그인 정보를 확인하는 중…</p>;
  }

  if (!isLoggedIn || !member) {
    return (
      <div className="bm-auth-complete">
        <p className="bm-auth-complete__title">로그인 정보가 없습니다</p>
        <Link href="/login" className="bm-auth-submit mt-4 inline-flex justify-center">
          로그인하기
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("입력 정보를 다시 확인해 주세요.");
      return;
    }
    if (!postalCode.trim() || !address1.trim() || !address2.trim()) {
      setError("입력 정보를 다시 확인해 주세요.");
      return;
    }

    setSubmitting(true);
    const result = await patchCustomerProfile({
      phone: phone.trim(),
      zonecode: postalCode.trim(),
      address: address1.trim(),
      detailAddress: address2.trim(),
      preferredStore: uiPreferredStoreToMember(preferredStore),
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    await refresh();

    const target = redirect?.trim()
      ? redirect.trim()
      : `${CUSTOMER_MYPAGE}?welcome=1`;
    router.push(target);
  };

  return (
    <div className="bm-auth-form" data-page="complete-profile">
      <h1 className="text-lg font-black text-[#0F172A]">추가 정보 입력</h1>
      <p className="mt-2 text-sm font-medium text-slate-600">
        주문을 계속하려면 연락처와 기본 배송지를 입력해 주세요.
      </p>
      <p className="mt-2 text-xs font-semibold text-slate-500">
        내 차량은 가입 후 마이페이지에서 등록할 수 있습니다.
      </p>

      {error ? (
        <p className="bm-auth-error mt-3" role="alert">
          {error}
        </p>
      ) : null}

      <form className="bm-auth-form__fields mt-4" onSubmit={handleSubmit}>
        <label className="bm-auth-field">
          <span className="bm-auth-field__label">이름</span>
          <input
            type="text"
            readOnly
            className="bm-auth-field__input bg-slate-50"
            value={member.name}
          />
        </label>
        <label className="bm-auth-field">
          <span className="bm-auth-field__label">
            휴대폰 번호 <span className="text-red-600">*</span>
          </span>
          <input
            required
            type="tel"
            className="bm-auth-field__input"
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            placeholder="010-0000-0000"
          />
        </label>

        <SignupAddressFields
          postalCode={postalCode}
          address1={address1}
          address2={address2}
          onChange={(patch) => {
            if (patch.postalCode != null) setPostalCode(patch.postalCode);
            if (patch.address1 != null) setAddress1(patch.address1);
            if (patch.address2 != null) setAddress2(patch.address2);
          }}
        />

        <label className="bm-auth-field">
          <span className="bm-auth-field__label">자주 이용하는 지점</span>
          <select
            className="bm-auth-field__input"
            value={preferredStore}
            onChange={(e) => setPreferredStore(e.target.value as PreferredStoreId)}
          >
            {STORE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs font-medium text-slate-500">
            자주 이용하는 지점을 선택해 주세요.
          </span>
        </label>

        <button type="submit" disabled={submitting} className="bm-auth-submit">
          {submitting ? "저장 중…" : "저장하고 계속하기"}
        </button>
      </form>
    </div>
  );
}
