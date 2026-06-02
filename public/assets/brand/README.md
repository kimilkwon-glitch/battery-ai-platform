# Brand logo assets

## Web exports (from AI originals)

| File | Source | Notes |
|------|--------|--------|
| `rocket-logo.png` | `SEBANG_BI_ROCKET_190904.ai` | Primary banner logo |
| `rocket-logo-light.png` | same | Dark backgrounds |
| `rocket-logo-dark.png` | same | Light backgrounds |
| `solite-logo.png` | `hyundaisungwoo-solite.ai` | Primary (split from artboard strip) |
| `solite-logo-light.png` | same | Light-on-dark variant |
| `solite-logo-dark.png` | same | Dark-on-light variant |

Regenerate: `npm run brand-logos` (`scripts/convert-brand-logos.mjs`)

- AI/PDF originals are **not** served on the web.
- One artboard may contain multiple logos; the script splits by ink regions / equal columns, then picks a single banner-friendly crop per brand.
- Variants under `_variants/` are intermediate exports (gitignored if added to `.gitignore` — optional).

## Do not use on web

- `*.ai` — source only
- Multi-logo composite screenshots
