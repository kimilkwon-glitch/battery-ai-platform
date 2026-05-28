# 검색 품질 1차 전수검사 (Production)

- **검사 일시:** 2026-05-28 (KST 기준 수집)
- **Production:** https://battery-ai-platform.vercel.app
- **빌드 스탬프:** `BM-UX-REV-20260528-SORENTO-LINK-FIX` (전 route 동일 확인됨)
- **수집 방법:** `node scripts/search-quality-audit.mjs` + HTML 링크/CTA 추출 스크립트 (코드 수정 없음)
- **원시 데이터:** `reports/search-quality-audit-raw.json`

---

## 요약

| 항목 | 수치 |
|------|------|
| 검사 검색어 | **29** |
| **통과** (P0·P1 없음) | **12** |
| **문제 있음** (P0/P1/P2 중 1개 이상) | **17** |
| **P0 치명** | **6** |
| **P1 중요** | **11** |
| **P2 개선** | **8** (다수 항목에 UX·라벨 개선 여지) |

### 가장 먼저 고쳐야 할 TOP 5

1. **CMF80L 규격 파싱 오류** — 카드 타이틀·primary가 `80L`로 잘리고 `/batteries/80L` 링크 생성 (검색 13·21·22, 규격 검색 전반 위험)
2. **EV6 / 아이오닉5** — DB·브리지(`kia-ev6-cv`, `hyundai-ioniq5-ne`)가 있으나 검색은 `등록된 차량 규격 없음` 또는 **CR-V**로 이탈
3. **스포티지 NQ5 하이브리드** — canonical·candidate map은 `AGM60L`인데 검색은 `DIN74R`, **차량 상세 링크 없음**
4. **그랜저 IG 가솔린** — 검색 `AGM80L` vs 차량 상세 `AGM70L` (**검색↔상세 불일치**, P0)
5. **목적 검색 의도 라벨** — 출장/매장/택배 CTA는 대체로 맞으나 상단 라벨이 전부 `통합검색`이라 목적 검색 UX 약함

### 검색 품질 종합 평가

**강점:** 포터2 연식 분기(20년식/2019), 쏘렌토 MQ4 연료별(하이브리드·디젤), 싼타페 MX5 하이브리드, 단일 규격 검색(AGM/DIN/100R), 비교 검색(AGM60L vs 115D31L)은 **상단 배터리 포커스 카드 + 이미지 + `/batteries/{code}`** 흐름이 잘 동작한다. DB에 답이 있는 MQ4·포터 계열은 “사진만 달라”가 아니라 **규격 카드가 먼저** 나온다.

**약점:** (1) **규격 토큰 정규화(CMF80L→80L)** 버그, (2) **하이브리드 차종 DB/브리지 미적용**(스포티지·K8), (3) **EV 전용 차종 미노출**, (4) **연료별 검색·상세 불일치**(그랜저 가솔린), (5) **목적/증상 검색의 의도 라벨·CTA 위계**가 차량/규격만큼 정교하지 않다.

### 다음 수정 제안 (코드 착수 전 우선순위)

1. `resolvePrimaryBatteryCode` / `parseBatterySpecDisplay` / `normalizeBatteryCode` — **CMF·AGM 전체 코드 보존** (80L 단독 매칭 금지)
2. `resolve-vehicle-battery-spec.ts` + `vehicle-canonical-db-bridge.ts` — 하이브리드 canonical → **candidate map(AGM60L) 우선**, DB slug 오매칭 시 DIN74R 덮어쓰기 방지
3. `buildSearchSummary` / `resolveVehicleBatterySpecForSearch` — 연료 파라미터 시 **`batteryCodeForFuelParam`과 동일 규칙** 적용 (검색·`/vehicle` CTA 일치)
4. EV6·아이오닉5 — `CANONICAL_DB_BRIDGE` 연결 검증, 검색 fallback 시 **ICE 차량(cr-v) 노출 금지**
5. `resolveSearchIntentLabel` — 출장/매장/택배/상품 키워드 → **목적 검색** 라벨; 증상 검색 시 **진단 CTA 1순위**
6. 비교 검색 — 쿼리 좌측 규격(100R)을 primary 또는 **양쪽 카드+`/compare?items=`** 상단 고정

