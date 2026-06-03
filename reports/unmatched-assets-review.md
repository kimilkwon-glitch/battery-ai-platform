# Unmatched Assets Review

생성: 2026-06-03T07:48:32.712Z

기준: `reports/vehicle-db-integrity-audit.json` + 런타임 unmatched 판정(확정 DB·defaultBatteryCode 없음)


## 1. 요약
unmatched **120 → 84** · A그룹 **38 → 1**

| 항목 | 건수 |
|------|------|
| 전체 unmatched | 84 |
| A: DB 연결 가능 의심 | 1 |
| B: 실제 미확정 의심 | 75 |
| C: 노출 제외 후보 | 8 |
| 국산차 | 84 |
| 수입차 | 0 |
| HIGH 우선순위 | 1 |
| MID 우선순위 | 75 |
| LOW 우선순위 | 8 |
| DB 후보 있으나 unmatched | 1 |
| DB 후보 0건 | 83 |
| A그룹 연결 성공(이전 대비) | 33 |
| A그룹 보류 | 1 |

### A그룹 연결 성공: 33건
### A그룹 보류
- **싼타페 하이브리드** (`santafe-mx5-hev`): dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — catalogId/slug·세대토큰·연식 필터 불일치; 세대 토큰(MX5,하이브리드) 매칭 실패로 레코드 필터링; dbModels(싼타페)가 넓어 동명 세대·연식 혼선 가능

## 2. 브랜드별 요약
| 브랜드 | 건수 | HIGH | MID | LOW |
|--------|------|------|-----|-----|
| 쉐보레 | 36 | 0 | 34 | 2 |
| KG·쌍용 | 27 | 0 | 21 | 6 |
| 르노 | 20 | 0 | 20 | 0 |
| 현대 | 1 | 1 | 0 | 0 |

## 3. HIGH 우선 검토 대상
| assetId | displayName | brand | yearRange | dbModels | 가까운 DB 후보 | unmatched 원인 | 추천 조치 |
|---------|-------------|-------|-----------|----------|----------------|----------------|-----------|
| santafe-mx5-hev | 싼타페 하이브리드 | 현대 | 2023-현재 | 싼타페 | 더 뉴 싼타페 2.5 가솔린(21년~현재)(AGM70L, score 125); 더 뉴 싼타페 디젤(21년~현재)(AGM80L, score 125) | dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — catalogId/slug·세대토큰·연식 필터 불일치; 세대 토큰(MX5,하이브리드) 매칭 실패로 레코드 필터링; dbModels(싼타페)가 넓어 동명 세대·연식 혼선 가능 | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels 세대별 분리 |

