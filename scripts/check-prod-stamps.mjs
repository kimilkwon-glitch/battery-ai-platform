const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const paths = [
  "/",
  "/batteries/AGM60L",
  "/vehicle/sorento-mq4?fuel=%ED%95%98%EC%9D%B4%EB%B8%8C%EB%A6%AC%EB%93%9C",
  "/search?q=%EC%8F%98%EB%A0%8C%ED%86%A0%20MQ4%20%ED%95%98%EC%9D%B4%EB%B8%8C%EB%A6%AC%EB%93%9C",
];

for (const p of paths) {
  const r = await fetch(`${BASE}${p}`, {
    headers: { "Cache-Control": "no-cache", "User-Agent": "BM-Stamp-Check/1.0" },
  });
  const h = await r.text();
  const stamps = [...new Set(h.match(/BM-UX-REV-[A-Z0-9-]+/g) ?? [])];
  console.log(`\n${p} (${r.status})`);
  console.log("  stamps:", stamps.join(", ") || "(none)");
  console.log("  AGM60 footer:", h.includes('data-primary-battery="AGM60L"'));
  console.log("  sorento-mq4:", h.includes("sorento-mq4"), " sorento-xm:", h.includes("sorento-xm"));
}
