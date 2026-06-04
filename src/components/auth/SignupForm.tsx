"use client";

import Link from "next/link";
import { useState } from "react";
import { AddressFields, type AddressValues } from "@/components/auth/AddressFields";
import { INQUIRY_VEHICLE_OPTIONS } from "@/lib/inquiry-vehicle-options";
import { bm } from "@/lib/design-tokens";
import { HUB_LOGIN } from "@/lib/customer-hub-routes";

const FUEL_OPTIONS = ["가솔린", "디젤", "LPG", "하이브리드", "HEV/PHEV", "전기"] as const;
const YEAR_OPTIONS = Array.from({ length: 25 }, (_, i) => String(new Date().getFullYear() - i));
const CUSTOM_VEHICLE_VALUE = "__custom__";

export function SignupForm() {
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [address, setAddress] = useState<AddressValues>({ zip: "", address: "", addressDetail: "" });
  const [vehicleName, setVehicleName] = useState("");
  const [customVehicleName, setCustomVehicleName] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleFuel, setVehicleFuel] = useState("");
  const [plate, setPlate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError("이름, 휴대폰 번호, 이메일을 입력해 주세요.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상으로 설정해 주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    const vehiclePayload =
      vehicleName === CUSTOM_VEHICLE_VALUE
        ? { customVehicleName: customVehicleName.trim() }
        : vehicleName
          ? { selectedVehicleName: vehicleName }
          : {};
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "bm-signup-vehicle-draft",
        JSON.stringify({
          ...vehiclePayload,
          vehicleYear: vehicleYear || undefined,
          vehicleFuel: vehicleFuel || undefined,
          plate: plate.trim() || undefined,
        }),
      );
    }
    setDone(true);
  };

  if (done) {
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-6 text-center text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
        회원가입 요청이 접수되었습니다. 확인 후 안내드리겠습니다.
      </p>
    );
  }

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-800 ring-1 ring-red-100">
          {error}
        </p>
      ) : null}

      <label className="block text-sm font-bold text-slate-700">
        이름 <span className="text-red-600">*</span>
        <input
          required
          type="text"
          autoComplete="name"
          className={`${bm.input} bm-input-field mt-1`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        휴대폰 번호 <span className="text-red-600">*</span>
        <input
          required
          type="tel"
          autoComplete="tel"
          className={`${bm.input} bm-input-field mt-1`}
          placeholder="010-0000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        이메일 <span className="text-red-600">*</span>
        <input
          required
          type="email"
          autoComplete="email"
          className={`${bm.input} bm-input-field mt-1`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        비밀번호 <span className="text-red-600">*</span>
        <input
          required
          type="password"
          autoComplete="new-password"
          className={`${bm.input} bm-input-field mt-1`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        비밀번호 확인 <span className="text-red-600">*</span>
        <input
          required
          type="password"
          autoComplete="new-password"
          className={`${bm.input} bm-input-field mt-1`}
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
      </label>

      <AddressFields values={address} onChange={(p) => setAddress((a) => ({ ...a, ...p }))} />

      <fieldset className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
        <legend className="px-1 text-sm font-black text-slate-900">기본 차량 정보 (선택)</legend>
        <p className="text-xs font-medium leading-relaxed text-slate-600">
          차량 정보는 가입 후 마이페이지에서 등록할 수 있습니다. 자주 이용하는 차량을 등록하면
          규격 확인과 주문이 더 편해집니다.
        </p>
        <label className="bm-inquiry-field block">
          차량명
          <select
            value={vehicleName}
            onChange={(e) => {
              setVehicleName(e.target.value);
              if (e.target.value !== CUSTOM_VEHICLE_VALUE) setCustomVehicleName("");
            }}
          >
            {INQUIRY_VEHICLE_OPTIONS.map((opt) => (
              <option key={opt.value || "empty"} value={opt.value}>
                {opt.label}
              </option>
            ))}
            <option value={CUSTOM_VEHICLE_VALUE}>직접 입력</option>
          </select>
        </label>
        {vehicleName === CUSTOM_VEHICLE_VALUE ? (
          <label className="block text-sm font-bold text-slate-700">
            차량명 직접 입력
            <input
              type="text"
              className={`${bm.input} bm-input-field mt-1 w-full`}
              placeholder="차량명을 직접 입력해 주세요"
              value={customVehicleName}
              onChange={(e) => setCustomVehicleName(e.target.value)}
            />
            <span className="mt-1 block text-xs font-medium text-slate-500">
              예: 2017년식 말리부, 캠핑카, 수입차 등
            </span>
          </label>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-bold text-slate-700">
            연식
            <select
              className={`${bm.input} bm-input-field mt-1`}
              value={vehicleYear}
              onChange={(e) => setVehicleYear(e.target.value)}
            >
              <option value="">선택 (선택사항)</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold text-slate-700">
            연료
            <select
              className={`${bm.input} bm-input-field mt-1`}
              value={vehicleFuel}
              onChange={(e) => setVehicleFuel(e.target.value)}
            >
              <option value="">선택 (선택사항)</option>
              {FUEL_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm font-bold text-slate-700">
          차량번호 (선택)
          <input
            type="text"
            className={`${bm.input} bm-input-field mt-1`}
            placeholder="12가 3456"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
          />
        </label>
      </fieldset>

      <button type="submit" className={`${bm.btnPrimary} w-full min-h-[3.25rem] text-base font-black`}>
        회원가입
      </button>
      <p className="text-center text-sm font-semibold text-slate-500">
        이미 계정이 있으신가요?{" "}
        <Link href={HUB_LOGIN} className="font-black text-blue-700 hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