---

## 전수검사 표

공통 CTA 패턴(배터리 포커스 있을 때, HTML 텍스트 기준):

- **Primary:** `이 규격 자세히 보기` → `/batteries/{code}`
- **Secondary:** `사진으로 최종 확인` → `/analysis/photo`
- **Tertiary:** `차량 상세 보기` / `문의하기` 등

| # | 검색어 | 의도 인식 | 실제 노출 결과 요약 | 추천 배터리 규격 | 배터리 카드 | 이미지 | 차량 상세 | 배터리 상세 | 사진=보조 CTA | 쇼핑/매장 CTA | 문제 | 수정 추정 | 우선순위 |
|---|--------|-----------|---------------------|------------------|------------|--------|-----------|-------------|---------------|---------------|------|-----------|----------|
| 1 | 포터2 20년식 | 차량 검색 | `search-focus` · 차량 요약 **100R** · 카드 **100R** · 연식 기준 문구 | **100R** | ✅ RecommendedBatteryCard | ✅ | ✅ `/vehicle/porter2-new?year=from2020` | ✅ `/batteries/100R` | ✅ 사진=secondary | — | 없음 | — | **통과** |
| 2 | 포터2 2019 | 차량 검색 | **90R** 카드 · `porter2-old?year=to2019` | **90R** | ✅ | ✅ | ✅ | ✅ `/batteries/90R` | ✅ | — | 없음 | — | **통과** |
| 3 | 포터2 배터리 | 차량 검색 | **90R** 단일 카드 · 차량 링크 `porter2-new` only · 연식 미입력 시 후보 문구 약함 | **90R / 100R** (양쪽 후보 기대) | ✅ (90R만 강조) | ✅ | ✅ (2020+ 쪽으로 치우침) | ✅ 90R | ✅ | — | 연식 없을 때 **90R·100R 동시 노출·칩** 부족 | `fitment-overrides.ts` any-era rule | **P1** |
| 4 | 쏘렌토 MQ4 하이브리드 | 차량 검색 | **AGM60L** 카드 · DB 기준 · `sorento-mq4?fuel=하이브리드` | **AGM60L** | ✅ | ✅ | ✅ sorento-mq4 | ✅ AGM60L | ✅ | — | 없음 | — | **통과** |
| 5 | 쏘렌토 MQ4 디젤 | 차량 검색 | **AGM80L** · `sorento-mq4?fuel=디젤` | **AGM80L** | ✅ | ✅ | ✅ | ✅ | ✅ | — | 없음 | — | **통과** |
| 6 | 그랜저 IG 가솔린 | 차량 검색 | 검색 카드 **AGM80L** · `/vehicle/grandeur-ig?fuel=가솔린` | **AGM70L** (차량 상세·`batteryCodeForFuelParam`) | ✅ | ✅ | ✅ | ✅ (검색은 80L) | ✅ | — | **검색 AGM80L ≠ 상세 AGM70L** | `resolve-vehicle-battery-spec.ts`, `battery-cta.ts` 연료 규칙 검색 파이프라인 반영 | **P0** |
| 7 | 그랜저 IG 디젤 | 차량 검색 | **AGM80L** · fuel=디젤 | **AGM80L** | ✅ | ✅ | ✅ | ✅ | ✅ | — | 없음 | — | **통과** |
| 8 | 스포티지 NQ5 하이브리드 | 차량 검색 | 카드 **DIN74R** · **차량 상세 href 없음** | **AGM60L** (registry/candidate map) | ✅ (잘못된 규격) | ✅ | ❌ | ✅ DIN74R | ✅ | — | DB/브리지는 HEV인데 **ICE 규격 노출** | `vehicle-canonical-db-bridge.ts`, `vehicle-battery-candidate-map.ts`, `resolve-vehicle-battery-spec.ts` | **P0** |
| 9 | 싼타페 MX5 하이브리드 | 차량 검색 | **AGM60L** · `santafe-mx5?fuel=하이브리드` | **AGM60L** | ✅ | ✅ | ✅ | ✅ | ✅ | — | 없음 | — | **통과** |
| 10 | K8 하이브리드 | 차량 검색 | **DIN74R** 카드 · 차량 `k8-gl3?fuel=하이브리드` | **AGM60L** (candidate map) | ✅ (규격 의심) | ✅ | ✅ | ✅ DIN74R | ✅ | — | 하이브리드인데 DIN 계열 우선 | 동일 · K8 hybrid bridge | **P1** |
| 11 | EV6 보조배터리 | 통합검색 | **등록된 차량 규격 없음** · 관련 차량 **CR-V** · 진단 `ev12v-discharge` · 배터리 카드 없음 | EV 보조 (GB 계열 등) | ❌ | ❌ | ❌ **cr-v 오매칭** | ❌ | 사진·진단이 앞섬 | — | EV DB 미연결·엉뚱한 ICE 차량 | `vehicle-canonical-registry.ts`, `CANONICAL_DB_BRIDGE`, `search-page-results.ts` | **P0** |
| 12 | 아이오닉5 배터리 | 차량 검색 | **등록된 차량 규격 없음** · 배터리 카드 없음 · fallback CTA(사진·매장) | EV 12V (DB 있음) | ❌ | ❌ | △ 검색 링크만 | ❌ | 사진·매장 primary에 가까움 | service-center | **DB 답 있는데 미노출** | `hyundai-ioniq5-ne` bridge, EV 검색 요약 | **P0** |
| 13 | 스타리아 디젤 CMF80L | 규격 검색 (차량+규격 혼합) | 카드 타이틀 **80L** · 링크 `/batteries/80L` · 차량 `staria-us4?fuel=디젤` · CMF80L 그리드도 존재 | **CMF80L** | ✅ (코드 깨짐) | ✅ | ✅ | △ 80L+CMF80L 혼재 | ✅ | — | **CMF80L 파싱 버그** | `batteryNormalize.ts`, `resolvePrimaryBatteryCode`, `parseBatterySpecDisplay` | **P0** |
| 14 | 봉고3 DIN74L | 규격 검색 | **DIN74L** 포커스 카드 · 차량 블록 없음 | **DIN74L** | ✅ | ✅ | ❌ | ✅ | ✅ | — | 차량+규격 동시 검색인데 **봉고 상세 미연결** | `search-vehicle-aliases.ts`, 보봉고 canonical | **P1** |
| 15 | 레이 블랙박스 방전 | 증상 검색 (라벨) | **AGM105L** 배터리 카드 1순위 · 진단 링크 `slow-engine-start` (부차) | 증상·레이 소형 AGM (문맥상) | ✅ | ✅ | ❌ | ✅ AGM105L | △ 배터리가 증상보다 앞섬 | — | **증상 검색인데 규격 카드가 메인** | `search-intent.ts`, `search-summary.ts`, 증상→진단 우선 | **P1** |
| 16 | AGM70L | 규격 검색 | **AGM70L** 포커스 · 단일 카드 | AGM70L | ✅ | ✅ | — | ✅ | ✅ | — | 없음 | — | **통과** |
| 17 | AGM80L | 규격 검색 | **AGM80L** 포커스 | AGM80L | ✅ | ✅ | — | ✅ | ✅ | — | 없음 | — | **통과** |
| 18 | AGM60L | 규격 검색 | **AGM60L** 포커스 | AGM60L | ✅ | ✅ | — | ✅ | ✅ | — | 없음 | — | **통과** |
| 19 | DIN74L | 규격 검색 | **DIN74L** 포커스 | DIN74L | ✅ | ✅ | — | ✅ | ✅ | — | 없음 | — | **통과** |
| 20 | 100R | 규격 검색 | **100R** 포커스 | 100R | ✅ | ✅ | — | ✅ | ✅ | — | 없음 | — | **통과** |
| 21 | CMF80L | 규격 검색 | 카드 **80L** · `/batteries/80L` · 관련 그리드에 CMF80L | **CMF80L** | ✅ (표기 오류) | ✅ | — | △ | ✅ | — | **규격 검색 핵심 버그** | 동일 · CMF 토큰 | **P0** |
| 22 | 단자 방향 CMF80L | 통합검색 (기대: 단자) | **80L** 카드 · 단자 라벨 약함 · `단자 방향 검색` 미적용 | CMF80L + 단자 L/R | ✅ (80L) | ✅ | — | △ | ✅ | — | 의도 라벨·단자 강조 부족 + 80L 버그 | `search-intent.ts` TERMINAL_INTENT, CMF 파싱 | **P1** |
| 23 | AGM60L vs 115D31L | 비교 검색 | **AGM60L** primary · 그리드에 115D31L · 비교 의도 라벨 | 양쪽 비교 | ✅ | ✅ | — | ✅ AGM60L | ✅ | — | 없음 (compare URL은 HTML에 약함) | `search-page-results.ts` compare CTA | **통과** |
| 24 | 100R vs AGM95L | 비교 검색 | primary **AGM95L** (쿼리 좌측 100R 아님) · CMF100R 그리드 | 100R vs AGM95L | ✅ | ✅ | — | ✅ | ✅ | — | **비교 축 100R이 카드 1순위가 아님** | compare ranking, `buildCtas` | **P1** |
| 25 | 부산 배터리 출장 | 통합검색 (기대: 목적) | 차량/배터리 카드 없음 · **출장 가능 지역 보기** → `/service-center#regions` · 사진·문의 | — | ❌ | ❌ | — | — | ✅ 사진=보조 | ✅ 출장 | 의도 라벨 `통합검색` · 상단 텍스트 위주 | `search-intent.ts`, `search-purpose.ts`, hub CTA | **P1** |
| 26 | 덕천 배터리 교체 | 통합검색 | **덕천점 안내** → `#store-deokcheon` · 사진·compare | — | ❌ | ❌ | — | — | ✅ | ✅ 매장 | 라벨·카드 없음 | `detectCustomerHubFromQuery` | **P1** |
| 27 | 학장점 배터리 교체 | 통합검색 | **학장점 안내** → `#store-hakjang` | — | ❌ | ❌ | — | — | ✅ | ✅ | 동일 | 동일 | **P1** |
| 28 | 택배 배터리 주문 | 통합검색 | **택배 주문 전 확인** · `/shop#delivery-notes` · `/shop` | — | ❌ | ❌ | — | — | ✅ | ✅ 쇼핑 | 라벨만 약함 · 주문 안내 문구는 적절 | `search-intent.ts` order flags | **P2** |
| 29 | 배터리 상품 확인 | 통합검색 | **배터리 상품 확인** → `/shop#shop-products` | — | ❌ | ❌ | — | — | ✅ | ✅ | 라벨 `통합검색` | hub/shop CTA | **P2** |

