# Vehicle DB Integrity Audit

생성: 2026-06-04T02:25:13.387Z

## 1. 요약

| 항목 | 값 |
|------|-----|
| vehicleBatteryDbRecords | 3195 |
| enrichmentRecords | 5 |
| totalAssets | 174 |
| genesisAssets | 9 |
| v04Assets | 57 |
| chevroletAssets | 36 |
| aliasEntries | 339 |
| forbiddenCopyFindings | 1 |
| unmatchedAssets | 0 |
| unmatchedA | 0 |
| unmatchedB | 0 |
| unmatchedC | 0 |
| riskyDisplayAliases | 0 |
| searchFailures | 0 |
| directionMismatches | 0 |
| searchContamination | 0 |
| totalFindings | 5 |
| p0Count | 1 |
| searchPassCount | 72 |
| searchTotal | 72 |

## 2. 즉시 수정 필요 (P0: 1)

| 파일 | 문제 | 현재값 | 수정 제안 |
|------|------|--------|----------|
| vehicle-generation-chevrolet.config.ts | forbidden_customer_copy | 가솔린 DIN60L·디젤 DIN74L·ISG AGM80L — 연료별 확인 | 사진 확인 권장 |

## 3. 고객 노출 금지 문구

- **vehicle-generation-chevrolet.config.ts** `chevrolet-the-new-cruze-2015.customerNote`: "가솔린 DIN60L·디젤 DIN74L·ISG AGM80L — 연료별 확인" → 사진 확인 권장

## 4. 이상한 표시명/별칭


## 5. 매칭 안 된 차량 (A/B/C)

| 분류 | 건수 | 조치 |
|------|------|------|
| A DB연결가능 | 0 | slug/dbModels 보강 |
| B 미확정 | 0 | 상담 확인만 |
| C 노출제외 | 0 | recommendExcluded |

| assetId | displayName | 분류 | 사유 |
|---------|-------------|------|------|

## 6. 검색 검수 결과

