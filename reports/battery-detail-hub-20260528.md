# Battery Detail Hub — 2026-05-28

**Build stamp:** `BM-UX-REV-20260528-BATTERY-DETAIL-HUB`

## Summary

AGM60L을 기준 템플릿으로 핵심 9개 배터리 상세(`/batteries/[code]`)를 **상품형 Hero + 규격 허브 + 오주문 방지 + CTA** 구조로 통일했습니다.

## Modified files

| File | Role |
|------|------|
| `build-stamp.json` | Stamp bump |
| `src/lib/battery-detail/core-battery-codes.ts` | 9규격 목록 |
| `src/lib/battery-detail/battery-detail-hub-content.ts` | 규격별 카피·차량·비교·주의 |
| `src/components/battery/BatteryDetailHub.tsx` | 허브 UI (A~G 섹션 + sticky) |
| `src/components/battery/BatteryDetailClient.tsx` | 핵심 9 → Hub, 그 외 기존 UI |
| `src/lib/media/image-slot-registry.ts` | `BATTERY_DETAIL_IMAGE_SLOTS` |
| `src/lib/battery-cta.ts` | 택배·매장 CTA 라벨 |
| `src/app/batteries/[code]/page.tsx` | `noStore()` |
| `scripts/verify-battery-detail-hub.mjs` | 로컬/프로덕션 검수 |

## 9규격 요약

| Code | 포지셔닝 | 대표 차량(카드) | 비교 카드 |
|------|----------|-----------------|-----------|
| AGM60L | 하이브리드 보조 12V AGM | 스포티지 NQ5, K8, 쏘렌토 MQ4, 싼타페 MX5 HEV | AGM70L, EV 12V, DIN74L |
| AGM70L | 중형 ISG AGM | 그랜저 IG 가솔린, K5, 쏘나타 | AGM80L, AGM60L, DIN74L |
| AGM80L | SUV·디젤 ISG | 쏘렌토 MQ4 디젤, 그랜저 IG 디젤, 팰리세이드 | AGM70L, CMF80L, AGM95L |
| DIN74L | 유럽형 DIN | 봉고3 | AGM70L, DIN62L, 100R |
| 100R | 포터2 2020~ R타입 | 포터2 연식 분기 | 90R, CMF100R, AGM95L |
| CMF80L | CMF 표기 보존 | 스타리아 디젤 | AGM80L, CMF90L, CMF100R |
| 115D31L | JIS 대용량 L | DB 보강 | 100R, 115D31R, AGM95L |
| AGM95L | 대형 AGM | DB 보강 | AGM80L, 100R, 115D31L |
| EV 12V | EV 보조 12V (메인 아님) | 아이오닉5, EV6 | AGM60L, AGM80L |

## 이미지 슬롯 (규격당 3종)

| Slot | 비율 | assetKey 예 | 연결 경로 예 |
|------|------|-------------|--------------|
| 제품 대표 | 4:3 | `battery.detail.product.AGM60L` | `/media/slots/battery-detail/AGM60L-product.jpg` |
| 장착 예시 | 16:9 | `battery.detail.install.AGM60L` | `...-install.jpg` |
| 라벨·단자 | 4:3 | `battery.detail.label.AGM60L` | `...-label.jpg` |

Hero는 `BatteryImageOrSlot` — 실사 있으면 표시, 없으면 슬롯.

## 오주문 방지 · CTA

- 단자/라벨/AGM·DIN·CMF 혼동, 연식·연료, EV 보조 vs 메인 등 규격별 bullet
- CTA: 택배 주문하기, 사진으로 최종 확인, 내 차량 기준으로 확인, 부산 매장/출장 문의
- 모바일 sticky 3버튼 (택배 / 사진 / 내 차 검색)

## Local verify

```bash
npm run build
PORT=3001 npm run start
BASE_URL=http://localhost:3001 node scripts/verify-battery-detail-hub.mjs
```

Result: **21/21 PASS** (9 battery + 9 search + 3 regression)

## Production

_(배포 후 아래 섹션을 채웁니다)_

- GitHub main commit:
- Vercel deployment:
- Alias:
- Production curl:

## Remaining improvements

- 115D31L·AGM95L 대표 차량 DB 카드 자동 보강
- `public/media/slots/battery-detail/` 실사 업로드
- Next.js middleware → proxy 마이그레이션 (deprecation warning)
