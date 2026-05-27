# Battery Manager UX Audit (개발용)

Playwright 기반 **개발 전용 UX 진단 도구**입니다. **500명의 서로 다른 가상 고객**(차량·상황·성격·여정·행동 루트)이 실제처럼 사이트를 탐색·검색·비교하고, Markdown/JSON 리포트를 생성합니다.

**고객 화면에는 절대 노출되지 않습니다.** 사이트 소스(`src/`)나 DB/콘텐츠 본문을 수정하지 않습니다.

## 실행 방법

### 1. 개발 서버 실행

```bash
npm run dev
```

기본 URL: `http://localhost:3000`  
다른 포트면: `UX_AUDIT_BASE_URL=http://localhost:3001 npm run ux:audit`

### 2. UX 점검 실행

| 명령 | 설명 |
|------|------|
| `npm run ux:audit:quick` | 30명 (빠른 점검) |
| `npm run ux:audit` | 100명 (기본) |
| `npm run ux:audit:full` | 500명 (전체, headless) |
| `npm run ux:audit:headed` | 30명 이하, 브라우저 표시 |

### 3. 결과 확인

- `tools/ux-audit/reports/ux-audit-report.md` — 상세 Markdown 리포트 (ChatGPT 전달용 섹션 포함)
- `tools/ux-audit/reports/ux-audit-summary.txt` — 짧은 요약 (1000~3000자)
- `tools/ux-audit/reports/persona-list.md` / `persona-list.json` — 500명 페르소나 목록 (✓ = 이번 실행)
- `tools/ux-audit/reports/ux-audit-raw.json` — 전체 JSON (stepsLog·상세 issue·evidence 포함)

### 4. Playwright HTML 리포트 (선택)

```bash
npm run ux:audit:report
```

## 리포트 정리

UX 점검을 여러 번 실행하면 리포트와 Playwright 결과 파일이 쌓일 수 있습니다.
아래 명령어로 결과 파일만 정리할 수 있습니다.

```bash
npm run ux:audit:clean
```

이 명령은 아래 항목만 삭제합니다.

- `tools/ux-audit/reports` 안의 결과 파일
- `playwright-report` 폴더
- `test-results` 폴더

이 명령은 UX Audit 시나리오 파일, 테스트 코드, 사이트 기능, 고객 화면에는 영향을 주지 않습니다.

## 시나리오 / 페르소나 구조

각 페르소나는 **차량·상황·성격·여정(journeyType)·steps(행동 루트)** 를 갖습니다.

| journeyType | 비율(500명) | 예시 행동 |
|-------------|------------|-----------|
| direct_search | 30% | 메인 → 검색 → 결과 확인 |
| browse_vehicle | 15% | 메인 → 차종으로 찾기 |
| browse_spec | 10% | 메인 → 규격으로 찾기 |
| compare_battery | 10% | 비교 검색 / 규격 비교 |
| symptom_check | 10% | 증상으로 찾기 |
| photo_check | 7% | 사진으로 확인 |
| faq_browse | 5% | FAQ/Q&A 탐색 |
| shop_order_check | 5% | 주문/배송 안내 |
| repair_shop_search | 5% | 정비소/매장 찾기 |
| trust_check | 3% | 여러 섹션 둘러보기 |

- **페르소나 생성**: `personas.ts` + `personaCatalog.ts`
- **행동 실행**: `journeyRunner.ts` (steps 기반 Playwright)
- **검사 규칙**: `uxRules.ts` (여정별 + 검색별)
- **QUICK 30명**도 위 여정이 골고루 섞이도록 `samplePersonasBalanced()` 사용

## 시나리오 추가 방법

1. **페르소나 대량 생성** — `personaCatalog.ts`의 차량/규격 풀 또는 `personas.ts`의 journey 빌더 수정
2. **행동 루트** — `personas.ts`의 `buildSteps()` 에 step 추가
3. **검사 규칙** — `uxRules.ts`의 `runUxRules()` 수정

각 페르소나 필드: `id`, `personaName`, `ageGroup`, `personality`, `vehicle`, `situation`, `journeyType`, `startBehavior`, `steps`, `query`, `goal`, `expectedKeywords`, `device` 등

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `UX_AUDIT_LIMIT` | 100 | 실행할 페르소나 수 (최대 500) |
| `UX_AUDIT_BASE_URL` | `http://localhost:3000` | 대상 URL |
| `UX_AUDIT_SCREENSHOTS` | on (HIGH만) | `false`/`0`/`off`이면 스크린샷 비활성. QUICK 10장 / DEFAULT 30장 / FULL 50장 |

## 삭제 방법

UX 점검 도구가 필요 없으면 아래만 삭제하면 됩니다. **고객 화면에는 영향 없습니다.**

1. `tools/ux-audit/` 폴더 전체
2. `package.json`의 `ux:audit*` scripts
3. (선택) `@playwright/test` devDependency — 다른 용도로 쓰지 않을 때만

```bash
npm uninstall @playwright/test
```

## 주의

- 실제 고객 행동 데이터가 아니라 **개발용 UX 시뮬레이션**입니다.
- 결과는 참고용이며, 최종 판단은 직접 화면 확인 후 진행하세요.
- 시나리오 실패 시에도 전체 실행은 계속되며, raw JSON에 오류가 기록됩니다.
- workers=1, 스크린샷 기본 off — 렉 방지용 설정입니다.

## 폴더 구조

```
tools/ux-audit/
├── README.md
├── personaCatalog.ts    # 차량·규격·성격 카탈로그
├── personas.ts          # 500명 페르소나 생성 + QUICK 샘플링
├── observation.ts       # 화면 텍스트·헤딩·CTA·카드 샘플 수집
├── issueDetails.ts      # 상세 issue enrichment
├── actionItems.ts       # action-items.md 생성
├── screenshotBudget.ts  # HIGH 스크린샷 한도
├── scenarios.ts         # getAllPersonas / getScenariosForRun
├── uxRules.ts           # UX 검사 규칙 (여정별)
├── report.ts            # Markdown/JSON 리포트
├── runUxAudit.ts        # 시나리오 실행
├── run-cli.mjs          # cross-platform CLI
├── cleanReports.js      # 결과 파일 정리
├── playwright.config.ts
├── battery-manager-ux-audit.spec.ts
└── reports/
    ├── ux-audit-report.md
    ├── ux-audit-summary.txt
    ├── ux-audit-action-items.md
    ├── ux-audit-raw.json
    ├── persona-list.md
    └── persona-list.json
```
