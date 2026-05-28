# Precision Garage Platform — Design UX V1

**Build stamp:** `BM-UX-REV-20260528-PRECISION-GARAGE-V1`

## Summary

UI-layer refresh across the platform: design tokens, typography, fitment-style search cards, battery/vehicle detail polish, mobile sticky bars, and CTA hierarchy (navy primary vs blue accent). **No search/matching logic, routing, or image asset changes.**

## Design tokens (`src/lib/design-tokens.ts`, `src/app/globals.css`)

- Background `#F5F7FA`, surface white / soft, primary `#1D4ED8`, accent `#06B6D4`, success/warning/danger semantic colors
- Card radius `22px`, hover lift `-2px`, shadow scale sm/md/lg
- New: `fitmentCard`, `fitmentCardPrimary`, `intentSummary`, `intentBadge`, status badge tones, `stickyMobileBar`, `specTitle`

## Fonts / typography

- Unchanged stack: Pretendard (body), GmarketSans (headings), S-Core Dream (accent)
- `.spec-code` / `data-spec-code` on battery codes in search cards, home ranking, battery hub hero

## Card / CTA

- Search: `RecommendedBatteryCard` → fitment primary card + “추천 규격” badge
- `CtaHierarchy`: primary → `btnNavy`, secondary → `btnSecondary`
- Home/service: main conversion CTAs → navy; photo/verify → secondary/ghost

## Search results

- Non-hero summary → `intentSummary` + `intentBadge`
- Symptom hero cards → `surfaceMuted` with subtle hover
- `RecognizedVehicleCard` → platform strip styling

## Battery / vehicle detail

- Hub hero: accent header band, spec-code title, mobile sticky uses `stickyMobileBar`
- Vehicle Q&A placement unchanged (logic); visual tokens aligned

## Q&A / community

- `QnaQuestionCard` → `cardInteractive`
- Related Q&A sections unchanged (resolver); styling via `RelatedQnaSection` + `bm.card`

## Mobile

- Min touch height 44px on primary buttons
- Shared `stickyMobileBar` for search + battery detail
- `prefers-reduced-motion` disables page-enter / hover translate

## Motion

- Page enter 6px fade (was 10px)
- Card hover translate/shadow only (`motion-safe:`)
- No new decorative animations

## Images

- **No** real battery/vehicle assets connected; `MediaImageSlot` placeholders retained

## Logic safety

- No edits to `search-page-results.ts`, `src/lib/search/*`, Q&A resolver, battery hub content resolvers

## Verification

```bash
npm run build          # pass
npm run lint           # ESLint config circular ref (pre-existing env issue)
node scripts/verify-precision-garage-v1.mjs http://localhost:3000  # after dev/start
```

## Q&A connection checklist (post-deploy, no-cache)

| Route | Expected |
|-------|----------|
| `/community` | Hub + stamp |
| `/batteries/AGM60L` | related-qna |
| `/batteries/100R` | related-qna + FIX1 questions |
| `/batteries/CMF80L` | related-qna |
| `/vehicle/sportage-nq5?fuel=하이브리드` | related-qna |
| `/search?q=레이 블랙박스 방전` | related-qna |
| `/search?q=100R vs AGM95L` | related-qna |

Production deploy: **pending** — run once after local/preview pass.
