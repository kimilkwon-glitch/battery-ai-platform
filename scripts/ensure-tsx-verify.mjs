/**
 * TS 소스(@/ path alias 포함)를 import하는 검증 스크립트를 tsx로 재실행.
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

export function ensureTsxVerify(entryUrl) {
  if (!entryUrl) {
    console.error("ensureTsxVerify: pass import.meta.url from the caller script");
    process.exit(1);
  }
  if (process.env.BM_VERIFY_TSX === "1") return;

  const script = fileURLToPath(entryUrl);
  let tsxCli;
  try {
    const tsxPkg = require.resolve("tsx/package.json");
    tsxCli = join(dirname(tsxPkg), "dist/cli.mjs");
  } catch {
    console.error("ensureTsxVerify: tsx devDependency required — run npm install");
    process.exit(1);
  }

  const result = spawnSync(process.execPath, [tsxCli, script, ...process.argv.slice(2)], {
    stdio: "inherit",
    env: { ...process.env, BM_VERIFY_TSX: "1" },
  });

  if (result.status !== 0) {
    if (result.error) {
      console.error("ensureTsxVerify spawn failed:", result.error.message);
    }
    process.exit(result.status ?? 1);
  }
  process.exit(0);
}
