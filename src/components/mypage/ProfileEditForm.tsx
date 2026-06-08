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
import { isValidEmail, isValidPhoneDigits } from "@/lib/auth/signup-validation";
import { CUSTOMER_LOGIN_PAGE, CUSTOMER_MYPAGE } from "@/lib/customer-auth-routes";
import {
  getCustomerProfile,
  saveCustomerProfile,
  type PreferredStoreId,
} from "@/lib/customer-profile-storage";

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

const STORE_OPTIONS: { id: PreferredStoreId; label: string }[] = [
  { id: "deokcheon", label: "덕천점" },
  { id: "hakjang", label: "학장점" },
  { id: "undecided", label: "아직 선택하지 않음" },
];

export function ProfileEditForm() {
  const router = useRouter();
  const { isLoggedIn, member, ready, refresh } = useCustomerAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [preferredStore, setPreferredStore] = useState<PreferredStoreId>("undecided");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ready || !member) return;
    setName(member.name);
    setPhone(member.phone !== "미입력" ? member.phone : "");
    setEmail(member.email ?? "");
    setPostalCode(member.zonecode ?? "");
    setAddress1(member.address ?? "");
    setAddress2(member.detailAddress ?? "");
    setPreferredStore(
      member.preferredStore != null
        ? memberPreferredStoreToUi(member.preferredStore)
        : (getCustomerProfile()?.preferredStore ?? "undecided"),
    );
  }, [ready, member]);

  if (!ready || !isLoggedIn || !member) {
    return (
      <div className="bm-mypage-orders__empty">
        <p>회원정보를 수정하려면 로그인해 주세요.</p>
        <div className="bm-mypage-orders__actions">
          <Link href={CUSTOMER_LOGIN_PAGE} className="bm-auth-submit inline-flex w-auto px-6 no-underline">
            로그인
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (!name.trim()) {
      setError("입력 정보를 다시 확인해 주세요.");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (!isValidPhoneDigits(phoneDigits)) {
      setError("입력 정보를 다시 확인해 주세요.");
      return;
    }
    if (email.trim() && !isValidEmail(email)) {
      setError("입력 정보를 다시 확인해 주세요.");
      return;
    }

    setSubmitting(true);
    const result = await patchCustomerProfile({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      zonecode: postalCode.trim() || undefined,
      address: address1.trim() || undefined,
      detailAddress: address2.trim() || undefined,
      preferredStore: uiPreferredStoreToMember(preferredStore),
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    await refresh();

    saveCustomerProfile({
      id: result.member.id,
      loginId: result.member.loginId,
      name: result.member.name,
      phone: result.member.phone,
      email: result.member.email,
      postalCode: result.member.zonecode,
      address1: result.member.address,
      address2: result.member.detailAddress,
      vehicleName: result.member.vehicleInfo?.name,
      vehicleYear: result.member.vehicleInfo?.year,
      vehicleFuel: result.member.vehicleInfo?.fuel,
      provider: result.member.provider,
      preferredStore: memberPreferredStoreToUi(result.member.preferredStore),
      createdAt: result.member.createdAt,
      updatedAt: result.member.updatedAt,
    });

    setSaved(true);
    router.refresh();
  };

  return (
    <form className="bm-auth-form__fields" onSubmit={handleSubmit} data-page="profile-edit">
      {member.loginId ? (
        <div className="bm-auth-field">
          <span className="bm-auth-field__label">아이디</span>
          <input
            type="text"
            className="bm-auth-field__input bg-slate-50"
            value={member.loginId}
            readOnly
            aria-readonly
          />
        </div>
      ) : null}

      <label className="bm-auth-field">
        <span className="bm-auth-field__label">이름</span>
        <input
          type="text"
          autoComplete="name"
          required
          className="bm-auth-field__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="bm-auth-field">
        <span className="bm-auth-field__label">휴대폰 번호</span>
        <input
          type="tel"
          autoComplete="tel"
          required
          className="bm-auth-field__input"
          value={phone}
          onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
        />
      </label>

      <label className="bm-auth-field">
        <span className="bm-auth-field__label">이메일</span>
        <input
          type="email"
          autoComplete="email"
          className="bm-auth-field__input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <SignupAddressFields
        postalCode={postalCode}
        address1={address1}
        address2={address2}
        required={false}
        onChange={(patch) => {
          if (patch.postalCode !== undefined) setPostalCode(patch.postalCode);
          if (patch.address1 !== undefined) setAddress1(patch.address1);
          if (patch.address2 !== undefined) setAddress2(patch.address2);
        }}
      />

      <label className="bm-auth-field">
        <span className="bm-auth-field__label">기본 이용 지점</span>
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
      </label>

      {error ? (
        <p className="bm-auth-error" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm font-bold text-emerald-700" role="status">
          회원정보가 저장되었습니다.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={submitting} className="bm-auth-submit flex-1 sm:flex-none sm:min-w-[8rem]">
          {submitting ? "저장 중…" : "저장하기"}
        </button>
        <Link href={CUSTOMER_MYPAGE} className="bm-auth-inline-btn no-underline">
          마이페이지로
        </Link>
      </div>
    </form>
  );
}
