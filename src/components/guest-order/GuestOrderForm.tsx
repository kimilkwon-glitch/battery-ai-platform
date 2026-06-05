"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { guestFormToCreateInput, type GuestOrderFormValues } from "@/lib/guest-order/guest-order-input";
import { validateGuestOrderForm } from "@/lib/guest-order/guest-order-validation";
import {
  GUEST_ORDER_CHECK_PAGE,
  GUEST_ORDER_COMPLETE_PAGE,
} from "@/lib/guest-order/guest-order-routes";
import { CHECKOUT_PAGE } from "@/lib/customer-center-routes";
import { submitOrderRequest } from "@/lib/order-request/order-request-client-api";
import { bm } from "@/lib/design-tokens";

const INITIAL: GuestOrderFormValues = {
  name: "",
  phone: "",
  vehicleName: "",
  vehicleYear: "",
  fuelType: "가솔린",
  batterySpec: "",
  brand: "undecided",
  usedBattery: "return",
  fulfillmentMethod: "undecided",
  storeId: undefined,
  region: "",
  address: "",
  memo: "",
  plateSuffix: "",
  preferredTime: "",
};

export function GuestOrderForm() {
  const router = useRouter();
  const [values, setValues] = useState<GuestOrderFormValues>(INITIAL);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [website, setWebsite] = useState("");

  const set = <K extends keyof GuestOrderFormValues>(key: K, val: GuestOrderFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateGuestOrderForm(values);
    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    setSubmitting(true);

    const payload = guestFormToCreateInput(values);
    payload.website = website;

    try {
      const result = await submitOrderRequest(payload);
      if (result.ok && result.request) {
        const sp = new URLSearchParams({
          requestNumber: result.request.requestNumber,
          id: result.request.id,
        });
        router.push(`${GUEST_ORDER_COMPLETE_PAGE}?${sp.toString()}`);
        return;
      }
      setErrors(result.errors ?? ["접수에 실패했습니다. 잠시 후 다시 시도해 주세요."]);
    } catch {
      setErrors(["네트워크 오류로 접수하지 못했습니다."]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={(e) => void handleSubmit(e)} data-page="guest-order">
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      <section className={`${bm.card} ${bm.cardPad} space-y-3`}>
        <h1 className="text-lg font-black text-slate-950">비회원 주문 요청</h1>
        <p className="text-sm text-slate-600">
          회원가입 없이 주문 요청을 접수합니다. 담당자가 차량·배터리 규격을 확인한 뒤 연락드립니다.
        </p>
        <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-900">
          결제가 완료된 것이 아닙니다. 상담 후 결제·장착 일정을 안내해 드립니다.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href={CHECKOUT_PAGE} className={`${bm.btnTertiary} text-xs`}>
            회원(장바구니) 주문
          </Link>
          <Link href={GUEST_ORDER_CHECK_PAGE} className={`${bm.btnTertiary} text-xs`}>
            주문 조회
          </Link>
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad} grid gap-3 sm:grid-cols-2`}>
        <div>
          <Label htmlFor="guest-name">이름 *</Label>
          <Input id="guest-name" value={values.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="guest-phone">연락처 *</Label>
          <Input id="guest-phone" type="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="guest-vehicle">차량명 *</Label>
          <Input id="guest-vehicle" value={values.vehicleName} onChange={(e) => set("vehicleName", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="guest-year">연식 *</Label>
          <Input id="guest-year" value={values.vehicleYear} onChange={(e) => set("vehicleYear", e.target.value)} placeholder="예: 2020" required />
        </div>
        <div>
          <Label htmlFor="guest-fuel">연료 *</Label>
          <Select id="guest-fuel" value={values.fuelType} onChange={(e) => set("fuelType", e.target.value)}>
            <option value="가솔린">가솔린</option>
            <option value="디젤">디젤</option>
            <option value="LPG">LPG</option>
            <option value="하이브리드">하이브리드</option>
            <option value="전기">전기</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="guest-spec">배터리 규격 *</Label>
          <Input id="guest-spec" value={values.batterySpec} onChange={(e) => set("batterySpec", e.target.value)} placeholder="예: AGM70L" required />
        </div>
        <div>
          <Label htmlFor="guest-brand">브랜드</Label>
          <Select id="guest-brand" value={values.brand} onChange={(e) => set("brand", e.target.value as GuestOrderFormValues["brand"])}>
            <option value="undecided">상담 후 결정</option>
            <option value="rocket">로케트</option>
            <option value="solite">쏠라이트</option>
            <option value="battery_manager">배터리매니저</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="guest-used">폐전지 *</Label>
          <Select id="guest-used" value={values.usedBattery} onChange={(e) => set("usedBattery", e.target.value as "return" | "no_return")}>
            <option value="return">반납</option>
            <option value="no_return">미반납</option>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="guest-fulfillment">장착 방식 *</Label>
          <Select
            id="guest-fulfillment"
            value={values.fulfillmentMethod}
            onChange={(e) =>
              set("fulfillmentMethod", e.target.value as GuestOrderFormValues["fulfillmentMethod"])
            }
          >
            <option value="delivery">택배</option>
            <option value="store_pickup">내방</option>
            <option value="visit_install">출장</option>
            <option value="undecided">상담 후 결정</option>
          </Select>
        </div>
        {values.fulfillmentMethod === "store_pickup" ? (
          <div className="sm:col-span-2">
            <Label htmlFor="guest-store">지점 *</Label>
            <Select
              id="guest-store"
              value={values.storeId ?? ""}
              onChange={(e) => set("storeId", e.target.value as "deokcheon" | "hakjang")}
            >
              <option value="">선택</option>
              <option value="deokcheon">덕천점</option>
              <option value="hakjang">학장점</option>
            </Select>
          </div>
        ) : null}
        {values.fulfillmentMethod === "visit_install" ? (
          <div className="sm:col-span-2">
            <Label htmlFor="guest-address">출장 주소/지역 *</Label>
            <Input id="guest-address" value={values.address} onChange={(e) => set("address", e.target.value)} />
          </div>
        ) : (
          <div className="sm:col-span-2">
            <Label htmlFor="guest-region">지역 (선택)</Label>
            <Input id="guest-region" value={values.region} onChange={(e) => set("region", e.target.value)} />
          </div>
        )}
      </section>

      <section className={`${bm.card} ${bm.cardPad} grid gap-3 sm:grid-cols-2`}>
        <p className="sm:col-span-2 text-xs font-bold text-slate-500">선택 입력</p>
        <div>
          <Label htmlFor="guest-plate">차량번호 뒷자리</Label>
          <Input id="guest-plate" value={values.plateSuffix} onChange={(e) => set("plateSuffix", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="guest-time">희망 방문/출장 시간</Label>
          <Input id="guest-time" value={values.preferredTime} onChange={(e) => set("preferredTime", e.target.value)} />
        </div>
        <div className="sm:col-span-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
          {/* TODO: 사진 업로드 스토리지 연동 — 현재는 체크만 수집 */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={values.hasExistingBatteryPhoto ?? false}
              onChange={(e) => set("hasExistingBatteryPhoto", e.target.checked)}
            />
            기존 배터리 사진 준비됨
          </label>
          <label className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={values.hasBatteryBayPhoto ?? false}
              onChange={(e) => set("hasBatteryBayPhoto", e.target.checked)}
            />
            배터리 장착부 사진 준비됨
          </label>
          <p className="mt-2 text-[10px] text-amber-700">
            사진 첨부 파일 업로드는 준비 중입니다. 카카오·전화 상담으로 사진을 보내주셔도 됩니다.
          </p>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="guest-memo">요청사항</Label>
          <Textarea id="guest-memo" value={values.memo} onChange={(e) => set("memo", e.target.value)} rows={3} />
        </div>
      </section>

      {errors.length > 0 ? (
        <ul className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      ) : null}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "접수 중…" : "주문 요청 접수"}
      </Button>
    </form>
  );
}
