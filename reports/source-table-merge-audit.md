# Source table merge audit

Generated: 2026-06-03T08:10:55.767Z

## 1. 원본 파일 읽기
- **src/data/source-tables/공임차종표_프로그램용.xlsx**: OK — sheets: Sheet1
- **src/data/source-tables/최근 배터리 차종표.xlsx**: OK — sheets: Sheet1
- **src/data/source-tables/카수리 차종표.xls**: OK — sheets: 국산, BMW, 미니, 벤츠, 볼보, 아우디, 폭스바겐, 지프,렉서스,포드,토요타,혼다,인피니티, 그 외

## 2. 파일별 행 수 / 브랜드
### src/data/source-tables/공임차종표_프로그램용.xlsx
  - Sheet1: 115 rows
- 브랜드: 현대(38), 기아(33), 쉐보레(27), 르노(9), 쌍용(8)
### src/data/source-tables/최근 배터리 차종표.xlsx
  - Sheet1: 1242 rows
- 브랜드: 기아(221), 현대(199), BMW(102), 벤츠(93), 아우디(93), 쉐보레(81), 르노(55), 쌍용(52), 폭스바겐(52), 볼보(33), 포드(25), 랜드로버(25)
### src/data/source-tables/카수리 차종표.xls
  - 국산: 493 rows
  - BMW: 104 rows
  - 미니: 25 rows
  - 벤츠: 94 rows
  - 볼보: 32 rows
  - 아우디: 89 rows
  - 폭스바겐: 53 rows
  - 지프,렉서스,포드,토요타,혼다,인피니티: 127 rows
  - 그 외: 96 rows
- 브랜드: 현대(173), 기아(163), 쉐보레(68), 르노(48), 쌍용(41)

## 3. DB recordCount
- 이전: 2125
- 이후: 3195
- 추가: 1070

## 4. 브랜드 보강
- 르노: +108 (이후 108)
- 쉐보레: +153 (이후 153)
- 쌍용: +99 (이후 99)

## 5. 병합 통계
```json
{
  "parsedTotal": 1848,
  "added": 1155,
  "merged": 594,
  "skippedProtected": 2,
  "duplicateSkipped": 0,
  "noBatterySkipped": 97,
  "bySource": {
    "공임": 111,
    "최근": 720,
    "카수리": 324
  },
  "byBrandAdded": {
    "현대": 225,
    "기아": 187,
    "르노": 108,
    "쉐보레": 153,
    "쌍용": 99,
    "제네시스": 21,
    "벤츠": 67,
    "BMW": 77,
    "아우디": 69,
    "폭스바겐": 31,
    "볼보": 21,
    "미니": 20,
    "지프": 7,
    "렉서스": 1,
    "포드": 3,
    "토요타": 5,
    "혼다": 3,
    "링컨": 2,
    "랜드로버": 21,
    "푸조": 4,
    "캐딜락": 2,
    "재규어": 17,
    "닛산": 1,
    "인피니티": 6,
    "크라이슬러": 5
  }
}
```

## 6. 사용자 확정값 보호
- user_final_confirmed: 54 → 53 (intact: false)
