# Battery Manager — Font Usage Plan

## 현재 단계

- **폰트 인벤토리 스캔·정리만 완료** (`npm run scan:fonts`)
- **사이트 CSS / `font-family` / `@font-face` 연결은 아직 하지 않음**
- `globals.css`, `layout.tsx`, Tailwind 테마의 기존 폰트 설정은 **변경 없음**

## 다음 디자인 단계에서 할 일

1. `docs/font-inventory.md` · `docs/font-inventory.json` 검토
2. 라이선스 파일(OFL, README 등) 확인 후 상업·웹 배포 가능 여부 정리
3. **2~3개 패밀리만** 선택해 `@font-face` + CSS 변수 연결
4. 필요 시 ttf/otf → **woff2** 변환 검토 (용량·로딩)
5. 로컬/프리뷰에서 본문·제목·CTA 각 1종씩 시험 적용

## 권장 조합 후보

### A안 — 깔끔한 플랫폼형

| 역할 | 폰트 |
|------|------|
| 본문/UI | Pretendard |
| 제목/카드 | Gmarket Sans |
| 강조/배너 | S-Core Dream |

### B안 — 부드러운 국산 서비스형

| 역할 | 폰트 |
|------|------|
| 본문/UI | SUIT |
| 제목/카드 | Paperlogy |
| 강조 | Wanted Sans |

### C안 — 네이버/자동차 정보형

| 역할 | 폰트 |
|------|------|
| 본문/UI | NanumSquare Neo |
| 제목/카드 | Gmarket Sans |
| 강조 | KBO Dia Gothic |

## 주의사항

- 폰트 패밀리를 많이 쓰면 **초기 로딩이 느려집니다.** 실서비스에는 보통 본문 1 + 제목 1(+선택 1)만 권장합니다.
- **ttf/otf 직접 로딩**은 가능하지만, 성능상 **woff2**가 유리합니다 (추후 변환 검토).
- **라이선스**를 반드시 확인한 뒤 최종 적용하세요. 같은 폴더에 LICENSE/README가 있는지 `font-inventory`를 참고하세요.
- 지금 단계에서는 **모든 폰트를 한 번에 import하지 않습니다.**

## 관련 파일

- [font-setup-guide.md](./font-setup-guide.md) — 수납 위치·폴더 구조
- [font-inventory.md](./font-inventory.md) — 스캔 결과 (자동 생성)
- [font-inventory.json](./font-inventory.json) — 스캔 결과 (기계 판독용)
