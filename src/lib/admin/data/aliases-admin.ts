import { vehicleAliasDbV01 } from "@/data/vehicle-alias-db";
import { vehicleAssets } from "@/lib/car-assets";
import { getRecordsForSlug } from "@/lib/vehicleBattery";
import type { AdminAliasRow } from "@/types/admin";

export function buildAdminAliasRows(): AdminAliasRow[] {
  const assetBySlug = new Map(vehicleAssets.map((a) => [a.id, a]));
  const aliasCount = new Map<string, number>();

  for (const entry of vehicleAliasDbV01) {
    for (const alias of [...entry.aliases, ...entry.displayAliases]) {
      aliasCount.set(alias, (aliasCount.get(alias) ?? 0) + 1);
    }
  }

  const rows: AdminAliasRow[] = [];

  for (const entry of vehicleAliasDbV01) {
    const slug = entry.slugHint;
    const asset = assetBySlug.get(slug);
    const records = getRecordsForSlug(slug);
    const hasBattery = records.some((r) => r.primaryBattery || r.batteryOptions.length);

    for (const alias of entry.aliases) {
      rows.push({
        alias,
        slug,
        canonicalName: entry.canonicalName,
        displayName: asset?.displayName ?? entry.canonicalName,
        hasImage: Boolean(asset?.image),
        hasBatteryMatch: hasBattery,
        duplicate: (aliasCount.get(alias) ?? 0) > 1,
        unlinked: !asset,
      });
    }
  }

  return rows.sort((a, b) => a.alias.localeCompare(b.alias, "ko"));
}
