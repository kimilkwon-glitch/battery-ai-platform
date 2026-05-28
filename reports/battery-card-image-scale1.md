# BATTERY-CARD-IMAGE-SCALE1

**Stamp:** `BM-UX-REV-20260528-BATTERY-CARD-IMAGE-SCALE1`  
**Cache-busting:** `battery-card-image-scale1-20260528`

## 변경 요약

- `battery-image-stage.ts`: inset 축소 + variant별 `scale-[1.5~1.62]` (overflow clip)
- `BatteryImageStage` / `BatteryThumbnail` contain 경로 동기화
- `bm.batteryCardBody`, `btnCardNavy/Secondary/Ghost` — 하단·CTA 압축
- 메인 인기규격·EV·검색 추천·비교·spec focus 카드 적용
- `CtaHierarchy compact` — 검색 fitment 카드 CTA

## 검수 URL (cache-busting)

- https://battery-ai-platform.vercel.app/?_cb=battery-card-image-scale1-20260528
- https://battery-ai-platform.vercel.app/search?q=CMF80L&_cb=battery-card-image-scale1-20260528
- https://battery-ai-platform.vercel.app/search?q=100R%20vs%20AGM95L&_cb=battery-card-image-scale1-20260528
- https://battery-ai-platform.vercel.app/search?q=AGM60L&_cb=battery-card-image-scale1-20260528
- https://battery-ai-platform.vercel.app/compare?_cb=battery-card-image-scale1-20260528
- https://battery-ai-platform.vercel.app/batteries/AGM60L?_cb=battery-card-image-scale1-20260528
- https://battery-ai-platform.vercel.app/batteries/CMF80L?_cb=battery-card-image-scale1-20260528
