/**
 * FAQ & Guide CMS verification
 * Usage: npm run verify:cms-content
 */
import { ensureTsxVerify } from "../scripts/ensure-tsx-verify.mjs";

ensureTsxVerify(import.meta.url);

await import("../scripts/register-server-only.mjs");

const assert = (await import("node:assert/strict")).default;

const { SUPPORT_FAQ_SEED } = await import("../src/lib/support-faq-seed.ts");
const { GUIDE_POSTS_SEED } = await import("../src/lib/guide-posts-seed.ts");
const { sanitizeNoticeHtml } = await import("../src/lib/security/sanitize-notice-html.server.ts");

assert.ok(SUPPORT_FAQ_SEED.length >= 10, "FAQ seed should have items");
assert.equal(SUPPORT_FAQ_SEED.length, 35, "FAQ seed should have 35 items");
assert.ok(GUIDE_POSTS_SEED.length >= 3, "Guide seed should have items");

const malicious = sanitizeNoticeHtml('<p>ok</p><script>alert(1)</script>');
assert.ok(!/<script/i.test(malicious), "guide sanitizer blocks script");

const ids = new Set(SUPPORT_FAQ_SEED.map((f) => f.id));
assert.equal(ids.size, SUPPORT_FAQ_SEED.length, "FAQ seed ids unique");

const slugs = new Set(GUIDE_POSTS_SEED.map((g) => g.id));
assert.equal(slugs.size, GUIDE_POSTS_SEED.length, "Guide seed ids unique");

console.log(`verify-cms-content: FAQ seed ${SUPPORT_FAQ_SEED.length}, Guide seed ${GUIDE_POSTS_SEED.length} — passed`);
