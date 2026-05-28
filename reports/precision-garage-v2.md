# Precision Garage V2 — Premium polish + compare/guides/vehicle tabs

**Stamp:** `BM-UX-REV-20260528-PRECISION-GARAGE-V2`

## Visual “멋” 강화 (구조 기반)

- **첫인상:** `bm-page-mesh` 그리드·시안 글로우 배경, hero `heroDisplay`/`heroLead`, 검색 `searchInset` 글래스 카드
- **카피:** “차종으로 찾거나, AGM80L처럼 규격명으로 바로 확인하세요.” 메인 hero 강조
- **카드:** `bm-card-surface` inner highlight, `cardPremium`, `reportCard`, fitment 그라데이션 헤더
- **CTA:** Navy primary / Secondary / Ghost / Warning 계층, 파란색 도배 제거
- **모션:** `tab-panel-in`, `motion-safe` hover, reduced-motion 대응

## `/compare` (비교 리포트)

- 리포트 헤더·VS 블록·핵심 차이 — `reportCard` 톤
- **모바일:** 스펙 행별 2열 카드 (`md:hidden`), PC는 표 유지 (`md:block`)
- 추천 조합·피커 — `tabBtn` / `tabBtnActive`
- 다음 단계 — `platformStrip` + `ConversionActions` (navy primary)

**모바일 확인:** 가로 스크롤 표 제거(모바일), 카드형 비교로 읽기 가능

## 가이드 (`/guides`)

- 허브 hero — “불안 제거 센터” 카피·`heroDisplay`
- 사이드 필터 — tab 버튼 톤 통일
- `GuideCard` — premium interactive + navy CTA
- 사진 확인 — secondary, 차량 확인 — navy

**모바일 확인:** 1열 카드 그리드, 터치 영역 44px CTA

## 차량 상세 탭

- 탭 바 — `cardPremium` + `tabBtn`/`tabBtnActive`
- 패널 전환 — `bm-tab-panel` fade
- 호환 판정 — **모바일 카드형** / PC 표
- Q&A 링크 — `cardInteractive` (플랫폼 Q&A 톤)
- `PanelBlock` — `cardPremium`

**모바일 확인:** 탭 가로 스크롤, 판정표 카드 1열, Q&A 카드 터치 영역 확보

## 배터리 상세 모바일

- Hero: CTA·규격 **order-1**, 이미지 슬롯 **order-2** + `max-h-[200px]` (첫 화면 판단 우선)

## 미변경

- 검색/매칭 로직, `/batteries/[code]` 허브 데이터 구조, 이미지 asset

## 검증

```bash
npm run build  # OK
```

Production deploy 후 `BM-UX-REV-20260528-PRECISION-GARAGE-V2` + no-cache curl 권장.
