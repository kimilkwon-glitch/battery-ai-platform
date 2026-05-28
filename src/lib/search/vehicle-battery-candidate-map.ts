/**
 * 2순위 폴백 — vehicle-battery-db.json 조회 실패 시에만 사용 (확정 추천 아님)
 * 1순위 DB 조회는 resolve-vehicle-battery-spec.ts
 */
export type VehicleBatteryCandidateEntry = {
  displayName: string;
  primaryCandidates: string[];
  candidateLabel: string;
  caution: string;
  confidenceLabel: string;
  confirmRequired: boolean;
};

export const vehicleBatteryCandidateMap: Record<string, VehicleBatteryCandidateEntry> = {
  "kia-sorento-mq4-hybrid": {
    displayName: "기아 쏘렌토 MQ4 하이브리드",
    primaryCandidates: ["AGM60L"],
    candidateLabel: "대표 확인 후보",
    caution:
      "하이브리드는 연식·트림·현재 장착 배터리를 함께 보는 것이 좋습니다.",
    confidenceLabel: "후보",
    confirmRequired: true,
  },
  "hyundai-santafe-mx5-hybrid": {
    displayName: "현대 싼타페 MX5 하이브리드",
    primaryCandidates: ["AGM60L"],
    candidateLabel: "대표 확인 후보",
    caution:
      "하이브리드는 연식·트림·현재 장착 배터리를 함께 보는 것이 좋습니다.",
    confidenceLabel: "후보",
    confirmRequired: true,
  },
  "kia-sportage-nq5-hybrid": {
    displayName: "기아 스포티지 NQ5 하이브리드",
    primaryCandidates: ["AGM60L"],
    candidateLabel: "대표 확인 후보",
    caution:
      "하이브리드는 연식·트림·현재 장착 배터리를 함께 보는 것이 좋습니다.",
    confidenceLabel: "후보",
    confirmRequired: true,
  },
  "kia-k8-hybrid": {
    displayName: "기아 K8 하이브리드",
    primaryCandidates: ["AGM60L"],
    candidateLabel: "대표 확인 후보",
    caution: "하이브리드 차량은 연식·트림·현재 장착 배터리 기준으로 최종 확인이 필요합니다.",
    confidenceLabel: "후보",
    confirmRequired: true,
  },
  "hyundai-grandeur-gn7-hybrid": {
    displayName: "현대 그랜저 GN7 하이브리드",
    primaryCandidates: ["AGM60L"],
    candidateLabel: "대표 확인 후보",
    caution: "하이브리드 차량은 연식·트림·현재 장착 배터리 기준으로 최종 확인이 필요합니다.",
    confidenceLabel: "후보",
    confirmRequired: true,
  },
  "hyundai-tucson-nx4-hybrid": {
    displayName: "현대 투싼 NX4 하이브리드",
    primaryCandidates: ["AGM60L"],
    candidateLabel: "대표 확인 후보",
    caution: "하이브리드 차량은 연식·트림·현재 장착 배터리 기준으로 최종 확인이 필요합니다.",
    confidenceLabel: "후보",
    confirmRequired: true,
  },
  "kia-ev6-cv": {
    displayName: "기아 EV6",
    primaryCandidates: ["EV 12V"],
    candidateLabel: "추천 규격",
    caution: "EV 보조 12V는 트림·순정 규격을 함께 보는 것이 좋습니다. 사진 확인을 권장합니다.",
    confidenceLabel: "EV 보조배터리",
    confirmRequired: true,
  },
  "hyundai-ioniq5-ne": {
    displayName: "현대 아이오닉5",
    primaryCandidates: ["EV 12V"],
    candidateLabel: "추천 규격",
    caution: "EV 보조 12V는 트림·순정 규격을 함께 보는 것이 좋습니다. 사진 확인을 권장합니다.",
    confidenceLabel: "EV 보조배터리",
    confirmRequired: true,
  },
};

export { resolveVehicleBatteryCandidates } from "@/lib/search/resolve-vehicle-battery-spec";
