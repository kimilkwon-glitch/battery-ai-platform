# Home Upgrade V2 — 2026-05-28

**Build stamp:** `BM-UX-REV-20260528-HOME-UPGRADE-V2`

## 메인 변경 요약

첫 화면을 **배터리 매칭 플랫폼** 구조로 재구성했습니다. DB 매칭을 앞에 두고, 사진확인은 보조 CTA로 배치했습니다.

| 섹션 | `data-home-section` |
|------|---------------------|
| Hero (검색·유형 칩·예시) | `hero` |
| 많이 찾는 규격 8종 | `popular-batteries` |
| 인기 차량 9종 | `popular-vehicles` |
| EV·하이브리드 보조 12V | `ev-hybrid` |
| 많이 찾는 조건 | `trending` |
| 택배 주문 흐름 | `delivery` |
| 덕천·학장·출장·사진안내 | `stores` |
| 오주문 방지 (기존) | `HomeOrderGuide` |

## 폰트 1차 적용

| 역할 | 폰트 | 파일 |
|------|------|------|
| body/UI | Pretendard Variable | `public/fonts/Pretendard-1.3.9/web/variable/woff2/PretendardVariable.woff2` |
| 제목/섹션/카드 | GmarketSans | `GmarketSansTTF/*.ttf` (300/500/700) |
| @font-face | `src/styles/fonts.css` | CDN·Google Fonts 미사용 |

CSS 변수: `--font-body`, `--font-heading` (`globals.css`)

## 이미지 슬롯 (준비중)

- Hero 매칭 비주얼 16/9
- 규격 랭킹 8종 4/3
- 인기 차량 9종 16/9
- 덕천·학장·출장·점검 장비
- 택배 포장·출고 확인·라벨 확인
- 블랙박스 방전 참고

레지스트리: `HOME_IMAGE_SLOTS` in `image-slot-registry.ts`

## Local/preview 검수

`node scripts/verify-home-upgrade-v2.mjs http://127.0.0.1:3040` — **ALL PASS** (메인 + 검색 9 + 배터리 10 + 차량/비교 3)

## Production

| 항목 | 값 |
|------|-----|
| GitHub main | `2dc017d` |
| Vercel deployment | `dpl_J5wx4rL2SymfEj5c3Srggjar6poS` |
| Alias | https://battery-ai-platform.vercel.app |
| 검수 | `verify-home-upgrade-v2.mjs` — **ALL PASS** |

## 남은 개선

- Hero·차량 실사 연결
- GmarketSans woff2 변환(선택)으로 TTF 용량 절감
- 실검색 로그 기반 trending 동적화
