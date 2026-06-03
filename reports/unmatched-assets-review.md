# Unmatched Assets Review

생성: 2026-06-03T08:15:52.405Z

기준: `reports/vehicle-db-integrity-audit.json` + 런타임 unmatched 판정(확정 DB·defaultBatteryCode 없음)


## 1. 요약
unmatched **120 → 13** · A그룹 **38 → 7**

| 항목 | 건수 |
|------|------|
| 전체 unmatched | 13 |
| A: DB 연결 가능 의심 | 7 |
| B: 실제 미확정 의심 | 5 |
| C: 노출 제외 후보 | 1 |
| 국산차 | 13 |
| 수입차 | 0 |
| HIGH 우선순위 | 7 |
| MID 우선순위 | 5 |
| LOW 우선순위 | 1 |
| DB 후보 있으나 unmatched | 7 |
| DB 후보 0건 | 6 |
| A그룹 연결 성공(이전 대비) | 37 |
| A그룹 보류 | 1 |

### A그룹 연결 성공: 37건
### A그룹 보류
- **싼타페 하이브리드** (`santafe-mx5-hev`): dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — catalogId/slug·세대토큰·연식 필터 불일치; 세대 토큰(MX5,하이브리드) 매칭 실패로 레코드 필터링; dbModels(싼타페)가 넓어 동명 세대·연식 혼선 가능

## 2. 브랜드별 요약
| 브랜드 | 건수 | HIGH | MID | LOW |
|--------|------|------|-----|-----|
| 쉐보레 | 6 | 4 | 1 | 1 |
| 르노 | 3 | 1 | 2 | 0 |
| KG·쌍용 | 3 | 1 | 2 | 0 |
| 현대 | 1 | 1 | 0 | 0 |

## 3. HIGH 우선 검토 대상
| assetId | displayName | brand | yearRange | dbModels | 가까운 DB 후보 | unmatched 원인 | 추천 조치 |
|---------|-------------|-------|-----------|----------|----------------|----------------|-----------|
| renault-samsung-qm6-quest-2023 | QM6 퀘스트 | 르노코리아 | 2023-현재 | QM6 | QM6(AGM70L, score 80); QM6 2.0 디젤 (17년~현재)(70L, score 80) | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — catalogId/slug·세대토큰·연식 필터 불일치; 세대 토큰(QM6) 매칭 실패로 레코드 필터링; dbModels(QM6)가 넓어 동명 세대·연식 혼선 가능 | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels 세대별 분리 |
| gmdaewoo-damas-2011 | 다마스 | 쉐보레/GM | 2011-현재 | 다마스 | 다마스(40L, score 110); 뉴 다마스 0.8 LPG (08년~현재)(50L, score 110) | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — catalogId/slug·세대토큰·연식 필터 불일치 | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels 세대별 분리 |
| gmdaewoo-labo-2011 | 라보 | 쉐보레/GM | 2011-현재 | 라보 | 라보(40L, score 110); 뉴 라보 0.8 LPG (08년~현재)(50L, score 110) | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — catalogId/slug·세대토큰·연식 필터 불일치 | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels 세대별 분리 |
| chevrolet-equinox-2022 | 이쿼녹스 | 쉐보레/GM | 2022-현재 | 이쿼녹스 | 이쿼녹스(AGM70L, score 110); 이쿼녹스 1.6 디젤 (18년~현재)(70L, score 110) | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — catalogId/slug·세대토큰·연식 필터 불일치 | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels 세대별 분리 |
| chevrolet-trailblazer-2024 | 트레일블레이저 | 쉐보레/GM | 2024-현재 | 트레일블레이저 | 트레일블레이저(AGM70L, score 110); 트레일블레이저 1.2 가솔린 (20년~현재)(70L, score 110) | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — catalogId/slug·세대토큰·연식 필터 불일치 | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels 세대별 분리 |
| santafe-mx5-hev | 싼타페 하이브리드 | 현대 | 2023-현재 | 싼타페 | 더 뉴 싼타페 2.5 가솔린(21년~현재)(AGM70L, score 125); 더 뉴 싼타페 디젤(21년~현재)(AGM80L, score 125) | dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — catalogId/slug·세대토큰·연식 필터 불일치; 세대 토큰(MX5,하이브리드) 매칭 실패로 레코드 필터링; dbModels(싼타페)가 넓어 동명 세대·연식 혼선 가능 | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels 세대별 분리 |
| kg-actyon-2024 | 액티언 | KGM | 2024-현재 | 액티언 | 액티언(90R, score 110); 액티언 디젤 (05~11년)(90R, score 110) | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — catalogId/slug·세대토큰·연식 필터 불일치 | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels 세대별 분리 |

