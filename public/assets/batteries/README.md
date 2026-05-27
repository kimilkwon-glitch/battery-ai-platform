# 로케트(ROCKET) 배터리 실사 이미지

경로: `/assets/batteries/{PRODUCT_CODE}/` (코드에서 `/public` 접두사 사용 금지)

## 폴더 구조

각 `{PRODUCT_CODE}` 폴더:

- `01-main.png|jpg` — 대표 썸네일
- `02-product-box.*` … `07-front-label.*`
- `08-product-angle.*` (선택)
- `image-mapping.json` (선택)

## 코드 연결

`src/lib/rocket-battery-images.ts` — 실제 파일명·확장자 기준 imageSet  
`src/lib/platform-catalog.ts` — `brandId: "rocket"` 품목에 자동 연결

## 브랜드 규칙

- 이 asset은 **로케트 전용**. 쏠라이트·델코·바르타·한국AT UI에 사용 금지.
- L/R 코드 혼용 금지 (예: AGM95L ≠ AGM95R).

## 이미지 없는 규격

`DIN74L`, `AGM92Ah` 등 폴더 없음 → 기존 gradient fallback 유지.
