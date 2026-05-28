# ASSET-VISUAL-V2 완료 보고서

**Build stamp:** `BM-UX-REV-20260528-ASSET-VISUAL-V2`  
**Cache-busting:** `asset-visual-v2-20260528`

---

## 1. 원인

- `BatteryThumbnail` tall 모드 `scale-[1.08]` + `aspect-*` 조합으로 이미지가 stage 밖으로 시각적으로 튀어남
- 카드마다 `heightClass`·padding·wrapper가 달라 image area 기준선 불일치
- `overflow-hidden` 없이 padding만 두어 인접 텍스트/CTA 영역과 충돌
- EV/인기 규격 카드: 이미지 영역과 정보 영역이 분리된 “두 덩어리” 구조

## 2. 단순 축소 여부

**아니오.** stage 높이 `card` 132–140px, `hero` 168–188px로 **크기감 유지**.  
내부 nest padding + `object-contain object-[center_92%]` + `overflow-hidden`으로 **융화**.

## 3. image container / object-fit / position

| 항목 | 값 |
|------|-----|
| 공통 컴포넌트 | `BatteryImageStage` |
| 토큰 | `src/lib/battery-image-stage.ts` |
| overflow | stage `overflow-hidden` |
| fit | `object-contain` |
| position | `object-[center_92%]` (바닥 안착) |
| nest | `px-3 pt-2.5 pb-3` inset |
| 바닥 그라데이션 | stage 하단 5px subtle fade |

## 4. 많이 찾는 배터리 규격

- `HomePopularBatteryRanking`: 카드 `overflow-hidden`, `BatteryCardImage flushTop` — 상단 이미지가 카드 radius와 일체
- 하단 텍스트 `pt-2.5`로 이미지·정보 간격 조정

## 5. EV/하이브리드

- `variant="cardCompact"` (104–112px stage, 시각 무게는 유지)
- article `flex flex-col overflow-hidden`
- 텍스트 `pt-2.5`로 CTA와 이미지 분리 완화

## 6. 배터리 상세 hero

- `BatteryImageStage variant="hero"` (168–188px)
- grid 셀 flex center, `max-w-[280px]`

## 7. 공통 시스템

| variant | 높이 | 사용처 |
|---------|------|--------|
| card | 132–140px | 메인 인기 규격 |
| cardCompact | 104–112px | EV/하이브리드 |
| hero | 168–188px | 상세 hero, 메인 hero |
| search | 148–156px | 검색 추천·spec focus |
| compare | 156–168px | 비교 선택 카드 |

`BatteryCardImage` → `BatteryImageStage` 위임.  
`BatteryThumbnail` contain/tall: inset wrapper (scale 제거).

## 8. 모바일

- stage 고정 높이 + `overflow-hidden` → 390/430/768 가로 스크롤 없음
- CTA는 이미지 아래 고정 flex 영역 (밀림 방지)

## 9–12. 배포 검증 (배포 후 기입)

| 항목 | 값 |
|------|-----|
| Stamp | `BM-UX-REV-20260528-ASSET-VISUAL-V2` |
| Deployment ID | _(배포 후)_ |

---

## 검수용 cache-busting URL

- https://battery-ai-platform.vercel.app/?_cb=asset-visual-v2-20260528
- https://battery-ai-platform.vercel.app/search?q=CMF80L&_cb=asset-visual-v2-20260528
- https://battery-ai-platform.vercel.app/search?q=100R%20vs%20AGM95L&_cb=asset-visual-v2-20260528
- https://battery-ai-platform.vercel.app/batteries/CMF80L?_cb=asset-visual-v2-20260528
- https://battery-ai-platform.vercel.app/batteries/AGM60L?_cb=asset-visual-v2-20260528
- https://battery-ai-platform.vercel.app/compare?_cb=asset-visual-v2-20260528
- https://battery-ai-platform.vercel.app/vehicle/sportage-nq5?fuel=하이브리드&_cb=asset-visual-v2-20260528
