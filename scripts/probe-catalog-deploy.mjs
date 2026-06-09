const queries = [
  "니로",
  "니로 하이브리드",
  "니로 전기",
  "기아 니로 하이브리드",
  "DIN50L 니로",
];

for (const q of queries) {
  const url = `https://battery-ai-platform.vercel.app/search?q=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  const html = await res.text();
  console.log("\n===", q);
  console.log("catalog:", html.includes("vehicle-search-catalog"));
  console.log("brand cards:", html.includes("vehicle-brand-product"));
  console.log("old block:", html.includes("추천 배터리"));
  console.log("mini spec:", html.includes("대표 제원 요약"));
  console.log("recommended card:", html.includes("RecommendedBatteryCard") || html.includes("배터리 기본 안내"));
}

const vehicleUrl = "https://battery-ai-platform.vercel.app/vehicle/niro-de?fuel=하이브리드";
const v = await (await fetch(vehicleUrl)).text();
const stamp =
  v.match(/data-build-stamp\\":\\"([^"\\]+)/)?.[1] ??
  v.match(/data-build-stamp="([^"]+)"/)?.[1];
console.log("\n=== vehicle niro-de");
console.log("stamp:", stamp);
console.log("fuel chips:", v.includes("data-search-condition-chips"));
console.log("brand cards:", v.includes("vehicle-brand-product"));
console.log("주문하기:", (v.match(/주문하기/g) ?? []).length);
