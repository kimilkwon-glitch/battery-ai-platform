# Battery Detail ALL — 2026-05-28

**Build stamp:** `BM-UX-REV-20260528-BATTERY-DETAIL-ALL`  
**Hub version:** `20260528-all`

## Summary

`/batteries/[code]` 전 규격에 상품형 상세 허브를 적용했습니다. 핵심 8종(115D31L 제외)은 전용 콘텐츠를 유지하고, 그 외 규격은 `battery-detail-hub-fallback.ts` 공통 템플릿으로 렌더합니다. `BatteryDetailClient` 분기는 제거했습니다.

## 수정 파일

- `build-stamp.json`
- `src/app/batteries/[code]/page.tsx`
- `src/components/battery/BatteryDetailHub.tsx`
- `src/lib/battery-detail/battery-detail-hub-content.ts`
- `src/lib/battery-detail/battery-detail-hub-fallback.ts` (신규)
- `src/lib/battery-detail/core-battery-codes.ts`
- `src/lib/battery-detail/deprioritized-specs.ts`
- `src/lib/vehicleBattery.ts` — related codes에서 115D31 후순위 제외
- `src/lib/search-page-results.ts` — 검색 배터리 카드 115D31 후순위
- `scripts/verify-battery-detail-hub.mjs`
- `scripts/verify-battery-detail-all-production.mjs` (신규)

## 핵심 8개 전용 콘텐츠

| 코드 | 유지 내용 |
|------|-----------|
| AGM60L | 하이브리드/보조 12V |
| AGM70L | 중형/준대형 승용 AGM |
| AGM80L | SUV/디젤/대형 승용 AGM |
| DIN74L | 봉고3/DIN 계열 |
| 100R | 포터2/R타입 |
| CMF80L | CMF80L 표기 보존 |
| AGM95L | 대형 AGM |
| EV 12V | 전기차 보조 12V |

`/batteries/80L`은 CMF80L 전용으로 승격하지 않고 fallback(80L·CMF80L 혼동 안내)만 사용합니다.

## Fallback 템플릿

- Hero: 규격명·타입·용량·CCA·단자 — 미입력 시 `확인 필요` / `차량/브랜드별 확인 필요`
- 이미지 슬롯 3종(제품·장착·라벨) 항상 표시
- 대표 차량 없음 → 준비중 + 사진확인·차량검색 CTA
- 비교 없음 → 사진 확인 후 안내 문구
- 오주문 방지·하단 CTA·모바일 sticky 유지
- 115D31L: fallback 허브 + `주력 비판매·보조` 배지, 검색/related 후순위

## 구버전 UI

- `page.tsx`에서 `BatteryDetailClient` 분기 제거 → 전 페이지 `BatteryDetailHub`

## Local/preview 검수

- `npm run build` — 성공
- `node scripts/verify-battery-detail-hub.mjs http://localhost:3020` — **ALL PASS** (핵심 8 + fallback 8 + 검색/차량/비교 11)

## Production

*(배포 후 아래 섹션 갱신)*
