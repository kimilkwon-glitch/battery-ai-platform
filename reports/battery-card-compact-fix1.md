# BATTERY-CARD-COMPACT-FIX1

**Stamp:** `BM-UX-REV-20260528-BATTERY-CARD-COMPACT-FIX1`  
**Cache-busting:** `battery-card-compact-fix1-20260528`

## 원인

`origin-bottom scale-[1.55]` + `overflow-hidden` → 상·하단 클립

## 수정

1. **이미지:** CSS scale 제거 → `h-[94%] w-[97%]` + `object-contain object-center` + stage 높이 소폭 증가
2. **하단:** `batteryCardBody` gap/padding 추가 축소, 버튼 `min-h-[36px]`
3. **검색/비교/메인/EV** 동일 stage 토큰 적용

## 검수 URL

- https://battery-ai-platform.vercel.app/?_cb=battery-card-compact-fix1-20260528
- https://battery-ai-platform.vercel.app/search?q=CMF80L&_cb=battery-card-compact-fix1-20260528
- https://battery-ai-platform.vercel.app/search?q=100R%20vs%20AGM95L&_cb=battery-card-compact-fix1-20260528
- https://battery-ai-platform.vercel.app/search?q=AGM60L&_cb=battery-card-compact-fix1-20260528
- https://battery-ai-platform.vercel.app/compare?_cb=battery-card-compact-fix1-20260528
- https://battery-ai-platform.vercel.app/batteries/AGM60L?_cb=battery-card-compact-fix1-20260528
- https://battery-ai-platform.vercel.app/batteries/CMF80L?_cb=battery-card-compact-fix1-20260528
