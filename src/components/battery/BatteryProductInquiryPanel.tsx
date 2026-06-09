"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitInquiry } from "@/lib/inquiry-storage";
import { INQUIRY_VEHICLE_OPTIONS } from "@/lib/inquiry-vehicle-options";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { CHECKOUT_PAGE } from "@/lib/customer-center-routes";
import { CONTACT } from "@/lib/contact-info";
import { bm } from "@/lib/design-tokens";

const INQUIRY_TYPES = [
  "장착 가능 여부",
  "재고/가격 문의",
  "폐배터리 반납 문의",
  "출장/방문 문의",
  "기타",
] as const;

const FUEL_OPTIONS = ["가솔린", "디젤", "LPG", "하이브리드", "HEV/PHEV", "전기", "모름"] as const;

type Props = {
  batteryCode: string;
};

export function BatteryProductInquiryPanel({ batteryCode }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleFuel, setVehicleFuel] = useState("");
  const [currentSpec, setCurrentSpec] = useState("");
  const [hasPhoto, setHasPhoto] = useState<"yes" | "no" | "">("");
  const [inquiryType, setInquiryType] = useState<string>(INQUIRY_TYPES[0]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customerPhone = CONTACT.customerCenter.tel;

  const buildMemo = () => {
    const lines = [
      `[상품문의] ${batteryCode}`,
      `문의 유형: ${inquiryType}`,
      vehicleName.trim() ? `차량: ${vehicleName.trim()}` : null,
      vehicleYear ? `연식: ${vehicleYear}년` : null,
      vehicleFuel ? `연료: ${vehicleFuel}` : null,
      currentSpec.trim() ? `현재 규격: ${currentSpec.trim()}` : null,
      hasPhoto === "yes" ? "배터리 사진: 있음" : hasPhoto === "no" ? "배터리 사진: 없음" : null,
      message.trim() ? `내용: ${message.trim()}` : null,
    ].filter(Boolean);
    return lines.join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !contact.trim()) {
      setError("이름과 연락처를 입력해 주세요.");
      return;
    }
    const result = await submitInquiry({
      name: name.trim(),
      contact: contact.trim(),
      vehicle: vehicleName.trim() || undefined,
      message: buildMemo(),
      batteryCode,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      source: "product_detail",
      inquiryType: inquiryType,
      category: inquiryType.includes("반납") ? "return" : "battery",
    });
    if (result.ok) setSubmitted(true);
    else setError("문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  };

  const goCheckoutWithDraft = () => {
    const params = new URLSearchParams({
      flow: "product_inquiry",
      spec: batteryCode,
    });
    if (vehicleName.trim()) params.set("vehicle", vehicleName.trim());
    if (message.trim()) params.set("memo", message.trim().slice(0, 200));
    router.push(`${CHECKOUT_PAGE}?${params.toString()}`);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-5">
        <p className="text-sm font-black text-emerald-900">문의가 접수되었습니다.</p>
        <p className="mt-2 text-sm font-medium text-emerald-800/90">
          확인 후 연락드리겠습니다. 급하시면 고객센터로 전화해 주세요.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={customerPhone} className={`${bm.btnPrimary} text-sm font-black`}>
            고객센터 전화
          </a>
          <button
            type="button"
            className={`${bm.btnSecondary} text-sm font-black`}
            onClick={() => setSubmitted(false)}
          >
            추가 문의하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="battery-product-inquiry space-y-5">
      <div>
        <h3 className="text-lg font-black text-slate-950">
          차량에 맞는지 애매하다면 바로 문의해 주세요
        </h3>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          규격이 맞는지 애매하면 문의로 남겨주세요. 차량명과 연식만 있어도 1차 확인이 가능하고,
          현재 장착된 배터리 사진이 있으면 더 정확하게 안내드릴 수 있습니다.
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          문의 규격: {batteryCode}
        </p>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-800">{error}</p>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-bold text-slate-700">
            이름 <span className="text-red-600">*</span>
            <input
              required
              type="text"
              className={`${bm.input} bm-input-field mt-1 w-full`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            연락처 <span className="text-red-600">*</span>
            <input
              required
              type="tel"
              placeholder="010-0000-0000"
              className={`${bm.input} bm-input-field mt-1 w-full`}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </label>
        </div>

        <label className="block text-sm font-bold text-slate-700">
          차량명
          <select
            className={`${bm.input} bm-input-field mt-1 w-full`}
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
          >
            {INQUIRY_VEHICLE_OPTIONS.map((opt) => (
              <option key={opt.value || "empty"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-bold text-slate-700">
            연식
            <input
              type="text"
              inputMode="numeric"
              placeholder="예: 2018"
              className={`${bm.input} bm-input-field mt-1 w-full`}
              value={vehicleYear}
              onChange={(e) => setVehicleYear(e.target.value)}
            />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            연료
            <select
              className={`${bm.input} bm-input-field mt-1 w-full`}
              value={vehicleFuel}
              onChange={(e) => setVehicleFuel(e.target.value)}
            >
              <option value="">선택</option>
              {FUEL_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-bold text-slate-700">
          현재 배터리 규격 또는 사진 여부
          <input
            type="text"
            placeholder="예: AGM60L, 사진 있음"
            className={`${bm.input} bm-input-field mt-1 w-full`}
            value={currentSpec}
            onChange={(e) => setCurrentSpec(e.target.value)}
          />
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-bold text-slate-700">배터리 사진</legend>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name={`photo-${batteryCode}`}
                checked={hasPhoto === "yes"}
                onChange={() => setHasPhoto("yes")}
              />
              사진 있음
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name={`photo-${batteryCode}`}
                checked={hasPhoto === "no"}
                onChange={() => setHasPhoto("no")}
              />
              사진 없음
            </label>
          </div>
        </fieldset>

        <label className="block text-sm font-bold text-slate-700">
          문의 유형
          <select
            className={`${bm.input} bm-input-field mt-1 w-full`}
            value={inquiryType}
            onChange={(e) => setInquiryType(e.target.value)}
          >
            {INQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold text-slate-700">
          문의 내용
          <textarea
            rows={4}
            className={`${bm.input} bm-input-field mt-1 w-full resize-y`}
            placeholder="차량 상태, 장착 공간, 문의하실 내용을 적어 주세요."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button type="submit" className={`${bm.btnPrimary} min-h-[3rem] flex-1 text-sm font-black`}>
            문의 접수하기
          </button>
          <a
            href={customerPhone}
            className={`${bm.btnSecondary} inline-flex min-h-[3rem] flex-1 items-center justify-center text-sm font-black`}
          >
            고객센터 {CONTACT.customerCenter.phone}
          </a>
          <Link
            href={HUB_STORE_DETAIL}
            className={`${bm.btnTertiary} inline-flex min-h-[3rem] flex-1 items-center justify-center text-sm font-black`}
          >
            매장 안내 보기
          </Link>
        </div>
        <button
          type="button"
          className="text-sm font-bold text-blue-700 hover:underline"
          onClick={goCheckoutWithDraft}
        >
          주문서로 이어서 작성하기
        </button>
      </form>
    </div>
  );
}