---

## P0 상세 (치명)

### 6. 그랜저 IG 가솔린 — 검색 vs 상세 불일치

- 검색: `AGM80L` 카드, `/batteries/AGM80L`
- `/vehicle/grandeur-ig?fuel=가솔린`: `data-primary-battery="AGM70L"`
- 판정: **검색 결과와 상세 페이지 데이터가 다름** (사용자 철학 위반)

### 8. 스포티지 NQ5 하이브리드 — 엉뚱한 규격·차량 링크 없음

- 노출: **DIN74R** (하이브리드 HEV에 부적절 가능성 높음)
- `vehicle-canonical-registry` / `vehicle-battery-candidate-map`: **AGM60L** 기대
- 차량 상세 href **0건** → 검색→차량 상세 흐름 단절

### 11. EV6 보조배터리

- `등록된 차량 규격 정보가 없습니다` + **Honda CR-V** `/vehicle/cr-v` 노출
- EV6 canonical·bridge 존재하나 검색 파이프라인 미연결

### 12. 아이오닉5 배터리

- 차량 검색 라벨이지만 **배터리 포커스 없음**, `noSpec` 메시지
- CTA: 사진·매장·가이드 — **DB 답 대신 확인 필요 UX**

### 13·21·22. CMF80L → 80L

- RecommendedBatteryCard h3가 **`80L`** 로 렌더
- 잘못된 href: `/batteries/80L`
- 규격 검색 P0: **카드 코드가 쿼리와 불일치**

