#!/usr/bin/env node
import { buildSearchIntent } from "../src/lib/search/search-intent-parser.ts";
import { resolveSearchVehicleAlias } from "../src/lib/search/search-vehicle-aliases.ts";
import { buildSearchSummary } from "../src/lib/search/search-summary.ts";

const cases = [
  {
    q: "포터2 20년식",
    expectCode: "100R",
    expectLabel: /2020년형\s*이후|2020년\s*이후/,
  },
  {
    q: "포터2 2019",
    expectCode: "90R",
    expectLabel: /2020년\s*이전|2019/,
  },
  {
    q: "포터2 배터리",
    expectInDisplay: ["90R", "100R"],
    expectLabel: /포터2/,
    expectNote: /2020|90R|100R/,
  },
];

let failed = 0;
for (const c of cases) {
  const p = buildSearchIntent(c.q);
  const a = resolveSearchVehicleAlias(c.q);
  const specs = p.batterySpec.hasSpec ? p.batterySpec.specs : [];
  const s = buildSearchSummary(p, a, specs, "/v");
  const rv = s.recognizedVehicle;
  const code = rv?.primaryBatteryCode ?? "";
  const label = rv?.vehicleLabel ?? "";
  const display = rv?.specDisplay ?? "";
  const note = rv?.secondaryNote ?? rv?.guidance ?? "";
  const codes = c.expectCodes ?? (c.expectCode ? [c.expectCode] : c.expectInDisplay ?? []);
  const ok = c.expectInDisplay
    ? codes.every((x) => display.includes(x)) &&
      c.expectLabel.test(label) &&
      (!c.expectNote || c.expectNote.test(note))
    : codes.every((x) => code.includes(x) || display.includes(x)) && c.expectLabel.test(label);
  console.log(`${ok ? "PASS" : "FAIL"}  ${c.q}  => ${code} | ${label}`);
  if (!ok) failed++;
}
process.exit(failed > 0 ? 1 : 0);
