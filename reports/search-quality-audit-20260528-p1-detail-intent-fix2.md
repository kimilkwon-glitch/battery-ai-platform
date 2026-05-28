# 검색 품질 재감사 (P1 2차 FIX2 · Hybrid Hero + Stamp)

1. **검사 일시:** 2026-05-28 12:49 KST
2. **Production URL:** https://battery-ai-platform.vercel.app
3. **Build stamp:** `BM-UX-REV-20260528-P1-DETAIL-INTENT-FIX2`
4. **검색 29건 flags:** **0**
5. **Stamp route 12건:** **12/12 PASS**
6. **Hybrid chain 2건:** **2/2 PASS**
7. **원시 JSON:** `reports/search-quality-audit-p1-detail-intent-fix2-raw.json`

---

## 실사이트 불일치 원인 (FIX2)

| 이슈 | 원인 | 조치 |
|------|------|------|
| 하이브리드 상단 카드 없음 | DB에 하이브리드 연료 row 없음 + `mergeOperatorFuelGroups`가 **없는 연료만** 추가해 hero에 미반영 | `buildFuelHeroCardGroups` — operator 연료 **주입·정렬·highlight 우선** |
| route별 stamp 혼재 | Vercel/CDN·일부 route의 **구버전 HTML 캐시** (HYBRID-INTENT, PORTER-FIX) | root `layout` **force-dynamic** + `Cache-Control: no-store` + stamp **FIX2** |

---

## 수정 파일

| 파일 | 변경 |
|------|------|
| `build-stamp.json` | `BM-UX-REV-20260528-P1-DETAIL-INTENT-FIX2` |
| `src/lib/vehicle-fuel-primary-battery.ts` | `mergeOperatorFuelGroups` 기존 라벨 operator 덮어쓰기 · `buildFuelHeroCardGroups` |
| `src/components/vehicle/VehicleBatteryHeroCards.tsx` | hero 카드 빌더 사용 |
| `src/components/battery/FuelBatterySpecCard.tsx` | `data-fuel-hero` / `data-battery-hero` (audit용) |
| `src/app/layout.tsx` | `dynamic` / `revalidate` / `fetchCache` |
| `next.config.ts` | 전 route `Cache-Control: no-store` |
| `scripts/search-quality-audit.mjs` | stamp 12 route · hybrid chain 2건 검사 |

**유지:** 포터2 이중 후보 · 레이 증상 · 봉고3 · 100R vs AGM95L (회귀 없음)

---

## 1. 하이브리드 vehicle 상세 (after)

### `/vehicle/sportage-nq5?fuel=하이브리드`

| 항목 | production HTML |
|------|-----------------|
| fuel hero | **하이브리드 AGM60L** (첫 카드, `id=fuel-card-focus`) |
| 보조 카드 | 가솔린 AGM70L · 디젤 AGM80L · LPG AGM70L |
| stamp | FIX2 |

### `/vehicle/k8-gl3?fuel=하이브리드`

| 항목 | production HTML |
|------|-----------------|
| fuel hero | **하이브리드 AGM60L** (첫 카드) |
| 보조 카드 | 가솔린 AGM70L · LPG DIN90L |
| stamp | FIX2 |

### 체인 audit

| id | search AGM60L focus | vehicle hero 하이브리드 AGM60L |
|----|---------------------|--------------------------------|
| sportage-nq5-hev | OK | OK |
| k8-gl3-hev | OK | OK |

---

## 2. Build stamp 통일 (after)

| route | stamp |
|-------|-------|
| `/` | FIX2 |
| `/search?q=스포티지 NQ5 하이브리드` | FIX2 |
| `/search?q=K8 하이브리드` | FIX2 |
| `/search?q=포터2 배터리` | FIX2 |
| `/vehicle/sportage-nq5?fuel=하이브리드` | FIX2 |
| `/vehicle/k8-gl3?fuel=하이브리드` | FIX2 |
| `/vehicle/porter2-new?year=from2020` | FIX2 |
| `/vehicle/porter2-old?year=to2019` | FIX2 |
| (기타 audit 12 route) | FIX2 |

**이전 문제 stamp (HYBRID-INTENT, PORTER-FIX) — FIX2 배포 후 미검출**

---

## 3. 감사 스크립트 보강

- `STAMP_ROUTES` 12개 — HTML에서 stamp 추출, 단일·기대값 일치
- `HYBRID_CHAIN_CHECKS` — 검색 focus AGM60L + `#fuel-batteries` 내 `data-fuel-hero` / `data-battery-hero`
- 검색만 AGM60L·상세 hero 없으면 `search-detail-chain-break` FAIL

---

## P0 회귀

- 검색 29건 `flags`: **0**
- 포터2 배터리 90R/100R · 레이 방전 증상 · 봉고3 vehicle href · 100R vs AGM95L — audit 결과 유지

---

## 다음 추천

1. 브라우저 강력 새로고침 후 동일 URL 재확인 (구 CDN 캐시 잔여 시).
2. audit `extractIntentLabel` — nav 오탐 제거 (목적 검색 라벨).