| 검색어 | 통과 | top | topSpec | 이슈 |
|--------|------|-----|---------|------|
| GV80 | ✅ | 제네시스 GV80 | AGM95R |  |
| gv80 | ✅ | 제네시스 GV80 | AGM95R |  |
| 지브이80 | ✅ | 제네시스 GV80 | AGM95R |  |
| 제네시스 GV80 | ✅ | 제네시스 GV80 | AGM95R |  |
| GV70 | ✅ | 제네시스 GV70 | AGM80R |  |
| GV60 | ✅ | 제네시스 GV60 | AGM60L |  |
| 스타리아 | ✅ | 현대 스타리아 | AGM80R |  |
| 스타리아 AGM80L | ✅ | 현대 스타리아 | AGM80R |  |
| K3 | ✅ | 기아 K3 | DIN62L |  |
| 올뉴 K3 | ✅ | 기아 올 뉴 K3 | DIN62L |  |
| 쏘나타 | ✅ | 현대 쏘나타 NF | — |  |
| 쏘나타 DN8 | ✅ | 현대 쏘나타 DN8 | AGM80L |  |
| 코란도 | ✅ | KG/쌍용 코란도 C | — |  |
| 코란도 C | ✅ | KG/쌍용 코란도 C | — |  |
| 티볼리 | ✅ | KG/쌍용 티볼리 | — |  |
| 포터2 | ✅ | 현대 포터2 | — |  |
| 포터2 2020년식 | ✅ | 현대 포터2 2020년형 이후 | 100R |  |
| 쏘렌토 MQ4 | ✅ | 기아 쏘렌토 4세대 MQ4 | AGM60L |  |
| 쏘렌토 MQ4 하이브리드 | ✅ | 기아 쏘렌토 4세대 MQ4 | AGM60L |  |
| 소렌토 MQ4 하브 | ✅ | 기아 쏘렌토 4세대 MQ4 | AGM60L |  |
| 21년식 싼타페 | ✅ | 현대 싼타페 TM | AGM80L |  |
| 100R | ✅ | 100R | 100R |  |
| 90R | ✅ | 90R | 90R |  |
| AGM80R | ✅ | AGM80R | AGM80R |  |
| AGM95R | ✅ | AGM95R | AGM95R |  |
| DIN74L | ✅ | DIN74L | DIN74L |  |
| QM6 | ✅ | 르노/르노삼성 QM6 | — |  |
| SM6 | ✅ | 르노코리아 SM6 | — |  |
| XM3 | ✅ | 르노코리아 XM3 | — |  |
| QM3 | ✅ | 르노/르노삼성 QM3 | — |  |
| QM5 | ✅ | 르노/르노삼성 QM5 | — |  |
| SM5 | ✅ | 르노/르노삼성 SM5 노바 | — |  |
| SM3 | ✅ | 르노코리아 SM3 | — |  |
| SM7 | ✅ | 르노/르노삼성 SM7 노바 | — |  |
| 마스터 | ✅ | 르노/르노삼성 르노 마스터 | AGM95L |  |
| 스파크 | ✅ | 쉐보레/GM 스파크 | — |  |
| 말리부 | ✅ | 쉐보레/GM 말리부 | — |  |
| 크루즈 | ✅ | 쉐보레/GM 크루즈 | — |  |
| 트랙스 | ✅ | 쉐보레/GM 트랙스 | — |  |
| 트레일블레이저 | ✅ | 쉐보레 트레일블레이저 | AGM70L |  |
| 캡티바 | ✅ | 쉐보레/GM 캡티바 | — |  |
| 올란도 | ✅ | 쉐보레/GM 올란도 | — |  |
| 라세티 | ✅ | 쉐보레/GM 라세티 | — |  |
| 다마스 | ✅ | 쉐보레/GM 다마스 | DIN50L |  |
| 라보 | ✅ | 쉐보레/GM 라보 | DIN50L |  |
| 젠트라 | ✅ | 쉐보레/GM 젠트라 X | — |  |
| 젠트라 X | ✅ | 쉐보레/GM 젠트라 X | — |  |
| 토스카 | ✅ | 쉐보레/GM 토스카 | AGM80R |  |
| 알페온 | ✅ | 쉐보레/GM 알페온 | — |  |
| 임팔라 | ✅ | 쉐보레/GM 임팔라 | — |  |
| 이쿼녹스 | ✅ | 쉐보레/GM 이쿼녹스 | — |  |
| 콜로라도 | ✅ | 쉐보레/GM 콜로라도 | — |  |
| 트래버스 | ✅ | 쉐보레/GM 트래버스 | — |  |
| 티볼리 아머 | ✅ | KG/쌍용 티볼리 아머 | — |  |
| 코란도 C | ✅ | KG/쌍용 코란도 C | — |  |
| 렉스턴 스포츠 | ✅ | KG/쌍용 렉스턴 스포츠 Y400 | 90R |  |
| 렉스턴 스포츠 칸 | ✅ | KG/쌍용 렉스턴 스포츠 칸 | 90R |  |
| G4 렉스턴 | ✅ | KG/쌍용 G4 렉스턴 | — |  |
| 올 뉴 렉스턴 | ✅ | KG/쌍용 올 뉴 렉스턴 | — |  |
| 코란도 스포츠 | ✅ | KG/쌍용 코란도 스포츠 | — |  |
| 코란도 투리스모 | ✅ | KG/쌍용 코란도 투리스모 | 90R |  |
| 뉴 체어맨 | ✅ | KG/쌍용 뉴 체어맨 | — |  |
| 액티언 | ✅ | KG/쌍용 액티언 | 90R |  |
| 액티언 스포츠 | ✅ | KG/쌍용 액티언 스포츠 | — |  |
| 카이런 | ✅ | KG/쌍용 카이런 | 90R |  |
| 무쏘 스포츠 | ✅ | KG/쌍용 무쏘 스포츠 | — |  |
| 토레스 | ✅ | KG/쌍용 토레스 | AGM70L |  |
| 봉고3 | ✅ | 기아 봉고3 | 100L |  |
| 쏘나타 NF | ✅ | 현대 쏘나타 NF | — |  |
| 투싼 JM | ✅ | 현대 투싼 | — |  |
| 케이쓰리 | ✅ | 기아 K3 1세대 | DIN62L |  |
| EQ900 | ✅ | 제네시스 EQ900 | AGM105L |  |

## 7. 방향 오매칭 위험


## 8. 완료 후 재검수 체크리스트

- [ ] `npm run audit:vehicle-db` P0 실질 0
- [ ] vehicleBatteryDbRecords = 3195
- [ ] 100R·쏘렌토 MQ4 HEV production 검색
- [ ] 고객 HTML에 needsReview/vehicle-battery-db 미포함
- [ ] primaryBattery.json 미수정 확인