## 4. 전체 리스트
| 번호 | group | priority | assetId | catalogId | displayName | brand | yearRange | defaultBatteryCode | dbModels | 가까운 DB 후보 수 | 원인 | 추천 조치 |
|------|-------|----------|---------|-----------|-------------|-------|-----------|-------------------|----------|------------------|------|-----------|
| 1 | B | MID | renault-master-2018 | renault-master-2018 | 르노 마스터 | 르노 | 2018-현재 | — | 마스터 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 2 | B | MID | renault-arkana-2024 | renault-arkana-2024 | 아르카나 | 르노 | 2024-현재 | — | 아르카나, ARKANA | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 3 | A | HIGH | renault-samsung-qm6-quest-2023 | renault-samsung-qm6-quest-2023 | QM6 퀘스트 | 르노 | 2023-현재 | — | QM6 | 5 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — c… | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels… |
| 4 | A | HIGH | gmdaewoo-damas-2011 | gmdaewoo-damas-2011 | 다마스 | 쉐보레 | 2011-현재 | — | 다마스 | 5 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — c… | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels… |
| 5 | A | HIGH | gmdaewoo-labo-2011 | gmdaewoo-labo-2011 | 라보 | 쉐보레 | 2011-현재 | — | 라보 | 5 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — c… | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels… |
| 6 | B | MID | chevrolet-bolt-ev-2017 | chevrolet-bolt-ev-2017 | 볼트 EV | 쉐보레 | 2017-현재 | — | 볼트 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 7 | A | HIGH | chevrolet-equinox-2022 | chevrolet-equinox-2022 | 이쿼녹스 | 쉐보레 | 2022-현재 | — | 이쿼녹스 | 3 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — c… | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels… |
| 8 | C | LOW | daewoo-tosca-2006 | daewoo-tosca-2006 | 토스카 | 쉐보레 | 2006-2011 | — | 토스카 | 0 | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-batt… | 노출 제외·검색 후순위 유지; DB 연결보다 카탈로그 정리 우선 |
| 9 | A | HIGH | chevrolet-trailblazer-2024 | chevrolet-trailblazer-2024 | 트레일블레이저 | 쉐보레 | 2024-현재 | — | 트레일블레이저 | 5 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — c… | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels… |
| 10 | A | HIGH | santafe-mx5-hev | santafe-mx5-hev | 싼타페 하이브리드 | 현대 | 2023-현재 | — | 싼타페 | 5 | dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — catalogId/slug·세대토큰·연식 필터 불일치; 세대 토큰(MX5,하이브리드) 매칭 실패로 레코드 필터링; dbMo… | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels… |
| 11 | A | HIGH | kg-actyon-2024 | kg-actyon-2024 | 액티언 | KG·쌍용 | 2024-현재 | — | 액티언 | 5 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — c… | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels… |
| 12 | B | MID | kg-torres-2022 | kg-torres-2022 | 토레스 | KG·쌍용 | 2022-현재 | — | 토레스 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 13 | B | MID | kg-torres-evx-2023 | kg-torres-evx-2023 | 토레스 EVX | KG·쌍용 | 2023-현재 | — | 토레스 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |

## 5. DB 후보가 있는 unmatched
vehicle-battery-db에서 model/displayName/alias 검색 또는 slug 연결로 후보가 1건 이상인데도 카드 확정이 없는 차량.

