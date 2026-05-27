# 배포 파이프라인 (GitHub → Vercel)

## 단일 빌드 스탬프

- **소스:** `build-stamp.json` → `src/lib/build-stamp.ts` (`BUILD_STAMP`)
- 모든 페이지는 루트 `layout.tsx`의 `data-build-version` / footer 스탬프로 동일 값을 노출합니다.
- 검증: `node scripts/verify-production-evidence.mjs https://battery-ai-platform.vercel.app`

## Git 저장소

- **Remote:** https://github.com/kimilkwon-glitch/battery-ai-platform
- **Production branch:** `main` (Vercel production 배포 기준)

## Vercel 프로젝트

- **URL:** https://battery-ai-platform.vercel.app
- **Project ID:** `prj_yYGVQyuf9Wz1wgh3LwvUwIwmKqFQ`
- **Team:** `j9ke-s-projects` (`team_xvHwhy5tsTVpLwh8L6Qigr2q`)

## GitHub Actions (권장)

1. GitHub → Settings → Secrets → Actions 에 `VERCEL_TOKEN` 추가 (Vercel Account Settings → Tokens)
2. `main`에 push 시 `.github/workflows/vercel-production.yml` 이 production 배포

## Vercel Dashboard Git 연결 (선택)

`vercel git connect` 가 실패하면 [Vercel GitHub App](https://github.com/apps/vercel) 을 계정/저장소에 설치한 뒤  
Project → Settings → Git 에서 `kimilkwon-glitch/battery-ai-platform` 연결 및 Production Branch = `main`.

## 동적 라우트 (구버전 HTML 방지)

- `src/app/vehicle/[slug]/page.tsx` — `dynamic = 'force-dynamic'`, `revalidate = 0`
- `src/app/search/page.tsx` — 동일
