# ASSET-VISUAL-V1 완료 보고서

**Build stamp:** `BM-UX-REV-20260528-ASSET-VISUAL-V1`  
**Cache-busting:** `asset-visual-v1-20260528`

## Asset 인벤토리

| 폴더 | 파일 수 | 비고 |
|------|---------|------|
| `public/assets/batteries` | 36 folders / 253 files | rocket/solite 브랜드별 01-main 등 |
| `public/assets/cars` | 72 PNG | hyundai/kia 세대별 |
| `public/assets/content` | 29 PNG | 가이드·증상·Q&A 썸네일 (workbench 연동) |
| `public/assets/guides` | 0 | — |
| `public/assets/qna` | 0 | content 폴더 사용 |
| `public/media/slots` | 0 | phantom 경로만 정의됨 (미사용 파일) |

## 원인

`MediaImageSlot`이 `srcPath: /media/slots/...` phantom URL만 사용 → 실제 `/assets/batteries`, `/assets/cars`, `/assets/content` 무시.

## 해결

- `resolve-asset-image.ts` — 배터리·차량·Q&A 슬롯·질문 ID → 실 URL
- `MediaImageSlot` — phantom 경로 무시, resolver 우선, contain/lazy/onError fallback
- `BatteryCardImage` / `VehicleCardImage` — 메인·검색 카드용
- `BatteryImageOrSlot` — 상세 hero·사진 슬롯 (기존 로직 유지)

## 연결된 핵심 규격 (메인·상세·검색)

AGM60L, AGM70L, AGM80L, AGM95L, CMF80L, CMF100R/100R, CMF90R/90R, DIN74L→GB57820, EV 12V→AGM70L

## 연결된 차량 (메인 인기 검색 slug)

porter2-new, grandeur-ig, sorento-mq4, sportage-nq5, k8-gl3, staria-us4 등 `car-assets` 매핑

## Q&A/가이드 썸네일

`public/assets/content` 29종 + `contentWorkbench` imagePath + 질문 ID 매핑 (`q-blackbox`, `q-porter2-year` 등)

## Placeholder 유지

매장/출장/택배 실사 (`/media/slots/home/store`, `outbound` 등) — 파일 없음, 의도적 placeholder
