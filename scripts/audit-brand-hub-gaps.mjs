import {
  auditBrandHubFieldGaps,
  listBrandHubCatalogForTab,
} from "../src/lib/brand-hub-catalog.ts";

for (const brand of ["rocket", "solite"]) {
  console.log(`\n=== ${brand} catalog counts ===`);
  for (const tab of ["general", "din", "agm"]) {
    const list = listBrandHubCatalogForTab(brand, tab);
    console.log(tab, list.length, list.map((s) => s.code).join(", "));
  }
  const gaps = auditBrandHubFieldGaps(brand);
  console.log(`gaps (${gaps.length}):`);
  for (const g of gaps) {
    console.log(`  ${g.code} [${g.tab}] missing: ${g.missing.join(", ")} (${g.cause})`);
  }
}
