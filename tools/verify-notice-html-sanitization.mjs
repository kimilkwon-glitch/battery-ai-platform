/**
 * Notice HTML sanitizer regression tests
 * Usage: npm run verify:notice-sanitization
 */
import { ensureTsxVerify } from "../scripts/ensure-tsx-verify.mjs";

ensureTsxVerify(import.meta.url);

await import("../scripts/register-server-only.mjs");

const { sanitizeNoticeHtml, isNoticeHtmlEffectivelyEmpty } = await import(
  "../src/lib/security/sanitize-notice-html.server.ts"
);

let passed = 0;
let failed = 0;

function assert(name, cond, detail = "") {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function mustNotMatch(html, pattern, label) {
  if (pattern.test(html)) {
    throw new Error(`${label} matched ${pattern}`);
  }
}

console.log("verify-notice-html-sanitization\n");

{
  const out = sanitizeNoticeHtml(`<script>alert(1)</script><p>안내</p>`);
  mustNotMatch(out, /<script/i, "script");
  assert("script tag removed", !/<script/i.test(out) && out.includes("안내"));
}

{
  const out = sanitizeNoticeHtml(`<img src=x onerror=alert(1)>`);
  mustNotMatch(out, /onerror/i, "onerror");
  assert("img onerror removed", !/onerror/i.test(out));
}

{
  const out = sanitizeNoticeHtml(`<a href="javascript:alert(1)">클릭</a>`);
  mustNotMatch(out, /javascript:/i, "javascript href");
  assert("javascript href removed", !/href=/i.test(out) || !/javascript:/i.test(out));
}

{
  const out = sanitizeNoticeHtml(`<iframe src="https://evil.example"></iframe>`);
  assert("iframe removed", !/<iframe/i.test(out));
}

{
  const out = sanitizeNoticeHtml(`<div style="position:fixed;inset:0">가림</div>`);
  assert("div/style removed", !/<div/i.test(out) && out.includes("가림"));
}

{
  const out = sanitizeNoticeHtml(`<svg><script>alert(1)</script></svg>`);
  assert("svg/script removed", !/<svg/i.test(out) && !/<script/i.test(out));
}

{
  const out = sanitizeNoticeHtml(`<a href="&#x6a;avascript:alert(1)">클릭</a>`);
  assert("entity javascript blocked", !/javascript:/i.test(out));
}

{
  const out = sanitizeNoticeHtml(`<img src="data:text/html;base64,abc">`);
  assert("data uri img blocked", !/src="data:/i.test(out));
}

{
  const out = sanitizeNoticeHtml(`<a target="_blank" href="https://example.com">링크</a>`);
  assert("external link kept", out.includes('href="https://example.com"'));
  assert("rel noopener added", /rel="noopener noreferrer"/i.test(out));
}

{
  const input =
    "<h2>안내</h2><p><strong>중요</strong> 내용입니다.</p><ul><li>항목</li></ul>";
  const out = sanitizeNoticeHtml(input);
  assert(
    "normal structure preserved",
    out.includes("<h2>") && out.includes("<strong>") && out.includes("<li>"),
  );
}

{
  const out = sanitizeNoticeHtml(
    `<table><thead><tr><th>카드</th></tr></thead><tbody><tr><td>예시</td></tr></tbody></table>`,
  );
  assert("table preserved", /<table/i.test(out) && /<th>/i.test(out) && /<td>/i.test(out));
}

{
  const out = sanitizeNoticeHtml(
    `<p>택배 안내 <a href="/order-checklist">체크리스트</a></p>`,
  );
  assert("relative link preserved", out.includes('href="/order-checklist"'));
}

assert(
  "malicious-only becomes empty",
  isNoticeHtmlEffectivelyEmpty(`<script>alert(1)</script>`),
);

console.log(`\nverify-notice-html-sanitization: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