## 4. 전체 리스트
| 번호 | group | priority | assetId | catalogId | displayName | brand | yearRange | defaultBatteryCode | dbModels | 가까운 DB 후보 수 | 원인 | 추천 조치 |
|------|-------|----------|---------|-----------|-------------|-------|-----------|-------------------|----------|------------------|------|-----------|
| 1 | B | MID | renault-samsung-new-sm3-2009 | renault-samsung-new-sm3-2009 | 뉴 SM3 | 르노 | 2009-2013 | — | SM3 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 2 | B | MID | renault-samsung-new-sm5-2010 | renault-samsung-new-sm5-2010 | 뉴 SM5 | 르노 | 2010-2012 | — | SM5 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 3 | B | MID | renault-samsung-the-new-qm6-2019 | renault-samsung-the-new-qm6-2019 | 더 뉴 QM6 | 르노 | 2019-2022 | — | QM6 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 4 | B | MID | renault-samsung-the-new-sm6-2020 | renault-samsung-the-new-sm6-2020 | 더 뉴 SM6 | 르노 | 2020-현재 | — | SM6 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 5 | B | MID | renault-master-2018 | renault-master-2018 | 르노 마스터 | 르노 | 2018-현재 | — | 마스터 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 6 | B | MID | renault-arkana-2024 | renault-arkana-2024 | 아르카나 | 르노 | 2024-현재 | — | 아르카나, ARKANA | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 7 | B | MID | renault-samsung-all-new-sm7-2011 | renault-samsung-all-new-sm7-2011 | 올 뉴 SM7 | 르노 | 2011-2013 | — | SM7 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 8 | B | MID | renault-samsung-qm3-2013 | renault-samsung-qm3-2013 | QM3 | 르노 | 2013-2016 | — | QM3 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 9 | B | MID | renault-samsung-qm5-2007 | renault-samsung-qm5-2007 | QM5 | 르노 | 2007-2013 | — | QM5 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 10 | B | MID | renault-samsung-qm6-2016 | renault-samsung-qm6-2016 | QM6 | 르노 | 2016-2019 | — | QM6 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 11 | B | MID | renault-samsung-qm6-quest-2023 | renault-samsung-qm6-quest-2023 | QM6 퀘스트 | 르노 | 2023-현재 | — | QM6 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 12 | B | MID | renault-samsung-sm3-2005 | renault-samsung-sm3-2005 | SM3 | 르노 | 2005-2008 | — | SM3 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 13 | B | MID | renault-samsung-sm3-neo-2014 | renault-samsung-sm3-neo-2014 | SM3 네오 | 르노 | 2014-2019 | — | SM3 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 14 | B | MID | renault-samsung-sm3-ze-2013 | renault-samsung-sm3-ze-2013 | SM3 Z.E. | 르노 | 2013-2019 | — | SM3 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 15 | B | MID | renault-samsung-sm5-nova-2015 | renault-samsung-sm5-nova-2015 | SM5 노바 | 르노 | 2015-2019 | — | SM5 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 16 | B | MID | renault-samsung-sm5-new-impression-2007 | renault-samsung-sm5-new-impression-2007 | SM5 뉴 임프레션 | 르노 | 2007-2009 | — | SM5 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 17 | B | MID | renault-samsung-sm6-2016 | renault-samsung-sm6-2016 | SM6 | 르노 | 2016-2019 | — | SM6 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 18 | B | MID | renault-samsung-sm7-nova-2014 | renault-samsung-sm7-nova-2014 | SM7 노바 | 르노 | 2014-2019 | — | SM7 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 19 | B | MID | renault-samsung-sm7-new-art-2008 | renault-samsung-sm7-new-art-2008 | SM7 뉴 아트 | 르노 | 2008-2010 | — | SM7 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 20 | B | MID | renault-samsung-xm3-2020 | renault-samsung-xm3-2020 | XM3 | 르노 | 2020-현재 | — | XM3 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 21 | B | MID | gmdaewoo-damas-2011 | gmdaewoo-damas-2011 | 다마스 | 쉐보레 | 2011-현재 | — | 다마스 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 22 | B | MID | chevrolet-spark-2015 | chevrolet-spark-2015 | 더 넥스트 스파크 | 쉐보레 | 2015-2018 | — | 스파크 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 23 | B | MID | chevrolet-captiva-2016 | chevrolet-captiva-2016 | 더 넥스트 캡티바 | 쉐보레 | 2016-2018 | — | 캡티바 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 24 | B | MID | chevrolet-malibu-2019 | chevrolet-malibu-2019 | 더 뉴 말리부 | 쉐보레 | 2019-2022 | — | 말리부 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 25 | B | MID | chevrolet-spark-2018 | chevrolet-spark-2018 | 더 뉴 스파크 | 쉐보레 | 2018-2020 | — | 스파크 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 26 | B | MID | chevrolet-the-new-cruze-2015 | chevrolet-the-new-cruze-2015 | 더 뉴 크루즈 | 쉐보레 | 2015-2016 | — | 크루즈 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 27 | B | MID | chevrolet-trax-2017 | chevrolet-trax-2017 | 더 뉴 트랙스 | 쉐보레 | 2017-2022 | — | 트랙스 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 28 | B | MID | gmdaewoo-labo-2011 | gmdaewoo-labo-2011 | 라보 | 쉐보레 | 2011-현재 | — | 라보 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 29 | B | MID | gmdaewoo-lacetti-2006 | gmdaewoo-lacetti-2006 | 라세티 | 쉐보레 | 2006-2008 | — | 라세티 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 30 | B | MID | daewoo-lacetti-premiere-2008 | daewoo-lacetti-premiere-2008 | 라세티 프리미어 | 쉐보레 | 2008-2011 | — | 라세티, 크루즈 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 31 | B | MID | gmdaewoo-matiz-creative-2009 | gmdaewoo-matiz-creative-2009 | 마티즈 크리에이티브 | 쉐보레 | 2009-2011 | — | 마티즈, 스파크 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 32 | B | MID | chevrolet-malibu-2011 | chevrolet-malibu-2011 | 말리부 | 쉐보레 | 2011-2016 | — | 말리부 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 33 | B | MID | chevrolet-bolt-ev-2017 | chevrolet-bolt-ev-2017 | 볼트 EV | 쉐보레 | 2017-현재 | — | 볼트 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 34 | B | MID | chevrolet-spark-2011 | chevrolet-spark-2011 | 스파크 | 쉐보레 | 2011-2013 | — | 스파크 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 35 | B | MID | chevrolet-spark-2021 | chevrolet-spark-2021 | 스파크 | 쉐보레 | 2021-2022 | — | 스파크 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 36 | B | MID | chevrolet-spark-s-2013 | chevrolet-spark-s-2013 | 스파크 S | 쉐보레 | 2013-2015 | — | 스파크 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 37 | B | MID | chevrolet-aveo-2011 | chevrolet-aveo-2011 | 아베오 | 쉐보레 | 2011-2015 | — | 아베오 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 38 | B | MID | gmdaewoo-alpheon-2010 | gmdaewoo-alpheon-2010 | 알페온 | 쉐보레 | 2010-2015 | — | 알페온 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 39 | B | MID | chevrolet-malibu-2016 | chevrolet-malibu-2016 | 올 뉴 말리부 | 쉐보레 | 2016-2018 | — | 말리부 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 40 | B | MID | chevrolet-all-new-cruze-2017 | chevrolet-all-new-cruze-2017 | 올 뉴 크루즈 | 쉐보레 | 2017-2018 | — | 크루즈 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 41 | B | MID | chevrolet-orlando-2011 | chevrolet-orlando-2011 | 올란도 | 쉐보레 | 2011-2018 | — | 올란도 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 42 | B | MID | gmdaewoo-winstorm-2006 | gmdaewoo-winstorm-2006 | 윈스톰 | 쉐보레 | 2006-2011 | — | 윈스톰, 캡티바 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 43 | B | MID | chevrolet-equinox-2018 | chevrolet-equinox-2018 | 이쿼녹스 | 쉐보레 | 2018-2021 | — | 이쿼녹스 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 44 | B | MID | chevrolet-equinox-2022 | chevrolet-equinox-2022 | 이쿼녹스 | 쉐보레 | 2022-현재 | — | 이쿼녹스 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 45 | B | MID | chevrolet-impala-2016 | chevrolet-impala-2016 | 임팔라 | 쉐보레 | 2016-2020 | — | 임팔라 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 46 | C | LOW | gmdaewoo-gentra-x-2007 | gmdaewoo-gentra-x-2007 | 젠트라 X | 쉐보레 | 2007-2011 | — | 젠트라 | 0 | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-batt… | 노출 제외·검색 후순위 유지; DB 연결보다 카탈로그 정리 우선 |
| 47 | B | MID | chevrolet-captiva-2011 | chevrolet-captiva-2011 | 캡티바 | 쉐보레 | 2011-2016 | — | 캡티바 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 48 | B | MID | chevrolet-colorado-2019 | chevrolet-colorado-2019 | 콜로라도 | 쉐보레 | 2019-2020 | — | 콜로라도 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 49 | B | MID | chevrolet-colorado-2021 | chevrolet-colorado-2021 | 콜로라도 | 쉐보레 | 2021-현재 | — | 콜로라도 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 50 | B | MID | chevrolet-cruze-2011 | chevrolet-cruze-2011 | 크루즈 | 쉐보레 | 2011-2015 | — | 크루즈 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 51 | C | LOW | daewoo-tosca-2006 | daewoo-tosca-2006 | 토스카 | 쉐보레 | 2006-2011 | — | 토스카 | 0 | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-batt… | 노출 제외·검색 후순위 유지; DB 연결보다 카탈로그 정리 우선 |
| 52 | B | MID | chevrolet-traverse-2019 | chevrolet-traverse-2019 | 트래버스 | 쉐보레 | 2019-현재 | — | 트래버스 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 53 | B | MID | chevrolet-trax-2013 | chevrolet-trax-2013 | 트랙스 | 쉐보레 | 2013-2016 | — | 트랙스 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 54 | B | MID | chevrolet-trax-crossover-2023 | chevrolet-trax-crossover-2023 | 트랙스 크로스오버 | 쉐보레 | 2023-현재 | — | 트랙스 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 55 | B | MID | chevrolet-trailblazer-2020 | chevrolet-trailblazer-2020 | 트레일블레이저 | 쉐보레 | 2020-2023 | — | 트레일블레이저 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 56 | B | MID | chevrolet-trailblazer-2024 | chevrolet-trailblazer-2024 | 트레일블레이저 | 쉐보레 | 2024-현재 | — | 트레일블레이저 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 57 | A | HIGH | santafe-mx5-hev | santafe-mx5-hev | 싼타페 하이브리드 | 현대 | 2023-현재 | — | 싼타페 | 5 | dbModels로 DB 레코드는 존재하나 getRecordsForSlug(slug) 0건 — catalogId/slug·세대토큰·연식 필터 불일치; 세대 토큰(MX5,하이브리드) 매칭 실패로 레코드 필터링; dbMo… | vehicle-canonical-db-bridge·GENERATION_TOKEN 보강; catalogId↔slug 프로필 점검; dbModels… |
| 58 | C | LOW | ssangyong-new-chairman-2005 | ssangyong-new-chairman-2005 | 뉴 체어맨 | KG·쌍용 | 2005-2007 | — | 체어맨 | 0 | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-batt… | 노출 제외·검색 후순위 유지; DB 연결보다 카탈로그 정리 우선 |
| 59 | B | MID | kg-the-new-tivoli-2023 | kg-the-new-tivoli-2023 | 더 뉴 티볼리 | KG·쌍용 | 2023-현재 | — | 티볼리 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 60 | C | LOW | ssangyong-rexton-2001 | ssangyong-rexton-2001 | 렉스턴 | KG·쌍용 | 2001-2006 | — | 렉스턴 | 0 | recommendExcluded=true — 기본 추천·노출 후보 제외; 연식 2005년 미만 — 레거시 노출 제외 후보; batteryMatchStatus=needsReview — 확정 배터리(defaultBatt… | 노출 제외·검색 후순위 유지; DB 연결보다 카탈로그 정리 우선 |
| 61 | B | MID | ssangyong-rexton-sports-2018 | ssangyong-rexton-sports-2018 | 렉스턴 스포츠 | KG·쌍용 | 2018-2023 | — | 렉스턴 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 62 | B | MID | ssangyong-rexton-sports-khan-2019 | ssangyong-rexton-sports-khan-2019 | 렉스턴 스포츠 칸 | KG·쌍용 | 2019-2023 | — | 렉스턴 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 63 | C | LOW | ssangyong-musso-sports-2002 | ssangyong-musso-sports-2002 | 무쏘 스포츠 | KG·쌍용 | 2002-2004 | — | 무쏘 | 0 | recommendExcluded=true — 기본 추천·노출 후보 제외; 연식 2005년 미만 — 레거시 노출 제외 후보; batteryMatchStatus=needsReview — 확정 배터리(defaultBatt… | 노출 제외·검색 후순위 유지; DB 연결보다 카탈로그 정리 우선 |
| 64 | B | MID | ssangyong-very-new-tivoli-2019 | ssangyong-very-new-tivoli-2019 | 베리 뉴 티볼리 | KG·쌍용 | 2019-2022 | — | 티볼리 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 65 | B | MID | ssangyong-viewtiful-korando-2019 | ssangyong-viewtiful-korando-2019 | 뷰티풀 코란도 | KG·쌍용 | 2019-2021 | — | 코란도 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 66 | C | LOW | ssangyong-actyon-2005 | ssangyong-actyon-2005 | 액티언 | KG·쌍용 | 2005-2006 | — | 액티언 | 0 | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-batt… | 노출 제외·검색 후순위 유지; DB 연결보다 카탈로그 정리 우선 |
| 67 | B | MID | kg-actyon-2024 | kg-actyon-2024 | 액티언 | KG·쌍용 | 2024-현재 | — | 액티언 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 68 | C | LOW | ssangyong-actyon-sports-2006 | ssangyong-actyon-sports-2006 | 액티언 스포츠 | KG·쌍용 | 2006-2018 | — | 액티언 | 0 | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-batt… | 노출 제외·검색 후순위 유지; DB 연결보다 카탈로그 정리 우선 |
| 69 | B | MID | ssangyong-all-new-rexton-2020 | ssangyong-all-new-rexton-2020 | 올 뉴 렉스턴 | KG·쌍용 | 2020-2023 | — | 렉스턴 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 70 | B | MID | ssangyong-chairman-w-2008 | ssangyong-chairman-w-2008 | 체어맨 W | KG·쌍용 | 2008-2017 | — | 체어맨 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 71 | C | LOW | ssangyong-kyron-2005 | ssangyong-kyron-2005 | 카이런 | KG·쌍용 | 2005-2014 | — | 카이런 | 0 | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-batt… | 노출 제외·검색 후순위 유지; DB 연결보다 카탈로그 정리 우선 |
| 72 | B | MID | ssangyong-korando-sports-2012 | ssangyong-korando-sports-2012 | 코란도 스포츠 | KG·쌍용 | 2012-2018 | — | 코란도 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 73 | B | MID | ssangyong-korando-emotion-2022 | ssangyong-korando-emotion-2022 | 코란도 이모션 | KG·쌍용 | 2022-현재 | — | 코란도 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 74 | B | MID | ssangyong-korando-turismo-2013 | ssangyong-korando-turismo-2013 | 코란도 투리스모 | KG·쌍용 | 2013-2019 | — | 코란도 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 75 | B | MID | ssangyong-korando-c-2011 | ssangyong-korando-c-2011 | 코란도 C | KG·쌍용 | 2011-2012 | — | 코란도 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 76 | B | MID | ssangyong-new-korando-c-2013 | ssangyong-new-korando-c-2013 | 코란도 C | KG·쌍용 | 2013-2016 | — | 코란도 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 77 | B | MID | ssangyong-new-style-korando-c-2017 | ssangyong-new-style-korando-c-2017 | 코란도 C | KG·쌍용 | 2017-2018 | — | 코란도 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 78 | B | MID | kg-torres-2022 | kg-torres-2022 | 토레스 | KG·쌍용 | 2022-현재 | — | 토레스 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 79 | B | MID | kg-torres-evx-2023 | kg-torres-evx-2023 | 토레스 EVX | KG·쌍용 | 2023-현재 | — | 토레스 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 80 | B | MID | ssangyong-tivoli-2015 | ssangyong-tivoli-2015 | 티볼리 | KG·쌍용 | 2015-2016 | — | 티볼리 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 81 | B | MID | ssangyong-tivoli-armour-2017 | ssangyong-tivoli-armour-2017 | 티볼리 아머 | KG·쌍용 | 2017-2018 | — | 티볼리 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 82 | B | MID | ssangyong-tivoli-air-2016 | ssangyong-tivoli-air-2016 | 티볼리 에어 | KG·쌍용 | 2016-2020 | — | 티볼리 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 83 | B | MID | ssangyong-tivoli-air-2021 | ssangyong-tivoli-air-2021 | 티볼리 에어 | KG·쌍용 | 2021-2022 | — | 티볼리 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |
| 84 | B | MID | ssangyong-g4-rexton-2017 | ssangyong-g4-rexton-2017 | G4 렉스턴 | KG·쌍용 | 2017-2019 | — | 렉스턴 | 0 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음… | DB confirmed 정리 후 asset.batteryMatchStatus=linked; defaultBatteryCode는 DB 확정 후에만 |

## 5. DB 후보가 있는 unmatched
vehicle-battery-db에서 model/displayName/alias 검색 또는 slug 연결로 후보가 1건 이상인데도 카드 확정이 없는 차량.

총 **1**건

| assetId | displayName | 후보(model/display/alias/slug) | top DB | group | priority |
|---------|-------------|--------------------------------|--------|-------|----------|
| santafe-mx5-hev | 싼타페 하이브리드 | 32/0/32/0 | 더 뉴 싼타페 2.5 가솔린(21년~현재)(AGM70L, score 125); 더 뉴 싼타페 디젤(21년~현재)(AGM80L, score 125) | A | HIGH |

## 6. 진짜 DB 후보가 없는 unmatched
총 **83**건

| assetId | displayName | brand | yearRange | 원인 |
|---------|-------------|-------|-----------|------|
| renault-samsung-new-sm3-2009 | 뉴 SM3 | 르노코리아 | 2009-2013 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-new-sm5-2010 | 뉴 SM5 | 르노코리아 | 2010-2012 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-the-new-qm6-2019 | 더 뉴 QM6 | 르노코리아 | 2019-2022 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-the-new-sm6-2020 | 더 뉴 SM6 | 르노코리아 | 2020-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-master-2018 | 르노 마스터 | 르노코리아 | 2018-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-arkana-2024 | 아르카나 | 르노코리아 | 2024-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-all-new-sm7-2011 | 올 뉴 SM7 | 르노코리아 | 2011-2013 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-qm3-2013 | QM3 | 르노코리아 | 2013-2016 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-qm5-2007 | QM5 | 르노코리아 | 2007-2013 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-qm6-2016 | QM6 | 르노코리아 | 2016-2019 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-qm6-quest-2023 | QM6 퀘스트 | 르노코리아 | 2023-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-sm3-2005 | SM3 | 르노코리아 | 2005-2008 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-sm3-neo-2014 | SM3 네오 | 르노코리아 | 2014-2019 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-sm3-ze-2013 | SM3 Z.E. | 르노코리아 | 2013-2019 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-sm5-nova-2015 | SM5 노바 | 르노코리아 | 2015-2019 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-sm5-new-impression-2007 | SM5 뉴 임프레션 | 르노코리아 | 2007-2009 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-sm6-2016 | SM6 | 르노코리아 | 2016-2019 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-sm7-nova-2014 | SM7 노바 | 르노코리아 | 2014-2019 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-sm7-new-art-2008 | SM7 뉴 아트 | 르노코리아 | 2008-2010 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| renault-samsung-xm3-2020 | XM3 | 르노코리아 | 2020-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| gmdaewoo-damas-2011 | 다마스 | 쉐보레/GM | 2011-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-spark-2015 | 더 넥스트 스파크 | 쉐보레/GM | 2015-2018 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-captiva-2016 | 더 넥스트 캡티바 | 쉐보레/GM | 2016-2018 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-malibu-2019 | 더 뉴 말리부 | 쉐보레/GM | 2019-2022 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-spark-2018 | 더 뉴 스파크 | 쉐보레/GM | 2018-2020 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-the-new-cruze-2015 | 더 뉴 크루즈 | 쉐보레/GM | 2015-2016 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-trax-2017 | 더 뉴 트랙스 | 쉐보레/GM | 2017-2022 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| gmdaewoo-labo-2011 | 라보 | 쉐보레/GM | 2011-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| gmdaewoo-lacetti-2006 | 라세티 | 쉐보레/GM | 2006-2008 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| daewoo-lacetti-premiere-2008 | 라세티 프리미어 | 쉐보레/GM | 2008-2011 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| gmdaewoo-matiz-creative-2009 | 마티즈 크리에이티브 | 쉐보레/GM | 2009-2011 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-malibu-2011 | 말리부 | 쉐보레/GM | 2011-2016 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-bolt-ev-2017 | 볼트 EV | 쉐보레/GM | 2017-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-spark-2011 | 스파크 | 쉐보레/GM | 2011-2013 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-spark-2021 | 스파크 | 쉐보레/GM | 2021-2022 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-spark-s-2013 | 스파크 S | 쉐보레/GM | 2013-2015 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-aveo-2011 | 아베오 | 쉐보레/GM | 2011-2015 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| gmdaewoo-alpheon-2010 | 알페온 | 쉐보레/GM | 2010-2015 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-malibu-2016 | 올 뉴 말리부 | 쉐보레/GM | 2016-2018 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-all-new-cruze-2017 | 올 뉴 크루즈 | 쉐보레/GM | 2017-2018 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-orlando-2011 | 올란도 | 쉐보레/GM | 2011-2018 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| gmdaewoo-winstorm-2006 | 윈스톰 | 쉐보레/GM | 2006-2011 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-equinox-2018 | 이쿼녹스 | 쉐보레/GM | 2018-2021 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-equinox-2022 | 이쿼녹스 | 쉐보레/GM | 2022-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-impala-2016 | 임팔라 | 쉐보레/GM | 2016-2020 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| gmdaewoo-gentra-x-2007 | 젠트라 X | 쉐보레/GM | 2007-2011 | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-captiva-2011 | 캡티바 | 쉐보레/GM | 2011-2016 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-colorado-2019 | 콜로라도 | 쉐보레/GM | 2019-2020 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-colorado-2021 | 콜로라도 | 쉐보레/GM | 2021-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-cruze-2011 | 크루즈 | 쉐보레/GM | 2011-2015 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| daewoo-tosca-2006 | 토스카 | 쉐보레/GM | 2006-2011 | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-traverse-2019 | 트래버스 | 쉐보레/GM | 2019-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-trax-2013 | 트랙스 | 쉐보레/GM | 2013-2016 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-trax-crossover-2023 | 트랙스 크로스오버 | 쉐보레/GM | 2023-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-trailblazer-2020 | 트레일블레이저 | 쉐보레/GM | 2020-2023 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| chevrolet-trailblazer-2024 | 트레일블레이저 | 쉐보레/GM | 2024-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-new-chairman-2005 | 뉴 체어맨 | 쌍용 | 2005-2007 | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| kg-the-new-tivoli-2023 | 더 뉴 티볼리 | KGM | 2023-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-rexton-2001 | 렉스턴 | 쌍용 | 2001-2006 | recommendExcluded=true — 기본 추천·노출 후보 제외; 연식 2005년 미만 — 레거시 노출 제외 후보; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-rexton-sports-2018 | 렉스턴 스포츠 | 쌍용 | 2018-2023 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-rexton-sports-khan-2019 | 렉스턴 스포츠 칸 | 쌍용 | 2019-2023 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-musso-sports-2002 | 무쏘 스포츠 | 쌍용 | 2002-2004 | recommendExcluded=true — 기본 추천·노출 후보 제외; 연식 2005년 미만 — 레거시 노출 제외 후보; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-very-new-tivoli-2019 | 베리 뉴 티볼리 | 쌍용 | 2019-2022 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-viewtiful-korando-2019 | 뷰티풀 코란도 | 쌍용 | 2019-2021 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-actyon-2005 | 액티언 | 쌍용 | 2005-2006 | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| kg-actyon-2024 | 액티언 | KGM | 2024-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-actyon-sports-2006 | 액티언 스포츠 | 쌍용 | 2006-2018 | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-all-new-rexton-2020 | 올 뉴 렉스턴 | 쌍용 | 2020-2023 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-chairman-w-2008 | 체어맨 W | 쌍용 | 2008-2017 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-kyron-2005 | 카이런 | 쌍용 | 2005-2014 | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-korando-sports-2012 | 코란도 스포츠 | 쌍용 | 2012-2018 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-korando-emotion-2022 | 코란도 이모션 | 쌍용 | 2022-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-korando-turismo-2013 | 코란도 투리스모 | 쌍용 | 2013-2019 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-korando-c-2011 | 코란도 C | 쌍용 | 2011-2012 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-new-korando-c-2013 | 코란도 C | 쌍용 | 2013-2016 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-new-style-korando-c-2017 | 코란도 C | 쌍용 | 2017-2018 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| kg-torres-2022 | 토레스 | KGM | 2022-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| kg-torres-evx-2023 | 토레스 EVX | KGM | 2023-현재 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-tivoli-2015 | 티볼리 | 쌍용 | 2015-2016 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-tivoli-armour-2017 | 티볼리 아머 | 쌍용 | 2017-2018 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-tivoli-air-2016 | 티볼리 에어 | 쌍용 | 2016-2020 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-tivoli-air-2021 | 티볼리 에어 | 쌍용 | 2021-2022 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-g4-rexton-2017 | G4 렉스턴 | 쌍용 | 2017-2019 | batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |

## 7. 노출 제외 후보
총 **8**건

| assetId | displayName | yearRange | recommendExcluded | group | 원인 |
|---------|-------------|-----------|-------------------|-------|------|
| gmdaewoo-gentra-x-2007 | 젠트라 X | 2007-2011 | Y | C | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| daewoo-tosca-2006 | 토스카 | 2006-2011 | Y | C | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-new-chairman-2005 | 뉴 체어맨 | 2005-2007 | Y | C | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-rexton-2001 | 렉스턴 | 2001-2006 | Y | C | recommendExcluded=true — 기본 추천·노출 후보 제외; 연식 2005년 미만 — 레거시 노출 제외 후보; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-musso-sports-2002 | 무쏘 스포츠 | 2002-2004 | Y | C | recommendExcluded=true — 기본 추천·노출 후보 제외; 연식 2005년 미만 — 레거시 노출 제외 후보; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-actyon-2005 | 액티언 | 2005-2006 | Y | C | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-actyon-sports-2006 | 액티언 스포츠 | 2006-2018 | Y | C | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |
| ssangyong-kyron-2005 | 카이런 | 2005-2014 | Y | C | recommendExcluded=true — 기본 추천·노출 후보 제외; batteryMatchStatus=needsReview — 확정 배터리(defaultBatteryCode) 연결 제외; vehicle-battery-db에 model/displayName/alias 유사 레코드 없음 — 실제 미등록 또는 수입·비주류 |

## 부록: 국산차 / 수입차 분리
### 국산차
- [1] **뉴 SM3** (renault-samsung-new-sm3-2009) — B/MID
- [2] **뉴 SM5** (renault-samsung-new-sm5-2010) — B/MID
- [3] **더 뉴 QM6** (renault-samsung-the-new-qm6-2019) — B/MID
- [4] **더 뉴 SM6** (renault-samsung-the-new-sm6-2020) — B/MID
- [5] **르노 마스터** (renault-master-2018) — B/MID
- [6] **아르카나** (renault-arkana-2024) — B/MID
- [7] **올 뉴 SM7** (renault-samsung-all-new-sm7-2011) — B/MID
- [8] **QM3** (renault-samsung-qm3-2013) — B/MID
- [9] **QM5** (renault-samsung-qm5-2007) — B/MID
- [10] **QM6** (renault-samsung-qm6-2016) — B/MID
- [11] **QM6 퀘스트** (renault-samsung-qm6-quest-2023) — B/MID
- [12] **SM3** (renault-samsung-sm3-2005) — B/MID
- [13] **SM3 네오** (renault-samsung-sm3-neo-2014) — B/MID
- [14] **SM3 Z.E.** (renault-samsung-sm3-ze-2013) — B/MID
- [15] **SM5 노바** (renault-samsung-sm5-nova-2015) — B/MID
- [16] **SM5 뉴 임프레션** (renault-samsung-sm5-new-impression-2007) — B/MID
- [17] **SM6** (renault-samsung-sm6-2016) — B/MID
- [18] **SM7 노바** (renault-samsung-sm7-nova-2014) — B/MID
- [19] **SM7 뉴 아트** (renault-samsung-sm7-new-art-2008) — B/MID
- [20] **XM3** (renault-samsung-xm3-2020) — B/MID
- [21] **다마스** (gmdaewoo-damas-2011) — B/MID
- [22] **더 넥스트 스파크** (chevrolet-spark-2015) — B/MID
- [23] **더 넥스트 캡티바** (chevrolet-captiva-2016) — B/MID
- [24] **더 뉴 말리부** (chevrolet-malibu-2019) — B/MID
- [25] **더 뉴 스파크** (chevrolet-spark-2018) — B/MID
- [26] **더 뉴 크루즈** (chevrolet-the-new-cruze-2015) — B/MID
- [27] **더 뉴 트랙스** (chevrolet-trax-2017) — B/MID
- [28] **라보** (gmdaewoo-labo-2011) — B/MID
- [29] **라세티** (gmdaewoo-lacetti-2006) — B/MID
- [30] **라세티 프리미어** (daewoo-lacetti-premiere-2008) — B/MID
- [31] **마티즈 크리에이티브** (gmdaewoo-matiz-creative-2009) — B/MID
- [32] **말리부** (chevrolet-malibu-2011) — B/MID
- [33] **볼트 EV** (chevrolet-bolt-ev-2017) — B/MID
- [34] **스파크** (chevrolet-spark-2011) — B/MID
- [35] **스파크** (chevrolet-spark-2021) — B/MID
- [36] **스파크 S** (chevrolet-spark-s-2013) — B/MID
- [37] **아베오** (chevrolet-aveo-2011) — B/MID
- [38] **알페온** (gmdaewoo-alpheon-2010) — B/MID
- [39] **올 뉴 말리부** (chevrolet-malibu-2016) — B/MID
- [40] **올 뉴 크루즈** (chevrolet-all-new-cruze-2017) — B/MID
- [41] **올란도** (chevrolet-orlando-2011) — B/MID
- [42] **윈스톰** (gmdaewoo-winstorm-2006) — B/MID
- [43] **이쿼녹스** (chevrolet-equinox-2018) — B/MID
- [44] **이쿼녹스** (chevrolet-equinox-2022) — B/MID
- [45] **임팔라** (chevrolet-impala-2016) — B/MID
- [46] **젠트라 X** (gmdaewoo-gentra-x-2007) — C/LOW
- [47] **캡티바** (chevrolet-captiva-2011) — B/MID
- [48] **콜로라도** (chevrolet-colorado-2019) — B/MID
- [49] **콜로라도** (chevrolet-colorado-2021) — B/MID
- [50] **크루즈** (chevrolet-cruze-2011) — B/MID
- [51] **토스카** (daewoo-tosca-2006) — C/LOW
- [52] **트래버스** (chevrolet-traverse-2019) — B/MID
- [53] **트랙스** (chevrolet-trax-2013) — B/MID
- [54] **트랙스 크로스오버** (chevrolet-trax-crossover-2023) — B/MID
- [55] **트레일블레이저** (chevrolet-trailblazer-2020) — B/MID
- [56] **트레일블레이저** (chevrolet-trailblazer-2024) — B/MID
- [57] **싼타페 하이브리드** (santafe-mx5-hev) — A/HIGH
- [58] **뉴 체어맨** (ssangyong-new-chairman-2005) — C/LOW
- [59] **더 뉴 티볼리** (kg-the-new-tivoli-2023) — B/MID
- [60] **렉스턴** (ssangyong-rexton-2001) — C/LOW
- [61] **렉스턴 스포츠** (ssangyong-rexton-sports-2018) — B/MID
- [62] **렉스턴 스포츠 칸** (ssangyong-rexton-sports-khan-2019) — B/MID
- [63] **무쏘 스포츠** (ssangyong-musso-sports-2002) — C/LOW
- [64] **베리 뉴 티볼리** (ssangyong-very-new-tivoli-2019) — B/MID
- [65] **뷰티풀 코란도** (ssangyong-viewtiful-korando-2019) — B/MID
- [66] **액티언** (ssangyong-actyon-2005) — C/LOW
- [67] **액티언** (kg-actyon-2024) — B/MID
- [68] **액티언 스포츠** (ssangyong-actyon-sports-2006) — C/LOW
- [69] **올 뉴 렉스턴** (ssangyong-all-new-rexton-2020) — B/MID
- [70] **체어맨 W** (ssangyong-chairman-w-2008) — B/MID
- [71] **카이런** (ssangyong-kyron-2005) — C/LOW
- [72] **코란도 스포츠** (ssangyong-korando-sports-2012) — B/MID
- [73] **코란도 이모션** (ssangyong-korando-emotion-2022) — B/MID
- [74] **코란도 투리스모** (ssangyong-korando-turismo-2013) — B/MID
- [75] **코란도 C** (ssangyong-korando-c-2011) — B/MID
- [76] **코란도 C** (ssangyong-new-korando-c-2013) — B/MID
- [77] **코란도 C** (ssangyong-new-style-korando-c-2017) — B/MID
- [78] **토레스** (kg-torres-2022) — B/MID
- [79] **토레스 EVX** (kg-torres-evx-2023) — B/MID
- [80] **티볼리** (ssangyong-tivoli-2015) — B/MID
- [81] **티볼리 아머** (ssangyong-tivoli-armour-2017) — B/MID
- [82] **티볼리 에어** (ssangyong-tivoli-air-2016) — B/MID
- [83] **티볼리 에어** (ssangyong-tivoli-air-2021) — B/MID
- [84] **G4 렉스턴** (ssangyong-g4-rexton-2017) — B/MID

### 수입차
- (이번 unmatched 목록에 수입차 asset 없음)