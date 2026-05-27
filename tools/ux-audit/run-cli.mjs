#!/usr/bin/env node
/**
 * Cross-platform UX audit runner (Windows/macOS/Linux)
 * Usage: node tools/ux-audit/run-cli.mjs [limit] [--headed]
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const limit = process.argv.find((a) => /^\d+$/.test(a)) ?? process.env.UX_AUDIT_LIMIT ?? "100";
const headed = process.argv.includes("--headed");

process.env.UX_AUDIT_LIMIT = headed ? Math.min(parseInt(limit, 10) || 30, 30).toString() : limit;

const configPath = path.join(__dirname, "playwright.config.ts");
const args = ["playwright", "test", "--config", configPath];
if (headed) args.push("--headed");

const result = spawnSync("npx", args, {
  stdio: "inherit",
  shell: true,
  env: process.env,
  cwd: path.resolve(__dirname, "../.."),
});

process.exit(result.status ?? 1);
