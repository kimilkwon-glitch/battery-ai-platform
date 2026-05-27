# Battery Manager — 데이터 요구사항

> **운영 원칙:** 차량-배터리 매칭의 1순위 원본은 `src/data/vehicle-battery-db.json`(차종표 기반, 2,125건)입니다.  
> `src/data/vehicles/` 구조는 표준 스키마·로더 그릇이며, sample JSON은 운영 DB가 없을 때만 fallback으로 사용합니다.

## 데이터 로딩 우선순위 (차량-배터리)

| 순위 | 소스 | 파일 | 용도 |
|------|------|------|------|
| 1 | 기존 차종표 DB | `vehicle-battery-db.json` | **운영 원본** — 절대 sample로 대체하지 않음 |
| 2 | 운영자 real | `vehicles/vehicles.real.json` | 추가·보강 (기존 `primaryBattery` 덮어쓰기 금지) |
| 3 | 개발 fallback | `vehicles/vehicles.sample.json` | DB·real 모두 비어 있을 때만 |
| 4 | UI fallback | `common/fallback.ts` | 데이터 부족 안내 문구 |

로더: `src/lib/data/getVehicles.ts` · `getVehicleById.ts`

---

## 1. 차량-배터리 DB

**목적:** 차종·연식·연료별 추천 배터리 규격 제공

**원본 파일:** `src/data/vehicle-battery-db.json`  
**확장:** `src/data/vehicle-battery-enrichment.json` (가이드·이미지·별칭 — 배터리 규격 덮어쓰기 금지)  
**표준 스키마:** `src/data/vehicles/vehicles.schema.ts`

**필수 필드 (표준):** `vehicleId`, `manufacturer`, `vehicleName`, `mainBatterySpec`, `candidateBatterySpecs`, `confidence`, `needsCheck`, `aliases`, …

**기존 DB → 표준 normalize 규칙:**
- `primaryBattery` → `mainBatterySpec` (값 변경 금지)
- `displayName` → `vehicleName` (사용자 표시명 유지)
- 연료·연식 부족 → `needsCheck: true`, `confidence: "needs_photo"`
- `notes`에 부족 항목 기록

**예시:** 스타리아 디젤/LPG → `AGM80R` (기존 DB 확정값 유지)

**사용 페이지:** 메인 검색, `/vehicle/[slug]`, 통합검색, 증상진단, 배터리 상세 호환 차량

**Fallback:** "이 차량은 아직 세부 연식/연료별 데이터가 부족합니다…" + 사진분석 CTA

---

## 2. 배터리 제품 DB

**목적:** 규격·브랜드별 제품 정보, 쇼핑/비교

**파일:** `batteries/batteries.schema.ts`, `batteries.sample.json`, `batteries.real.json`, `batteries/products.json`(레거시)

**필수 필드:** `batteryId`, `standardSpec`, `brand`, `ah`, `cca`, `terminalPosition`, `price`, …

**예시:** AGM80L, AGM80R, DIN74L, GB57820, CMF57412

**사용 페이지:** `/batteries/[code]`, `/shop`, `/compare`, 브랜드 허브

**Fallback:** 규격 문의 CTA

---

## 3. 브랜드별 규격 매칭표

**목적:** 로케트·쏠라이트 등 브랜드 코드 ↔ 표준 규격

**파일:** `batteries/specMappings.json`, `batteries/batteryAliases.json`, `lib/battery-alias-map.ts`, DB `normalizationRules`

**예시:** `57820` → DIN74L, `57412` → DIN74L, `GB57820` ↔ `CMF57412`

**로더:** `src/lib/data/resolveSpec.ts`

**Fallback:** 검색어 그대로 표시 + 사진분석 CTA

---

## 4. 작업 가능점 DB

**파일:** `locations/locations.schema.ts`, `service-centers/service-centers.json`

**사용 페이지:** `/service-center`

**Fallback:** "작업 가능점 정보 확인 중" + 전체 보기 CTA

---

## 5. 가이드 콘텐츠 DB

**파일:** `guides/`, `content/articles/*.json`

**예시:** DIN74L 가이드, 스타리아 AGM80R 가이드

**사용 페이지:** `/guides`, `/guides/[id]`

---

## 6. Q&A DB

**파일:** `qa/`, `qna/questions.json`

**예시:** 단자방향(L/R) Q&A, 스타리아 AGM80R Q&A

**사용 페이지:** `/community`, `/ai`

---

## 7. 증상진단 룰

**파일:** `symptoms/`, `diagnosis/symptom-rules.json`

**예시:** 시동지연, 완전방전

**원칙:** `vehicleDbFirst: true` — 추천 배터리는 차량 DB 우선

**사용 페이지:** `/diagnosis`, `/problems`

---

## 8. 사진분석 룰/샘플

**파일:** `photo-analysis/photoRules.schema.ts`, `labelPatterns.json`

**사용 페이지:** `/analysis/photo`

**Fallback:** "현재 사진 분석 결과는 규격 확인을 돕기 위한 예시/보조 정보입니다…"

---

## 9. 활동/트렌드 데이터

**파일:** `trends/`, `activity/site-activity.json`

**사용 페이지:** `/trending`, 메인

---

## 10. 이미지 매니페스트

**파일:** `images/imageManifest.*.json`  
**Fallback 경로:** `/assets/fallback/{vehicle|battery|brand|guide}.png`  
**로더:** `src/lib/data/resolveImage.ts`

---

## 통합 검색

**로더:** `src/lib/data/searchAll.ts`

검색 대상: vehicles(기존 DB normalize), batteries, guides, qa, symptoms, brands  
별칭: `vehicles/vehicleAliases.json` + `resolveSpec` + DB `normalizationRules`

결과 없음 → 규격 문의·사진분석 CTA (`fallback.searchEmpty`)

---

## 운영자 체크리스트

- [ ] `vehicle-battery-db.json` 수정 시 `primaryBattery` 임의 변경 금지
- [ ] 스타리아 AGM80R / AGM80L·R 구분 유지
- [ ] DIN74L = GB57820 = CMF57412 매칭 유지
- [ ] UI에 `mock`, `TODO`, `debug`, `undefined`, `null` 노출 금지
- [ ] real JSON 추가 시 기존 레코드 배터리 규격 덮어쓰기 금지
