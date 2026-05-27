/** 화면용 fallback 문구 — 개발자 용어 없이 자연스러운 안내 */

export type FallbackKey =
  | "vehicleData"
  | "batteryData"
  | "locationData"
  | "guideData"
  | "qaData"
  | "symptomData"
  | "photoAnalysis"
  | "searchEmpty"
  | "imageMissing"
  | "trendData"
  | "brandData";

export const FALLBACK_MESSAGES: Record<
  FallbackKey,
  { title: string; body: string; ctaLabel?: string; ctaHref?: string }
> = {
  vehicleData: {
    title: "차량 정보 확인 중",
    body: "이 차량은 아직 세부 연식/연료별 정보가 부족합니다. 정확한 확인을 위해 현재 장착된 배터리 사진을 함께 확인하는 것을 권장합니다.",
    ctaLabel: "배터리 사진으로 확인",
    ctaHref: "/analysis/photo",
  },
  batteryData: {
    title: "배터리 규격 정보 확인 중",
    body: "해당 규격의 상세 제품 정보가 아직 등록되지 않았습니다. 차량 정보와 현재 장착 배터리 사진으로 다시 확인해 주세요.",
    ctaLabel: "규격 문의",
    ctaHref: "/ai",
  },
  locationData: {
    title: "작업 가능점 정보 확인 중",
    body: "선택하신 지역의 작업 가능점 정보가 아직 부족합니다. 규격 문의 또는 사진 분석으로 먼저 확인해 주세요.",
    ctaLabel: "작업 가능점 전체 보기",
    ctaHref: "/service-center",
  },
  guideData: {
    title: "가이드 준비 중",
    body: "해당 주제의 가이드 콘텐츠가 아직 등록되지 않았습니다. 관련 Q&A 또는 규격 비교에서 먼저 확인해 보세요.",
    ctaLabel: "가이드 허브",
    ctaHref: "/guides",
  },
  qaData: {
    title: "Q&A 준비 중",
    body: "아직 등록된 답변이 없습니다. 규격 문의 페이지에서 질문을 남기거나 사진으로 확인해 주세요.",
    ctaLabel: "규격 문의",
    ctaHref: "/ai",
  },
  symptomData: {
    title: "증상 정보 확인 중",
    body: "해당 증상에 대한 상세 진단 정보가 아직 부족합니다. 차량 정보와 배터리 사진을 함께 확인하는 것을 권장합니다.",
    ctaLabel: "증상 진단 시작",
    ctaHref: "/diagnosis",
  },
  photoAnalysis: {
    title: "사진 분석 보조 안내",
    body: "현재 사진 분석 결과는 규격 확인을 돕기 위한 예시/보조 정보입니다. 최종 확인은 차량 정보와 현재 장착 배터리 사진을 함께 보는 것이 가장 정확합니다.",
    ctaLabel: "차량으로 확인",
    ctaHref: "/vehicles",
  },
  searchEmpty: {
    title: "검색 결과 없음",
    body: "검색 결과가 없습니다. 차량명, 연식, 연료 또는 현재 장착된 배터리 사진으로 다시 확인해 주세요.",
    ctaLabel: "배터리 사진 분석",
    ctaHref: "/analysis/photo",
  },
  imageMissing: {
    title: "이미지 준비 중",
    body: "해당 이미지가 아직 등록되지 않았습니다. 규격명 또는 차량명으로 다시 검색해 주세요.",
  },
  trendData: {
    title: "인기 정보 확인 중",
    body: "최근 인기·주의 항목 정보가 아직 부족합니다. 배터리 규격 검색으로 먼저 확인해 보세요.",
    ctaLabel: "통합 검색",
    ctaHref: "/search",
  },
  brandData: {
    title: "브랜드 정보 확인 중",
    body: "해당 브랜드의 상세 정보가 아직 등록되지 않았습니다. 대표 규격 검색으로 확인해 주세요.",
    ctaLabel: "브랜드 허브",
    ctaHref: "/brands",
  },
};

export function getFallback(key: FallbackKey) {
  return FALLBACK_MESSAGES[key];
}
