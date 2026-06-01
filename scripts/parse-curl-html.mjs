import { readFileSync } from "fs";
for (const f of process.argv.slice(2)) {
  const h = readFileSync(f, "utf8");
  const stamps = [...new Set(h.match(/BM-UX-REV-[A-Z0-9-]+/g) ?? [])];
  const start = h.indexOf('id="fuel-batteries"');
  let first = null;
  if (start >= 0) {
    const re = /data-fuel-hero="([^"]+)"[^>]*data-battery-hero="([^"]+)"/gi;
    const m = re.exec(h.slice(start, start + 8000));
    if (m) first = `${m[1]}=${m[2]}`;
  }
  console.log(f, "stamps:", stamps.join(","), "firstHero:", first ?? "n/a");
}
