"use client";

import Link from "next/link";
import { useState } from "react";
import { BatteryGallery } from "@/components/BatteryGallery";
import { BatteryAutoDiscountHint } from "@/components/benefits/BatteryAutoDiscountHint";
import { parseBatterySpecDisplay } from "@/lib/battery-spec-display";
import { getBatteryImageSet } from "@/lib/battery-alias-map";
import { batteryImageSetForCode } from "@/lib/battery-image";
import { bm } from "@/lib/design-tokens";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import {
  BATTERY_RETURN_OPTIONS,
  type BatteryReturnOption,
} from "@/lib/shop-order-types";
import { getBattery, getBrand, getVehicleName, type ShopProduct } from "@/lib/platform-data";

function typeLabel(product: ShopProduct): string {
  const t = product.type.toUpperCase();
  if (t.includes("AGM")) return "AGM";
  if (t.includes("DIN")) return "DIN";
  if (t.includes("EV")) return "EV 보조 12V";
  if (t.includes("CMF")) return "일반형(CMF)";
  return "일반형";
}

export function ShopProductOrderPanel({
  product,
  onClose,
}: {
  product: ShopProduct;
  onClose?: () => void;
}) {
  const [returnOption, setReturnOption] = useState<BatteryReturnOption>("return");
  const b = getBattery(product.batteryCode, product.brandId);
  const brand = getBrand(product.brandId);
  const imageSet =
    product.brandId === "rocket"
      ? b.images?.main
        ? b.images
        : batteryImageSetForCode(product.batteryCode)
      : getBatteryImageSet(product.batteryCode, "solite");
  const parsed = parseBatterySpecDisplay(product.batteryCode);
  const metaVehicles = product.vehicleIds.slice(0, 4).map(getVehicleName).join(", ");

  const inquiryHref = `/ai?topic=shop&code=${encodeURIComponent(product.batteryCode)}&return=${returnOption}`;
  const detailHref = `/batteries/${encodeURIComponent(product.batteryCode)}`;

  return (
    <section
      className="shop-order-panel rounded-2xl border border-slate-200 bg-white shadow-md ring-1 ring-slate-100"
      id="shop-order-panel"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-blue-600">주문하기</p>
          <h2 className="text-lg font-black text-slate-950">{product.batteryCode}</h2>
          <p className="text-xs font-bold text-slate-600">
            {brand.displayName} · {typeLabel(product)} · {product.capacity} · {product.cca} · {product.terminal}타입
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700"
          >
            닫기
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:p-5">
        <BatteryGallery
          code={product.batteryCode}
          imageSet={imageSet?.main ? imageSet : undefined}
          minHeightClass="min-h-[200px] sm:min-h-[240px]"
        />

        <div className="space-y-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <dt className="font-bold text-slate-400">규격명</dt>
              <dd className="font-black text-slate-900">{product.batteryCode}</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-400">브랜드</dt>
              <dd className="font-black text-slate-900">{brand.displayName}</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-400">용량</dt>
              <dd className="font-semibold text-slate-800">{product.capacity}</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-400">CCA</dt>
              <dd className="font-semibold text-slate-800">{product.cca}</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-400">단자</dt>
              <dd className="font-semibold text-slate-800">
                {product.terminal}타입 ({parsed.terminalLabel ?? "확인"})
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-400">타입</dt>
              <dd className="font-semibold text-slate-800">{typeLabel(product)}</dd>
            </div>
          </dl>

          {metaVehicles ? (
            <p className="text-xs font-semibold text-slate-600">
              <span className="font-black text-slate-500">적용 예시: </span>
              {metaVehicles}
            </p>
          ) : null}

          <BatteryAutoDiscountHint />

          <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3">
            <p className="text-xs font-black text-slate-900">폐배터리 반납 여부를 선택하세요</p>
            <p className="mt-1 text-[10px] font-semibold text-slate-500">
              가격은 주문 상담 시 안내드립니다.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {BATTERY_RETURN_OPTIONS.map((opt) => {
                const selected = returnOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setReturnOption(opt.id)}
                    className={`rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-blue-400 bg-white shadow-sm ring-2 ring-blue-200"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <p className="text-sm font-black text-slate-900">{opt.label}</p>
                    <p className="mt-1 text-[10px] font-semibold leading-snug text-slate-600">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link href={inquiryHref} className={`${bm.btnPrimary} inline-flex justify-center text-sm`}>
              택배주문 문의하기
            </Link>
            <Link href={HUB_STORE_DETAIL} className={`${bm.btnSecondary} inline-flex justify-center text-sm`}>
              매장·출장 안내
            </Link>
            <Link
              href={detailHref}
              className="inline-flex justify-center text-xs font-bold text-slate-500 hover:text-blue-700 hover:underline"
            >
              규격 상세 보기
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-600 sm:grid-cols-3 sm:px-5">
        <p>
          <span className="font-black text-slate-800">배송: </span>
          택배 발송 전 규격·단자·차종을 다시 확인합니다.
        </p>
        <p>
          <span className="font-black text-slate-800">회수: </span>
          반납 선택 시 폐배터리 회수 일정을 안내합니다.
        </p>
        <p>
          <span className="font-black text-slate-800">오주문 방지: </span>
          L/R·연식·ISG 여부를 주문 전 체크리스트로 확인하세요.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3 sm:px-5">
        <Link href="/order-checklist" className="text-[11px] font-bold text-blue-700 hover:underline">
          주문 전 체크리스트 →
        </Link>
      </div>
    </section>
  );
}
