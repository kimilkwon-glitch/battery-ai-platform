#!/usr/bin/env node
/**
 * vehicle-alias-db slugHint vs SLUG_HINT_TO_ASSET_ID 검수
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const slugMapSrc = readFileSync(
  join(root, "src/lib/search/vehicle-alias-slug-map.ts"),
  "utf8",
);
const mapped = new Set(
  [...slugMapSrc.matchAll(/"([a-z0-9-]+)":/g)].map((m) => m[1]),
);

const dbSrc = readFileSync(join(root, "src/data/vehicle-alias-db.ts"), "utf8");
const supSrc = readFileSync(join(root, "src/data/vehicle-alias-v02-supplement.ts"), "utf8");
const hints = new Set();
for (const m of [
  ...dbSrc.matchAll(/slugHint:\s*['"]([^'"]+)['"]/g),
  ...supSrc.matchAll(/slugHint:\s*['"]([^'"]+)['"]/g),
]) {
  hints.add(m[1]);
}

const unmapped = [...hints].filter((h) => !mapped.has(h)).sort();

console.log(
  JSON.stringify(
    {
      totalSlugHints: hints.size,
      mappedInSlugMap: hints.size - unmapped.length,
      unmappedSlugHints: unmapped,
    },
    null,
    2,
  ),
);
