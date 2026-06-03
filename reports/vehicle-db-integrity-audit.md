# Vehicle DB Integrity Audit

생성: 2026-06-03T04:01:48.950Z

## 1. 요약

| 항목 | 값 |
|------|-----|
| vehicleBatteryDbRecords | 2125 |
| enrichmentRecords | 5 |
| totalAssets | 174 |
| genesisAssets | 9 |
| v04Assets | 57 |
| chevroletAssets | 36 |
| aliasEntries | 339 |
| forbiddenCopyFindings | 0 |
| unmatchedAssets | 120 |
| unmatchedA | 0 |
| unmatchedB | 112 |
| unmatchedC | 8 |
| riskyDisplayAliases | 0 |
| searchFailures | 0 |
| directionMismatches | 0 |
| searchContamination | 0 |
| totalFindings | 123 |
| p0Count | 0 |
| searchPassCount | 26 |
| searchTotal | 26 |

## 2. 즉시 수정 필요 (P0: 0)

| 파일 | 문제 | 현재값 | 수정 제안 |
|------|------|--------|----------|

## 3. 고객 노출 금지 문구


## 4. 이상한 표시명/별칭


## 5. 매칭 안 된 차량 (A/B/C)

| 분류 | 건수 | 조치 |
|------|------|------|
| A DB연결가능 | 0 | slug/dbModels 보강 |
| B 미확정 | 112 | 상담 확인만 |
| C 노출제외 | 8 | recommendExcluded |

| assetId | displayName | 분류 | 사유 |
|---------|-------------|------|------|
| sonata-nf | 쏘나타 NF | B | DB 매칭 없음 — 상담 확인만 |
| sonata-yf | YF 쏘나타 | B | DB 매칭 없음 — 상담 확인만 |
| sonata-lf | LF 쏘나타 | B | DB 매칭 없음 — 상담 확인만 |
| avante-hd | 아반떼 HD | B | DB 매칭 없음 — 상담 확인만 |
| avante-md | 아반떼 MD | B | DB 매칭 없음 — 상담 확인만 |
| avante-ad | 아반떼 AD | B | DB 매칭 없음 — 상담 확인만 |
| tucson-jm | 투싼 | B | DB 매칭 없음 — 상담 확인만 |
| tucson-lm | 투싼 ix | B | DB 매칭 없음 — 상담 확인만 |
| tucson-tl | 올 뉴 투싼 | B | DB 매칭 없음 — 상담 확인만 |
| santafe-cm | 싼타페 CM | B | DB 매칭 없음 — 상담 확인만 |
| santafe-dm | 싼타페 DM | B | DB 매칭 없음 — 상담 확인만 |
| santafe-mx5 | 디 올 뉴 싼타페 | B | DB 매칭 없음 — 상담 확인만 |
| santafe-mx5-hev | 싼타페 하이브리드 | B | DB 매칭 없음 — 상담 확인만 |
| kona-os | 코나 | B | DB 매칭 없음 — 상담 확인만 |
| kona-sx2 | 디 올 뉴 코나 | B | DB 매칭 없음 — 상담 확인만 |
| k8-gl3 | K8 | B | DB 매칭 없음 — 상담 확인만 |
| k8-gl3-fl | 더 뉴 K8 | B | DB 매칭 없음 — 상담 확인만 |
| sportage-nq5 | 스포티지 5세대 | B | DB 매칭 없음 — 상담 확인만 |
| carnival-vq | 그랜드 카니발 | B | DB 매칭 없음 — 상담 확인만 |
| carnival-yp | 올 뉴 카니발 | B | DB 매칭 없음 — 상담 확인만 |
| carnival-yp-fl | 더 뉴 카니발 | B | DB 매칭 없음 — 상담 확인만 |
| carnival-ka4-fl | 더 뉴 카니발 | B | DB 매칭 없음 — 상담 확인만 |
| morning-sa | 뉴 모닝 | B | DB 매칭 없음 — 상담 확인만 |
| morning-ta | 올 뉴 모닝 | B | DB 매칭 없음 — 상담 확인만 |
| morning-ja | 모닝 3세대 | B | DB 매칭 없음 — 상담 확인만 |
| morning-ja-fl | 더 뉴 모닝 | B | DB 매칭 없음 — 상담 확인만 |
| ray-tam | 레이 | B | DB 매칭 없음 — 상담 확인만 |
| ray-tam-2fl | 더 뉴 기아 레이 | B | DB 매칭 없음 — 상담 확인만 |
| niro-de | 니로 | B | DB 매칭 없음 — 상담 확인만 |
| niro-de-fl | 더 뉴 니로 | B | DB 매칭 없음 — 상담 확인만 |
| niro-sg2 | 디 올 뉴 니로 | B | DB 매칭 없음 — 상담 확인만 |
| bongo3-truck | 봉고3 | B | DB 매칭 없음 — 상담 확인만 |
| bongo3-ev | 봉고3 EV | B | DB 매칭 없음 — 상담 확인만 |
| renault-samsung-sm3-2005 | SM3 | B | DB 매칭 없음 — 상담 확인만 |
| renault-samsung-new-sm3-2009 | 뉴 SM3 | B | DB 매칭 없음 — 상담 확인만 |
| renault-samsung-sm3-neo-2014 | SM3 네오 | B | DB 매칭 없음 — 상담 확인만 |
| renault-samsung-sm3-ze-2013 | SM3 Z.E. | B | DB 매칭 없음 — 상담 확인만 |
| renault-samsung-sm5-new-impression-2007 | SM5 뉴 임프레션 | B | DB 매칭 없음 — 상담 확인만 |
| renault-samsung-new-sm5-2010 | 뉴 SM5 | B | DB 매칭 없음 — 상담 확인만 |
| renault-samsung-sm5-nova-2015 | SM5 노바 | B | DB 매칭 없음 — 상담 확인만 |

*(80건 추가 — JSON `unmatchedClassifications`)*

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
| 쏘나타 | ✅ | 현대 쏘나타 NF | AGM80L |  |
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

## 7. 방향 오매칭 위험


## 8. 완료 후 재검수 체크리스트

- [ ] `npm run audit:vehicle-db` P0 실질 0
- [ ] vehicleBatteryDbRecords = 2125
- [ ] 100R·쏘렌토 MQ4 HEV production 검색
- [ ] 고객 HTML에 needsReview/vehicle-battery-db 미포함
- [ ] primaryBattery.json 미수정 확인

