# Read-only packaging: copies DB-related files to db-export-for-review (no source changes).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$exportDir = Join-Path $root "db-export-for-review"
$zipPath = Join-Path $root "battery-manager-db-export-for-review.zip"

$files = @(
  # 1순위: 차종-배터리 매칭
  "src/data/vehicle-battery-db.json",
  "src/data/vehicle_battery_db_cursor_FINAL_all_corrected.json",
  "src/data/vehicle-battery-enrichment.json",
  "src/data/vehicle-battery-db.meta.json",
  "src/lib/vehicleBattery.ts",
  "src/lib/search/vehicle-battery-candidate-map.ts",
  "src/lib/search/resolve-vehicle-battery-spec.ts",
  "src/lib/search/vehicle-canonical-db-bridge.ts",
  "src/lib/vehicle-fuel-primary-battery.ts",
  "src/lib/search/fitment-overrides.ts",
  "src/lib/search/staria-query-spec-guard.ts",
  "src/data/vehicle-generation-v04.config.ts",
  "src/data/vehicle-generation-chevrolet.config.ts",
  "src/lib/battery-fitment-display.ts",
  # 2순위: 차량 DB
  "src/lib/platform-catalog.ts",
  "src/lib/car-assets.ts",
  "src/lib/vehicle-asset-genesis.ts",
  "src/lib/vehicle-asset-chevrolet.ts",
  "src/lib/vehicle-asset-v04.ts",
  "src/data/vehicles/vehicles.schema.ts",
  "src/data/vehicles/vehicles.sample.json",
  "src/data/vehicles/vehicleAliases.json",
  "src/lib/data/getVehicles.ts",
  "src/lib/data/getVehicleById.ts",
  "src/lib/data/normalizeVehicle.ts",
  "src/lib/vehicle-data.ts",
  "src/lib/vehicles-browse-data.ts",
  "src/data/cars/index.ts",
  "src/data/cars/types.ts",
  "src/data/cars/hyundai/grandeur.ts",
  "src/data/cars/hyundai/index.ts",
  "src/lib/vehicle-card-hints.ts",
  "src/lib/vehicle-fuel-spec-lines.ts",
  "src/lib/vehicle-condition-spec-lines.ts",
  # 3순위: 배터리 규격 DB
  "src/data/battery/baseSpecs.ts",
  "src/data/battery/batterySpecIndex.ts",
  "src/data/battery/batterySpecsByBrand.ts",
  "src/data/battery/batterySpecAliases.ts",
  "src/data/battery/batterySpecRelations.ts",
  "src/data/battery/types.ts",
  "src/data/battery/upgradeRules.ts",
  "src/data/battery/batteryUpgradeRules.ts",
  "src/data/battery/brands/rocket-specs.ts",
  "src/data/battery/brands/solite-specs.ts",
  "src/data/battery/brands/atlas-specs.ts",
  "src/data/battery/brands/delkor-specs.ts",
  "src/data/batteries/batteries.schema.ts",
  "src/data/batteries/batteries.sample.json",
  "src/data/batteries/specMappings.json",
  "src/data/batteries/brand-mapping.json",
  "src/data/batteries/products.json",
  "src/lib/battery-alias-map.ts",
  "src/lib/data/resolveSpec.ts",
  "src/lib/batteryNormalize.ts",
  "src/lib/platform-data.ts",
  "src/lib/platform-types.ts",
  # 4순위: alias / search 매칭
  "src/data/vehicle-alias-db.ts",
  "src/data/vehicle-alias-v02-supplement.ts",
  "src/data/vehicle-alias-v03-supplement.ts",
  "src/data/vehicle-alias-v04-supplement.ts",
  "src/data/vehicle-alias-chevrolet-supplement.ts",
  "src/lib/search/resolve-vehicle-alias-v01.ts",
  "src/lib/search/search-vehicle-aliases.ts",
  "src/lib/search/vehicle-alias-slug-map.ts",
  "src/lib/search/vehicle-canonical-registry.ts",
  "src/lib/search/parse-vehicle-intent.ts",
  "src/lib/search/battery-spec-search-alias.ts",
  "src/lib/search/vehicle-aliases.ts",
  "src/lib/search/vehicle-query-match.ts",
  "src/lib/search/parse-vehicle-year.ts",
  "src/lib/search/chevrolet-slug-resolve.ts",
  "reports/vehicle-alias-v03-probe.json",
  # 5순위: 검색 예시 / QA / 활동
  "src/lib/home-main-catalog-data.ts",
  "src/lib/home-page-data.ts",
  "src/lib/home-search-types.ts",
  "src/lib/search/customer-search-display.ts",
  "src/lib/search/customer-search-autocomplete.ts",
  "src/lib/search/search-quality-testset.ts",
  "src/lib/search/search-quality-rules.ts",
  "src/lib/search/search-quality-types.ts",
  "tools/search-quality/reports/search-quality-raw.json",
  "src/data/activity/mock-activity.json",
  "src/data/activity/site-activity.json",
  "src/lib/vehicle-search.ts",
  "src/lib/data/searchAll.ts",
  # 문서
  "docs/DATA_REQUIREMENTS.md"
)

function Export-Name([string]$rel) {
  return ($rel -replace '[/\\]', '-')
}

if (Test-Path $exportDir) {
  Remove-Item $exportDir -Recurse -Force
}
New-Item -ItemType Directory -Path $exportDir | Out-Null

$copied = @()
$missing = @()
foreach ($rel in $files) {
  $src = Join-Path $root $rel
  if (-not (Test-Path $src)) {
    $missing += $rel
    continue
  }
  $dest = Join-Path $exportDir (Export-Name $rel)
  Copy-Item -LiteralPath $src -Destination $dest -Force
  $copied += [PSCustomObject]@{ Original = $rel; Export = (Split-Path $dest -Leaf) }
}

$copied | ConvertTo-Json -Depth 3 | Set-Content (Join-Path $exportDir "_manifest.json") -Encoding UTF8
if ($missing.Count -gt 0) {
  $missing | Set-Content (Join-Path $exportDir "_missing.txt") -Encoding UTF8
}

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $exportDir "*") -DestinationPath $zipPath -Force

Write-Host "Copied: $($copied.Count) files -> $exportDir"
Write-Host "ZIP: $zipPath"
if ($missing.Count -gt 0) { Write-Host "Missing: $($missing.Count)" }
