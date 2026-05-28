# DESIGN-MOBILE-V2 완료 보고서

**Build stamp:** `BM-UX-REV-20260528-DESIGN-MOBILE-V2`  
**Cache-busting query:** `design-mobile-v2-20260528`

## 1. 수정한 핵심 파일

- `src/app/globals.css` — 섹션 타이포, mesh/grid, page-enter
- `src/lib/design-tokens.ts` — `sectionTitle`, `sectionHead`, `sectionBlock`, `rankCard`
- `src/components/common/SectionHeader.tsx`
- `src/components/home/HomePopularBatteryRanking.tsx`
- `src/components/home/HomePopularVehicleSearch.tsx`
- `src/components/home/HomePlatformHero.tsx`, `HomePopularQna.tsx`
- `src/app/page.tsx`
- `src/components/platform/RecommendedBatteryCard.tsx`
- `src/components/battery/BatteryDetailHub.tsx`
- `src/components/qna/RelatedQnaSection.tsx`
- `src/components/platform/CompareClient.tsx`, `CommunityClient.tsx`
- `src/components/common/GuideCard.tsx`
- `src/app/community/[id]/page.tsx`, `src/app/vehicle/[slug]/page.tsx`
- `build-stamp.json`, `src/lib/build-stamp.ts`, `src/app/layout.tsx`
- `scripts/probe-production-*.mjs`, `scripts/verify-precision-garage-v1.mjs`

## 2–10. 제목 폰트 흐릿함

| 항목 | 내용 |
|------|------|
| 원인 | `font-heading`(GmarketSans) + `font-black`(900) — 실제 로드 weight는 300/500/700만 존재 → synthetic bold |
| 문제 font-family | GmarketSans (`--font-heading`) |
| 문제 font-weight | 900 (`font-black`) |
| 동일 스타일 섹션 | 메인 `SectionHeader` 전 섹션, `HomePopularQna`, `RelatedQnaSection`, `PageShell` `titleLg`/`titleMd`, `CompareClient` 하단, `CommunityClient` H1, 가이드/차량/Q&A 페이지 제목 |
| 최종 font-family | Pretendard (`--font-section`, `.bm-section-title`) |
| 최종 font-weight | 700 (`font-bold` / CSS `font-weight: 700`) |
| synthetic bold 제거 | 예 — 섹션 제목에서 GmarketSans 900 제거 |
| transform/filter/gradient 등 | 예 — 제목에 gradient/transform/filter/text-shadow/opacity 미사용 |
| 배경 grid 겹침 | 예 — mesh grid opacity·offset 조정, `.bm-section-head` solid surface |

## 11–12. 많이 찾는 배터리 규격

- 이중 `card`+`cardInteractive` 중첩 제거 → `sectionBlock` + `rankCard`
- `overflow-hidden` on outer section 제거 → 잘림 완화
- 이미지 `tall` 180px → 120–130px 고정 높이
- 파란 점/잔상: mesh grid(32px blue line)가 제목·설명 아래에 노출 + 과한 primary badge — grid offset/opacity 조정, badge gray 통일, `sectionHead` 배경

## 13. 메인 첫 화면

- hero–다음 섹션 `space-y-6/7`, hero `mb-1`
- hero H1 Pretendard 700 선명도
- 검색 inset·CTA 계층 유지 (navy primary, ghost 보조)

## 14–18. 기타 페이지

- 검색 카드: 모바일 이미지 120px, CTA footer 유지
- 배터리 상세: 모바일 이미지 슬롯 120–140px
- compare: 리스트 bullet 색 accent → neutral
- Q&A/community/guides/vehicle: `sectionTitle` 통일, RelatedQna CTA navy+ghost

## 19. Viewport

390px, 430px, 768px — 로컬 build 통과, 배포 후 production HTML 검증 예정

## 20–24. Build stamp (배포 후 기입)

배포 스크립트 실행 후 `probe-production-stamp.mjs` 결과로 갱신

## 25. 검수용 cache-busting URL

아래 「검수용 링크 목록」 참조
