# Vehicle DB Integrity Audit

생성: 2026-06-03T03:31:46.243Z

## 1. 요약

| 항목 | 값 |
|------|-----|
| vehicleBatteryDbRecords | undefined |
| enrichmentRecords | 5 |
| totalAssets | 174 |
| genesisAssets | 9 |
| v04Assets | 57 |
| chevroletAssets | 36 |
| aliasEntries | 339 |
| forbiddenCopyFindings | 141 |
| unmatchedAssets | 108 |
| riskyDisplayAliases | 6 |
| searchFailures | 1 |
| directionMismatches | 0 |
| searchContamination | 0 |
| totalFindings | 261 |
| searchResults | [object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object] |

## 2. 즉시 수정 필요 (P0: 92)

| 파일 | 문제 | 현재값 | 수정 제안 |
|------|------|--------|----------|
| vehicle-alias-db.ts | risky_display_name | 팰리세이드 LX2 | 고객 통용 정식명으로 변경 |
| vehicle-alias-db.ts | risky_display_name | 그랜드 스타렉스 | 고객 통용 정식명으로 변경 |
| vehicle-alias-db.ts | risky_display_name | 그랜드 스타렉스 | 고객 통용 정식명으로 변경 |
| vehicle-alias-v02-supplement.ts | risky_display_name | 그랜드 스타렉스 | 고객 통용 정식명으로 변경 |
| vehicle-alias-v04-supplement.ts | risky_display_name | 그랜드 스타렉스 | 고객 통용 정식명으로 변경 |
| src/lib/vehicle-search.ts | source_contains_forbidden | needsReview | 고객 노출 경로에서 제거 또는 sanitize |
| src/lib/vehicle-search.ts | source_contains_forbidden | slug | 고객 노출 경로에서 제거 또는 sanitize |
| src/lib/vehicle-search.ts | source_contains_forbidden | 연료별 확인 | 고객 노출 경로에서 제거 또는 sanitize |
| src/lib/vehicle-search.ts | source_contains_forbidden | 규격 재확인 | 고객 노출 경로에서 제거 또는 sanitize |
| src/lib/vehicle-asset-chevrolet.ts | source_contains_forbidden | needsReview | 고객 노출 경로에서 제거 또는 sanitize |
| src/data/vehicle-generation-chevrolet.config.ts | source_contains_forbidden | vehicle-battery-db | 고객 노출 경로에서 제거 또는 sanitize |
| src/data/vehicle-generation-chevrolet.config.ts | source_contains_forbidden | needsReview | 고객 노출 경로에서 제거 또는 sanitize |
| src/data/vehicle-generation-chevrolet.config.ts | source_contains_forbidden | 미등록 | 고객 노출 경로에서 제거 또는 sanitize |
| src/data/vehicle-generation-chevrolet.config.ts | source_contains_forbidden | slug | 고객 노출 경로에서 제거 또는 sanitize |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 마티즈 크리에이티브 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 마티즈 크리에이티브 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 스파크 M300 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 스파크 M300 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 스파크 S 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 스파크 S 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 더 넥스트 스파크 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 더 넥스트 스파크 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 더 뉴 스파크 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 더 뉴 스파크 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 스파크(21~) 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 스파크(21~) 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 라세티 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 라세티 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 라세티 프리미어(크루즈 J300 전) 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 라세티 프리미어(크루즈 J300 전) 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 크루즈 J300 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 크루즈 J300 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 더 뉴 크루즈 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 더 뉴 크루즈 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 올 뉴 크루즈 D2LC 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 올 뉴 크루즈 D2LC 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 말리부 V300 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 말리부 V300 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 올 뉴 말리부 V400 규격 확인 필요 | 사진 확인 권장 |
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | vehicle-battery-db 미등록 — 올 뉴 말리부 V400 규격 확인 필요 | 사진 확인 권장 |

*(P0 52건 추가 — JSON 참고)*

## 3. 고객 노출 금지 문구

