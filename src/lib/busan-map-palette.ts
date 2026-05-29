import type { BusanStoreId } from "@/lib/busan-store-matcher";

export const BUSAN_MAP_WIDTH = 520;
export const BUSAN_MAP_HEIGHT = 420;
export const BUSAN_MAP_VIEWBOX = `0 0 ${BUSAN_MAP_WIDTH} ${BUSAN_MAP_HEIGHT}`;

export const BUSAN_MAP_PALETTE = {
  deokcheon: {
    fill: "#3b82f6",
    stroke: "#2563eb",
  },
  hakjang: {
    fill: "#0d9488",
    stroke: "#0f766e",
  },
  neutral: {
    fill: "#cbd5e1",
    stroke: "#94a3b8",
  },
} as const;

export const BUSAN_MAP_SOURCE_ATTRIBUTION =
  "행정동 경계: Local_HangJeongDong (vuski/admdongkor 기반)";

export const BUSAN_MAP_DISCLAIMER =
  "안내용 권역 지도이며 실제 행정 경계·거리와 다를 수 있습니다. 가까운 직영점 기준으로 우선 안내하며, 일정과 현장 상황에 따라 조정될 수 있습니다.";

export type BusanMapPin = { x: number; y: number; label: string };

export function pinsForStores(
  storeCentroids: Partial<Record<BusanStoreId, { x: number; y: number }>>,
): Record<BusanStoreId, BusanMapPin> {
  return {
    deokcheon: {
      x: storeCentroids.deokcheon?.x ?? 260,
      y: storeCentroids.deokcheon?.y ?? 140,
      label: "덕천점",
    },
    hakjang: {
      x: storeCentroids.hakjang?.x ?? 200,
      y: storeCentroids.hakjang?.y ?? 260,
      label: "학장점",
    },
  };
}
