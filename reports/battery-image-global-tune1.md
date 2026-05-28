# BATTERY-IMAGE-GLOBAL-TUNE1

**Stamp:** `BM-UX-REV-20260528-BATTERY-IMAGE-GLOBAL-TUNE1`  
**Cache-busting:** `battery-image-global-tune1-20260528`

## 변경 요약

### 공통 시스템
- `BatteryProductImage` + `BatteryStagePhoto` — contain·중앙 정렬 단일화
- `battery-image-stage.ts` — stage(card/hero/search/compare) + chip/chipMd/mini/content
- `batteryImageFit()` → 항상 `contain`

### Variant
| Variant | 용도 | 크기 |
|---------|------|------|
| card / search / compare | 상품·검색·비교 카드 | stage 144–168px, 제품 96–98% |
| chip / chipMd | Q&A 배터리 칩 | 36px / 40px, 제품 94% |
| mini | 리스트 썸네일 | 기본 48px (className 확장) |
| content | 가이드 커버 | 160×120 |
| hero | 상세 대표 | 172–192px |

### Q&A
- `BatteryMiniSpecLink` → `BatteryProductImage` chip/chipMd (기존 h-8 32px → h-9 36px, 식별 가능)

## 검수 URL

- https://battery-ai-platform.vercel.app/?_cb=battery-image-global-tune1-20260528
- https://battery-ai-platform.vercel.app/search?q=CMF80L&_cb=battery-image-global-tune1-20260528
- https://battery-ai-platform.vercel.app/search?q=100R%20vs%20AGM95L&_cb=battery-image-global-tune1-20260528
- https://battery-ai-platform.vercel.app/search?q=AGM60L&_cb=battery-image-global-tune1-20260528
- https://battery-ai-platform.vercel.app/compare?_cb=battery-image-global-tune1-20260528
- https://battery-ai-platform.vercel.app/batteries/AGM60L?_cb=battery-image-global-tune1-20260528
- https://battery-ai-platform.vercel.app/batteries/CMF80L?_cb=battery-image-global-tune1-20260528
- https://battery-ai-platform.vercel.app/community?_cb=battery-image-global-tune1-20260528
- https://battery-ai-platform.vercel.app/guides?_cb=battery-image-global-tune1-20260528