총 **7**건

| assetId | displayName | 후보(model/display/alias/slug) | top DB | group | priority |
|---------|-------------|--------------------------------|--------|-------|----------|
| renault-samsung-qm6-quest-2023 | QM6 퀘스트 | 19/0/0/0 | QM6(AGM70L, score 80); QM6 2.0 디젤 (17년~현재)(70L, score 80) | A | HIGH |
| gmdaewoo-damas-2011 | 다마스 | 5/5/5/0 | 다마스(40L, score 110); 뉴 다마스 0.8 LPG (08년~현재)(50L, score 110) | A | HIGH |
| gmdaewoo-labo-2011 | 라보 | 5/5/5/0 | 라보(40L, score 110); 뉴 라보 0.8 LPG (08년~현재)(50L, score 110) | A | HIGH |
| chevrolet-equinox-2022 | 이쿼녹스 | 3/3/3/0 | 이쿼녹스(AGM70L, score 110); 이쿼녹스 1.6 디젤 (18년~현재)(70L, score 110) | A | HIGH |
| chevrolet-trailblazer-2024 | 트레일블레이저 | 5/5/5/0 | 트레일블레이저(AGM70L, score 110); 트레일블레이저 1.2 가솔린 (20년~현재)(70L, score 110) | A | HIGH |
| santafe-mx5-hev | 싼타페 하이브리드 | 47/0/47/0 | 더 뉴 싼타페 2.5 가솔린(21년~현재)(AGM70L, score 125); 더 뉴 싼타페 디젤(21년~현재)(AGM80L, score 125) | A | HIGH |
| kg-actyon-2024 | 액티언 | 5/5/5/0 | 액티언(90R, score 110); 액티언 디젤 (05~11년)(90R, score 110) | A | HIGH |

## 6. 진짜 DB 후보가 없는 unmatched
총 **6**건

| assetId | displayName | brand | yearRange | 원인 |
|---------|-------------|-------|-----------|------|
| renault-master-2018 | 르노 마스터 | 르노코리아 | 2018-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-arkana-2024 | 아르카나 | 르노코리아 | 2024-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-bolt-ev-2017 | 볼트 EV | 쉐보레/GM | 2017-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| daewoo-tosca-2006 | 토스카 | 쉐보레/GM | 2006-2011 | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| kg-torres-2022 | 토레스 | KGM | 2022-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| kg-torres-evx-2023 | 토레스 EVX | KGM | 2023-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |

## 7. 노출 제외 후보
총 **1**건

| assetId | displayName | yearRange | recommendExcluded | group | 원인 |
|---------|-------------|-----------|-------------------|-------|------|
| daewoo-tosca-2006 | 토스카 | 2006-2011 | Y | C | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |

## 부록: 국산차 / 수입차 분리
### 국산차
- [1] **르노 마스터** (renault-master-2018) — B/MID
- [2] **아르카나** (renault-arkana-2024) — B/MID
- [3] **QM6 퀘스트** (renault-samsung-qm6-quest-2023) — A/HIGH
- [4] **다마스** (gmdaewoo-damas-2011) — A/HIGH
- [5] **라보** (gmdaewoo-labo-2011) — A/HIGH
- [6] **볼트 EV** (chevrolet-bolt-ev-2017) — B/MID
- [7] **이쿼녹스** (chevrolet-equinox-2022) — A/HIGH
- [8] **토스카** (daewoo-tosca-2006) — C/LOW
- [9] **트레일블레이저** (chevrolet-trailblazer-2024) — A/HIGH
- [10] **싼타페 하이브리드** (santafe-mx5-hev) — A/HIGH
- [11] **액티언** (kg-actyon-2024) — A/HIGH
- [12] **토레스** (kg-torres-2022) — B/MID
- [13] **토레스 EVX** (kg-torres-evx-2023) — B/MID

### 수입차
- (이번 unmatched 목록에 수입차 asset 없음)