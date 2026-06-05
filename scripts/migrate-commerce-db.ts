/**
 * commerce DB 스키마 적용
 * DATABASE_URL=... npx tsx scripts/migrate-commerce-db.ts
 */
import { ensureCommerceSchema } from "../src/lib/db/ensure-commerce-schema";

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  await ensureCommerceSchema();
  console.log("Commerce DB migration complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
