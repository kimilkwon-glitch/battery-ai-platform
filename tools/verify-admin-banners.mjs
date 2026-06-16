/**
 * 관리자 배너 CRUD·업로드 정적 검증 (외부 API/Blob 호출 없음)
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

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

console.log("verify:admin-banners");

for (const p of [
  "src/lib/cms/banner-image-specs.ts",
  "src/lib/cms/banner-image-storage.server.ts",
  "src/app/api/admin/banners/upload/route.ts",
  "src/app/api/admin/banners/[id]/reorder/route.ts",
]) {
  assert(existsSync(join(root, p)), `file exists: ${p}`);
}

assert(
  fileIncludes("src/lib/cms/banner-image-storage.server.ts", "@vercel/blob"),
  "banner images use Vercel Blob",
);
assert(
  !fileIncludes("src/lib/cms/banner-image-storage.server.ts", "writeFileSync"),
  "banner storage does not use local filesystem",
);
assert(
  fileIncludes("src/app/api/admin/banners/upload/route.ts", "verifyAdminApiRequest"),
  "upload requires admin auth",
);
assert(
  fileIncludes("src/app/api/admin/banners/[id]/route.ts", "export async function DELETE"),
  "banner DELETE endpoint exists",
);
assert(
  fileIncludes("src/lib/cms/main-banner-store.postgres.ts", "reorderMainBanner"),
  "reorder store function",
);
assert(
  fileIncludes("src/components/admin/AdminBannersClient.tsx", "/api/admin/banners/upload"),
  "admin UI uses upload API",
);
assert(
  !fileIncludes("src/components/admin/AdminBannersClient.tsx", "토글"),
  "toggle label removed from admin UI",
);
assert(
  fileIncludes("src/components/admin/AdminBannersClient.tsx", "숨김"),
  "hide button label present",
);
assert(
  fileIncludes("src/components/admin/AdminBannersClient.tsx", "노출"),
  "show button label present",
);
assert(
  fileIncludes("src/components/admin/AdminBannersClient.tsx", "BANNER_IMAGE_SPECS.desktop.hint"),
  "PC size hint displayed",
);
assert(
  fileIncludes("src/components/admin/AdminBannersClient.tsx", "bannerAspectWarning"),
  "aspect ratio warning on upload",
);
assert(
  fileIncludes("src/lib/cms/banner-image-specs.ts", "1920"),
  "PC recommended width documented",
);
assert(
  fileIncludes("src/lib/cms/banner-image-specs.ts", "900"),
  "mobile recommended width documented",
);

console.log(`\nverify:admin-banners — ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
