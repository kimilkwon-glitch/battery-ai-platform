#!/usr/bin/env node
import { vehicleAssetsToSearchRows } from "../src/lib/vehicle-search.ts";
import { buildSearchPageResults } from "../src/lib/search-page-results.ts";

const raw = vehicleAssetsToSearchRows("쏘나타", 12);
console.log("raw", raw.length, raw[0]?.href);
const page = buildSearchPageResults("쏘나타");
console.log("page vehicles", page.vehicles.length, page.vehicles[0]?.href);
