/** 메인/목록 페이지 노출 개수 — 운영 데이터 증가 대응 */

export const CONTENT_DISPLAY_LIMITS = {
  /** 메인 혜택 캐러셀 최대 노출 */
  mainBenefits: 4,
  /** 메인 후기 섹션 최대 노출 */
  mainReviews: 6,
  /** 혜택 페이지 1회 로드 */
  benefitsPageSize: 12,
  /** 리뷰 페이지 1회 로드 */
  reviewsPageSize: 12,
  /** 관리자 목록 기본 페이지 크기 */
  adminListPageSize: 20,
} as const;
