# Design QA V1 — 2026-05-28

## 확인한 페이지 (production 기준)

| URL | 비고 |
|-----|------|
| `/` | 메인 검색·혜택 캐러셀·라인업 |
| `/batteries/AGM95L` | 상세 단순화·주문 영역 |
| `/vehicle/k3-bd` | 차량 상세 (라우트 존재 시) |
| `/compare` | 배터리 업그레이드 |
| `/brands` | 브랜드 zone |
| `/service-center` | 매장·지도 zone |
| `/guides`, `/guide/*` | 가이드 4종 |
| `/reviews` | 리뷰 zone |
| `/support` | 고객센터 zone |
| `/login`, `/signup` | auth zone |
| `/admin/inquiries` | 운영 임시 |
| `/shop` | 직접 접근 |

## 발견·수정 항목

- 페이지별 타이틀/설명 위계 불일치 → `PageShell` + `zone` 헤더 라인
- 혜택/리뷰/가이드/고객센터 포인트 컬러 없음 → `design-system-qa.css` 역할별 토큰
- 탭·필터 스타일 제각각 → `bm-tab-rail` 통일
- 카드 hover/radius/shadow 불일치 → `bm-card-unified`
- Floating 버튼 크기·패널 불일치 → `bm-floating-*`
- 고객센터/리뷰 중복 H1 → PageShell로 통합

## 색상 시스템

- 메인 CTA: navy/blue (기존 `--bm-*`)
- 혜택: amber/orange (`--color-accent-benefit`)
- 리뷰: teal/mint (`--color-accent-review`)
- 가이드: indigo (`--color-accent-guide`)
- 고객센터: slate/blue-gray
- 덕천점: blue / 학장점: green

## 검색 로직

**변경 없음**

## 남은 리스크

- 클라이언트 컴포넌트(메가메뉴·캐러셀)는 HTML probe에 일부만 반영
- `/guides/knowledge/*` 등 레거시 URL 스타일은 최소 변경
- 혜택 PNG 미등록 시 placeholder 유지
