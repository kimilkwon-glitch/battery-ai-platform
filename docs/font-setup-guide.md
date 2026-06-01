# 한글 폰트 수납 · 설정 가이드

Battery Manager 프로젝트에 직접 다운로드한 무료 한글 폰트를 넣기 위한 폴더 구조입니다.

## 1. 폰트 파일 넣는 위치

모든 폰트 파일은 프로젝트 루트 기준 **`public/fonts/`** 아래에 둡니다.

```
public/fonts/
├── Pretendard/
├── SUIT/
├── WantedSans/
├── NanumGothic/
├── NanumMyeongjo/
├── NanumSquare/
├── NanumSquareNeo/
├── NanumSquareRound/
├── GmarketSans/
├── Paperlogy/
├── SCoreDream/
├── Cafe24Dangdanghae/
├── Cafe24Ssurround/
├── KBODiaGothic/
├── Freesentation/
├── SBWindowFont/
├── PyeongChangPeace/
└── Etc/
```

폰트마다 **이름에 맞는 하위 폴더 하나**에만 넣으면 됩니다. 분류가 애매하면 `Etc/`를 사용하세요.

## 2. 파일 형식 (ttf / otf)

- **`.ttf`**, **`.otf`** 파일을 해당 폰트 폴더에 그대로 넣으면 됩니다.
- 같은 굵기·스타일이 여러 파일이면, 파일명에 굵기가 드러나게 두는 것을 권장합니다.  
  예: `Pretendard-Regular.otf`, `Pretendard-Bold.otf`

## 3. 라이선스 파일

- 배포 조건이 적힌 **라이선스·고지 문서**(txt, pdf, md 등)가 있으면 **같은 폴더**에 함께 넣으세요.
- 예: `OFL.txt`, `LICENSE`, `license.pdf`

## 4. CSS 적용 (현재 단계)

- **아직 CSS 적용은 하지 않습니다.**
- `globals.css`, `layout.tsx`, Tailwind 테마 등 **기존 폰트 설정은 변경하지 않은 상태**입니다.
- 이 단계는 **수납 + 문서화**만 목적입니다.

## 5. 나중에 적용 후보 (참고)

| 용도 | 후보 폰트 |
|------|-----------|
| 본문 / UI | Pretendard, SUIT, Wanted Sans, NanumSquare Neo |
| 제목 / 카드 | Gmarket Sans, Paperlogy, S-Core Dream |
| 포인트 / 배너 | Cafe24 계열, KBO Dia Gothic |

실제 적용 시에는 위 표에서 **2~3개 패밀리만** 골라 쓰는 것을 권장합니다.

## 6. 로딩 성능

- 폰트 패밀리를 **한꺼번에 모두** `@font-face`로 넣으면 초기 로딩이 느려집니다.
- 사이트에는 보통 **본문 1종 + 제목(또는 포인트) 1종** 정도만 연결하는 것이 좋습니다.
- 나머지 폴더는 비교·교체용 보관함으로 두면 됩니다.

## 7. 다음 단계

폰트 파일을 넣은 뒤:

1. **`docs/font-inventory.md`** — 파일명·굵기·라이선스·추천 용도 표로 정리
2. **`@font-face` + CSS 변수** — 선택한 2~3개 패밀리만 연결
3. **로컬 빌드·프리뷰** — 적용 범위 확인 후 production 반영

inventory 작성이 끝나면, 어떤 폰트를 본문/제목에 쓸지 정한 다음 CSS 작업을 진행합니다.
