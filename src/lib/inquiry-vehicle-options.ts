import { vehicleAssets } from "@/lib/car-assets";

/** 상품 문의 모달 — 차량 선택(선택사항) */
export const INQUIRY_VEHICLE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "차량을 선택해 주세요 (선택사항)" },
  ...[...vehicleAssets]
    .filter((a) => a.displayName && !a.recommendExcluded)
    .map((a) => ({
      value: a.displayName,
      label: a.displayName,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "ko")),
];
