# 차량 실사 PNG 가이드

## 핵심 (asset 품질)

카드는 **`#ffffff`** (`bg-white`) 입니다.

차량 주변에 사각 경계가 보이면 **CSS가 아니라 PNG 배경 픽셀** 때문인 경우가 대부분입니다.

### 근본 해결 (택 1)

1. **완전 transparent PNG** — 차량만 남기고 alpha export
2. **카드와 동일 배경** — export 배경을 정확히 `#ffffff`

remove.bg 등으로 회색이 남은 PNG는 화이트 카드와 미묘하게 어긋납니다.

## UI (코드) — 적용 범위 분리

| 영역 | 썸네일 배경 |
|------|-------------|
| 차량 카드 (`VehicleThumbnail`) | `bg-transparent` |
| 배터리 카드 (`BatteryThumbnail`) | `bg-[#f5f7fa]` (`batteryThumbSurface`) |
| 최신 콘텐츠 (`BatteryContentThumb`) | `rounded-xl bg-[#f5f7fa]` |

차량만 transparent/화이트 카드 톤, 배터리·콘텐츠는 회색 썸네일 면 유지.

## 파일명

- underscore: `grandeur_ig.png`
- 경로: `/assets/cars/hyundai/{imageFile}`
