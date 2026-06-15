/**
 * Battery Guide CMS verification
 * Usage: npm run verify:battery-guide-cms
 */
import { ensureTsxVerify } from "../scripts/ensure-tsx-verify.mjs";
import fs from "node:fs/promises";
import path from "node:path";

ensureTsxVerify(import.meta.url);

await import("../scripts/register-server-only.mjs");

const assert = (await import("node:assert/strict")).default;

const { GUIDE_POSTS_SEED } = await import("../src/lib/guide-posts-seed.ts");
const { BATTERY_GUIDE_POSTS } = await import("../src/data/battery-guide-posts.ts");
const { sanitizeNoticeHtmlForStorage } = await import(
  "../src/lib/security/sanitize-notice-html.server.ts"
);

assert.equal(GUIDE_POSTS_SEED.length, BATTERY_GUIDE_POSTS.length, "seed count matches static data");
assert.ok(GUIDE_POSTS_SEED.length >= 8, "guide seed has items");

for (const post of GUIDE_POSTS_SEED) {
  assert.ok(post.title.trim(), `seed title: ${post.id}`);
  assert.ok(post.summary.trim(), `seed summary: ${post.id}`);
  assert.equal(post.slug, post.id, `slug preserved: ${post.id}`);
}

const ids = new Set(GUIDE_POSTS_SEED.map((g) => g.id));
assert.equal(ids.size, GUIDE_POSTS_SEED.length, "guide seed ids unique");

const malicious = sanitizeNoticeHtmlForStorage('<p>ok</p><script>alert(1)</script>');
assert.ok(!/<script/i.test(malicious), "guide body sanitizer blocks script on save");

const cardCss = await fs.readFile(
  path.join(process.cwd(), "src/styles/battery-guide-cards.css"),
  "utf8",
);
assert.match(cardCss, /battery-guide-posts__desktop-grid/, "PC 2-col grid css");
assert.match(cardCss, /battery-guide-posts__mobile-rail/, "mobile swipe rail css");
assert.match(cardCss, /-webkit-line-clamp: 2/, "title clamp");
assert.match(cardCss, /-webkit-line-clamp: 3/, "summary clamp");

const hub = await fs.readFile(
  path.join(process.cwd(), "src/components/guide/BatteryGuidePostsHub.tsx"),
  "utf8",
);
assert.match(hub, /useHorizontalScrollIndicator/, "scroll indicator hook");
assert.match(hub, /HorizontalScrollIndicator/, "scroll indicator component");

const uploadRoute = await fs.readFile(
  path.join(process.cwd(), "src/app/api/admin/guide-posts/upload/route.ts"),
  "utf8",
);
assert.match(uploadRoute, /verifyAdminApiRequest/, "upload requires admin auth");

console.log(
  `verify-battery-guide-cms: seed ${GUIDE_POSTS_SEED.length}, static ${BATTERY_GUIDE_POSTS.length} — passed`,
);