---

## P1 상세 (중요)

- **3 포터2 배터리:** 90R만 대표 카드, 100R 후보·연식 칩 약함
- **10 K8 하이브리드:** DIN74R vs 기대 AGM60L (스포티지와 동일 패턴)
- **14 봉고3 DIN74L:** 규격만, 봉고 차량 상세 없음
- **15 레이 블랙박스:** 증상인데 AGM105L 카드가 1순위, 진단은 보조
- **22 단자 CMF80L:** `단자 방향 검색` 라벨 미적용 + 80L 버그
- **24 100R vs AGM95L:** 비교 검색인데 **AGM95L**이 primary
- **25~27 목적 검색:** 매장/출장 CTA는 맞으나 **의도 라벨·상단 카드 구조**가 차량/규격 대비 빈약

---

## P2 (개선)

- 목적 검색(28·29): CTA는 적절, **의도 라벨·히어로 카드**만 보강하면 됨
- 포터2 배터리(3): 카드·이미지는 있으나 **연식 분기 UX**만 강화
- 전반: `관련 결과 더보기` defer는 좋으나 모바일에서 **첫 화면 CTA 버튼 클래스**가 HTML에 `btnPrimary`로 잘 안 잡힘 (SSR 텍스트 링크는 존재)

---

## 부록: 검증 URL

