#!/usr/bin/env npx tsx
/**
 * 콘텐츠 워크벤치 JSON + CONTENT_INVENTORY.md 생성
 * npm run generate:content-workbench
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { collectAllAdminContentItems } from "../src/lib/admin/collectAllContent";
import {
  generateContentInventoryMarkdown,
  workbenchMeta,
} from "../src/lib/admin/generateContentInventory";

const root = resolve(__dirname, "..");
const items = collectAllAdminContentItems();

const workbenchPath = resolve(root, "src/data/admin/contentWorkbench.json");
const inventoryPath = resolve(root, "docs/CONTENT_INVENTORY.md");

writeFileSync(workbenchPath, JSON.stringify(items, null, 2) + "\n", "utf8");
writeFileSync(inventoryPath, generateContentInventoryMarkdown(items), "utf8");

console.log(`contentWorkbench.json — ${items.length} items`);
console.log(`CONTENT_INVENTORY.md — ${inventoryPath}`);
console.log(JSON.stringify(workbenchMeta(items), null, 2));
