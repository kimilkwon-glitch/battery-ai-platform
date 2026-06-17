/**
 * Q&A·가이드 관리자 에디터 정적 검증
 * node tools/verify-admin-content-editors.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ensureTsxVerify } from "../scripts/ensure-tsx-verify.mjs";

ensureTsxVerify(import.meta.url);

const { isStoredContentUnchanged, looksLikeHtml, plainTextToEditorHtml } = await import(
  "../src/lib/content/rich-text-content.ts"
);
const {
  isQnaAnswerEffectivelyEmpty,
  sanitizeQnaAnswerForStorage,
  sanitizeQnaAnswerHtml,
} = await import("../src/lib/content/sanitize-qna-answer.ts");

const root = process.cwd();
let passed = 0;
let failed = 0;

function ok(label) {
  passed += 1;
  console.log(`  ✓ ${label}`);
}

function fail(label, detail) {
  failed += 1;
  console.error(`  ✗ ${label}${detail ? `: ${detail}` : ""}`);
}

function assert(cond, label, detail) {
  if (cond) ok(label);
  else fail(label, detail);
}

function fileIncludes(relPath, needle) {
  const full = join(root, relPath);
  if (!existsSync(full)) return false;
  return readFileSync(full, "utf8").includes(needle);
}

function fileExcludes(relPath, needle) {
  return !fileIncludes(relPath, needle);
}

console.log("verify:admin-content-editors\n");

assert(fileIncludes("src/components/admin/AdminRichTextEditor.tsx", "AdminRichTextEditor"), "AdminRichTextEditor component");
assert(fileIncludes("src/components/admin/AdminProductQnaClient.tsx", "AdminRichTextEditor"), "product Q&A uses rich editor");
assert(fileIncludes("src/components/admin/AdminInquiriesClient.tsx", "AdminRichTextEditor"), "inquiries uses rich editor");
assert(fileIncludes("src/components/admin/AdminGuidePostsClient.tsx", "AdminRichTextEditor"), "guide uses rich editor");
assert(fileExcludes("src/components/admin/AdminProductQnaClient.tsx", 'className="admin-inquiries__textarea'), "product Q&A raw textarea removed");
assert(fileIncludes("src/components/battery/BatteryProductQnaPanel.tsx", "RichTextContent"), "customer Q&A rich display");
assert(fileIncludes("src/components/admin/AdminGuidePostsClient.tsx", "1200×675"), "guide thumb size hint");
assert(fileIncludes("src/components/admin/AdminProductQnaClient.tsx", "memoDirty"), "Q&A dirty tracking");
assert(fileIncludes("src/components/admin/AdminGuidePostsClient.tsx", "bodyDirty"), "guide body dirty tracking");
assert(fileIncludes("src/app/api/admin/inquiries/[id]/route.ts", "sanitizeQnaAnswerForStorage"), "API sanitizes Q&A answer");

assert(looksLikeHtml("<p>hello</p>"), "detect HTML content");
assert(!looksLikeHtml("plain\nline"), "detect plain text");
assert(plainTextToEditorHtml("a\nb").includes("<br>"), "plain text to editor html");
assert(isStoredContentUnchanged("hello", plainTextToEditorHtml("hello")), "unchanged plain text detection");

const xss = sanitizeQnaAnswerHtml('<p>ok</p><script>alert(1)</script><iframe src="x"></iframe>');
assert(!xss.includes("script"), "Q&A sanitizer strips script");
assert(!xss.includes("iframe"), "Q&A sanitizer strips iframe");
assert(sanitizeQnaAnswerForStorage("<p><strong>hi</strong></p>")?.includes("<strong>"), "Q&A allows bold");
assert(isQnaAnswerEffectivelyEmpty("<p></p>"), "empty Q&A answer");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