- **vehicle-generation-chevrolet.config.ts** `gmdaewoo-matiz-creative-2009.battery.note`: "vehicle-battery-db 미등록 — 마티즈 크리에이티브 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `gmdaewoo-matiz-creative-2009.battery.note`: "vehicle-battery-db 미등록 — 마티즈 크리에이티브 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-spark-2011.battery.note`: "vehicle-battery-db 미등록 — 스파크 M300 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-spark-2011.battery.note`: "vehicle-battery-db 미등록 — 스파크 M300 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-spark-s-2013.battery.note`: "vehicle-battery-db 미등록 — 스파크 S 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-spark-s-2013.battery.note`: "vehicle-battery-db 미등록 — 스파크 S 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-spark-2015.battery.note`: "vehicle-battery-db 미등록 — 더 넥스트 스파크 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-spark-2015.battery.note`: "vehicle-battery-db 미등록 — 더 넥스트 스파크 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-spark-2018.battery.note`: "vehicle-battery-db 미등록 — 더 뉴 스파크 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-spark-2018.battery.note`: "vehicle-battery-db 미등록 — 더 뉴 스파크 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-spark-2021.battery.note`: "vehicle-battery-db 미등록 — 스파크(21~) 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-spark-2021.battery.note`: "vehicle-battery-db 미등록 — 스파크(21~) 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `gmdaewoo-lacetti-2006.battery.note`: "vehicle-battery-db 미등록 — 라세티 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `gmdaewoo-lacetti-2006.battery.note`: "vehicle-battery-db 미등록 — 라세티 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `daewoo-lacetti-premiere-2008.battery.note`: "vehicle-battery-db 미등록 — 라세티 프리미어(크루즈 J300 전) 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `daewoo-lacetti-premiere-2008.battery.note`: "vehicle-battery-db 미등록 — 라세티 프리미어(크루즈 J300 전) 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-cruze-2011.battery.note`: "vehicle-battery-db 미등록 — 크루즈 J300 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-cruze-2011.battery.note`: "vehicle-battery-db 미등록 — 크루즈 J300 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-the-new-cruze-2015.battery.note`: "vehicle-battery-db 미등록 — 더 뉴 크루즈 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-the-new-cruze-2015.battery.note`: "vehicle-battery-db 미등록 — 더 뉴 크루즈 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-all-new-cruze-2017.battery.note`: "vehicle-battery-db 미등록 — 올 뉴 크루즈 D2LC 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-all-new-cruze-2017.battery.note`: "vehicle-battery-db 미등록 — 올 뉴 크루즈 D2LC 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-malibu-2011.battery.note`: "vehicle-battery-db 미등록 — 말리부 V300 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-malibu-2011.battery.note`: "vehicle-battery-db 미등록 — 말리부 V300 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-malibu-2016.battery.note`: "vehicle-battery-db 미등록 — 올 뉴 말리부 V400 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-malibu-2016.battery.note`: "vehicle-battery-db 미등록 — 올 뉴 말리부 V400 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-malibu-2019.battery.note`: "vehicle-battery-db 미등록 — 더 뉴 말리부(HEV 포함) 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `chevrolet-malibu-2019.battery.note`: "vehicle-battery-db 미등록 — 더 뉴 말리부(HEV 포함) 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `gmdaewoo-winstorm-2006.battery.note`: "vehicle-battery-db 미등록 — 윈스톰 규격 확인 필요" → 사진 확인 권장
- **vehicle-generation-chevrolet.config.ts** `gmdaewoo-winstorm-2006.battery.note`: "vehicle-battery-db 미등록 — 윈스톰 규격 확인 필요" → 사진 확인 권장

## 4. 이상한 표시명/별칭

- 팰리세이드 LX2: `팰리세이드` (vehicle-alias-db.ts)
- 팰리세이드 LX2: `더 뉴 팰리세이드` (vehicle-alias-db.ts)
- 그랜드 스타렉스: `그랜드 스타렉스` (vehicle-alias-db.ts)
- 그랜드 스타렉스: `그랜드 스타렉스` (vehicle-alias-db.ts)
- 그랜드 스타렉스: `그랜드 스타렉스` (vehicle-alias-v02-supplement.ts)
- 그랜드 스타렉스: `그랜드 스타렉스` (vehicle-alias-v04-supplement.ts)
- 팰리세이드 LX2: `팰리세이드 LX2` (vehicle-alias-db.ts)
- 그랜드 스타렉스: `그랜드 스타렉스` (vehicle-alias-db.ts)
- 그랜드 스타렉스: `그랜드 스타렉스` (vehicle-alias-db.ts)
- 그랜드 스타렉스: `그랜드 스타렉스` (vehicle-alias-v02-supplement.ts)
- 그랜드 스타렉스: `그랜드 스타렉스` (vehicle-alias-v04-supplement.ts)

## 5. 매칭 안 된 차량

총 108건 — JSON `unmatched_asset` 참고


## 6. 검색 검수 결과

| 검색어 | 통과 | 이슈 |
|--------|------|------|
| GV80 | ✅ |  |
| gv80 | ✅ |  |
| 지브이80 | ✅ |  |
| 제네시스 GV80 | ✅ |  |
| GV70 | ✅ |  |
| GV60 | ✅ |  |
| 스타리아 | ✅ |  |
| 스타리아 AGM80L | ✅ |  |
| K3 | ✅ |  |
| 올뉴 K3 | ✅ |  |
| 쏘나타 | ✅ |  |
| 쏘나타 DN8 | ✅ |  |
| 코란도 | ✅ |  |
| 코란도 C | ✅ |  |
| 티볼리 | ✅ |  |
| 포터2 | ✅ |  |
| 포터2 2020년식 | ✅ |  |
| 쏘렌토 MQ4 | ✅ |  |
| 쏘렌토 MQ4 하이브리드 | ✅ |  |
| 21년식 싼타페 | ✅ |  |
| 100R | ❌ | 규격 기대 100R 실제 없음 |

## 7. 방향 오매칭 위험


## 8. 완료 후 재검수 체크리스트

- [ ] `npx tsx tools/audit-vehicle-db-integrity.ts` P0 = 0
- [ ] GV80/GV70/스타리아/K3/쏘나타 production 검색
- [ ] 고객 화면 needsReview/vehicle-battery-db 미노출
- [ ] primaryBattery.json 미수정 확인

