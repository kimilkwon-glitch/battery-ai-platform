const base = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const checks = [
  { path: "/vehicle/ioniq5-ne", must: ["EV 저전압 배터리"], mustNot: ["사진확인", "내부 hold", "확인 중"] },
  { path: "/vehicle/grandeur-hg", must: ["80L"], mustNot: ["DIN74L", "AGM80L"] },
  { path: "/vehicle/santafe-tm", must: ["AGM95L"], mustNot: ["AGM80L"] },
  { path: "/vehicle/kona-sx2?fuel=가솔린", must: ["AGM60L"], mustNot: [] },
  { path: "/vehicle/niro-sg2", must: ["리튬 배터리 장착"], mustNot: ["주문하기"] },
  { path: "/vehicle/gmdaewoo-labo-2011", must: ["50L"], mustNot: ["DIN50L"] },
  { path: "/vehicle/daewoo-tosca-2006", must: ["80R"], mustNot: ["AGM80R"] },
];
const batteries = ["80L", "80R", "50L", "AGM95L", "AGM60L", "AGM80R", "DIN74L", "DIN60L", "AGM80L"];

const home = await fetch(base + "/");
const homeHtml = await home.text();
console.log("build_stamp:", homeHtml.match(/data-build-version="([^"]+)"/)?.[1] ?? "MISSING");
console.log("vercel:", home.headers.get("x-vercel-id") ?? "-");

console.log("\n=== VEHICLES ===");
for (const c of checks) {
  const res = await fetch(base + c.path);
  const html = await res.text();
  const okMust = c.must.every((m) => html.includes(m));
  const okNot = c.mustNot.every((m) => !html.includes(m));
  console.log(`${okMust && okNot ? "OK" : "FAIL"} ${c.path} status=${res.status}`);
  if (!okMust) console.log("  missing:", c.must.filter((m) => !html.includes(m)));
  if (!okNot) console.log("  forbidden:", c.mustNot.filter((m) => html.includes(m)));
}

console.log("\n=== BATTERIES ===");
for (const code of batteries) {
  const res = await fetch(`${base}/batteries/${encodeURIComponent(code)}`);
  console.log(`${res.status === 200 ? "OK" : "FAIL"} /batteries/${code} -> ${res.status}`);
}