| 검색어 | URL |
|--------|-----|
| 포터2 20년식 | [/search?q=포터2%2020년식](https://battery-ai-platform.vercel.app/search?q=%ED%8F%AC%ED%84%B02%2020%EB%85%84%EC%8B%9D) |
| 쏘렌토 MQ4 하이브리드 | [/search?q=쏘렌토%20MQ4%20하이브리드](https://battery-ai-platform.vercel.app/search?q=%EC%8F%98%EB%A0%8C%ED%86%A0%20MQ4%20%ED%95%98%EC%9D%B4%EB%B8%8C%EB%A6%AC%EB%93%9C) |
| 그랜저 IG 가솔린 | [/search?q=그랜저%20IG%20가솔린](https://battery-ai-platform.vercel.app/search?q=%EA%B7%B8%EB%9E%9C%EC%A0%80%20IG%20%EA%B0%80%EC%86%94%EB%A6%B0) |
| 스포티지 NQ5 하이브리드 | [/search?q=스포티지%20NQ5%20하이브리드](https://battery-ai-platform.vercel.app/search?q=%EC%8A%A4%ED%8F%AC%ED%8B%B0%EC%A7%80%20NQ5%20%ED%95%98%EC%9D%B4%EB%B8%8C%EB%A6%AC%EB%93%9C) |
| CMF80L | [/search?q=CMF80L](https://battery-ai-platform.vercel.app/search?q=CMF80L) |

---

*본 보고서는 production HTML 기준 관찰 결과이며, 코드 변경은 수행하지 않았습니다.*
