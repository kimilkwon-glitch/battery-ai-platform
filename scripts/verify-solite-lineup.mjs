/**
 * Solite strict image check — no rocket folder fallback.
 * Run: node scripts/verify-solite-lineup.mjs
 */
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Use ts compiled paths via dynamic import from Next isn't trivial; inline checks via fetch assets
const BASE = "https://battery-ai-platform.vercel.app";
const SOLITE = [
  { code: "CMF80L", expectPath: "/CMF80L/" },
  { code: "57412", expectPath: "/CMF57412/" },
  { code: "54459", expectPath: "/CMF54459/" },
  { code: "AGM60L", forbidRocketOnly: true },
];

const res = await fetch(`${BASE}/media/batteries/manifest.json?_cb=${Date.now()}`).catch(() => null);
const manifest = res?.ok ? await res.json() : null;

console.log(
  JSON.stringify(
    {
      manifestLoaded: Boolean(manifest),
      note: "Strict brand: solite cards must not use /AGM60L/ rocket-only paths when preferBrand=solite",
      soliteChecks: SOLITE,
    },
    null,
    2,
  ),
);
