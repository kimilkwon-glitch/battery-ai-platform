/**
 * Reply template store verification — static checks only.
 * Usage: npx tsx tools/verify-reply-templates-store.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

function testFacadeWiring() {
  const route = readFileSync(
    path.join(process.cwd(), "src/app/api/admin/battery-talk/reply-templates/route.ts"),
    "utf8",
  );
  assert.match(route, /battery-talk-reply-templates-store"/);
  assert.doesNotMatch(route, /battery-talk-reply-templates-store\.json"/);

  const facade = readFileSync(
    path.join(process.cwd(), "src/lib/admin/battery-talk-reply-templates-store.ts"),
    "utf8",
  );
  assert.match(facade, /isOperationalDbMode/);
  assert.match(facade, /reply_templates/);

  const schema = readFileSync(
    path.join(process.cwd(), "src/lib/db/ensure-operational-schema.ts"),
    "utf8",
  );
  assert.match(schema, /admin_reply_templates/);

  console.log("✓ reply template DB facade + schema");
}

testFacadeWiring();
console.log("\nAll reply template store static checks passed.");
