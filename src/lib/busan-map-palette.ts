import type { BusanStoreId } from "@/lib/busan-store-matcher";

/** 지도 SVG 좌표계 — 화면에서는 width 100%로 확대 표시 */
export const BUSAN_MAP_WIDTH = 760;
export const BUSAN_MAP_HEIGHT = 580;
export const BUSAN_MAP_VIEWBOX = `0 0 ${BUSAN_MAP_WIDTH} ${BUSAN_MAP_HEIGHT}`;

export const BUSAN_MAP_PALETTE = {
  deokcheon: {
    fill: "#60a5fa",
    fillHover: "#3b82f6",
    stroke: "#1d4ed8",
  },
  hakjang: {
    fill: "#4ade80",
    fillHover: "#22c55e",
    stroke: "#15803d",
  },
  neutral: {
    fill: "#e2e8f0",
    fillHover: "#cbd5e1",
    stroke: "#94a3b8",
  },
} as const;

export const BUSAN_MAP_SOURCE_ATTRIBUTION =
  "행정 경계 안내용 참고 지도이며, 실제 거리·경계와 다를 수 있습니다.";

export const BUSAN_MAP_DISCLAIMER =
  "안내용 권역 지도이며 실제 행정 경계·거리와 다를 수 있습니다. 가까운 직영점 기준으로 우선 안내하며, 일정과 현장 상황에 따라 조정될 수 있습니다.";

export type BusanMapPin = { x: number; y: number; label: string };

export function pinsForStores(
  storeCentroids: Partial<Record<BusanStoreId, { x: number; y: number }>>,
): Record<BusanStoreId, BusanMapPin> {
  return {
    deokcheon: {
      x: storeCentroids.deokcheon?.x ?? 380,
      y: storeCentroids.deokcheon?.y ?? 190,
      label: "덕천점",
    },
    hakjang: {
      x: storeCentroids.hakjang?.x ?? 290,
      y: storeCentroids.hakjang?.y ?? 360,
      label: "학장점",
    },
  };
}
