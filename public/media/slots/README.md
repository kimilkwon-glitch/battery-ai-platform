# 이미지 슬롯 실사 연결 가이드

검색·매장 UI의 `MediaImageSlot`은 아래 경로에 파일을 두면 자동으로 표시됩니다.
파일이 없으면 “이미지 준비중” placeholder가 노출됩니다.

## 검색 — 배터리

- `search/battery/{CODE}-main.jpg` — 예: `AGM60L-main.jpg`
- `search/battery/{CODE}-install.jpg` — 장착 예시

## 검색 — 차량

- 차량별 경로는 `image-slot-registry.ts`의 `vehicleCard` 슬롯에 `srcPath` 추가 후 연결

## 검색 — 증상

- `search/symptom/discharge-check.jpg`
- `search/symptom/blackbox.jpg`, `parasitic.jpg`, `parking.jpg`, `aging.jpg`

## 검색 — 서비스

- `search/service/outbound-field.jpg`
- `search/service/store-deokcheon.jpg`, `store-hakjang.jpg`

레지스트리: `src/lib/media/image-slot-registry.ts`
