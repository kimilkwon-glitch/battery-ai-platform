const slugs = [
  "renault-samsung-sm3-neo-2014",
  "kia-soul-2008",
  "kia-mohave-the-master-2019",
  "kg-torres-2022",
];
const base = "https://battery-ai-platform.vercel.app";

for (const slug of slugs) {
  const url = `${base}/vehicle/${slug}?_cb=v04`;
  const res = await fetch(url, { headers: { "User-Agent": "BM-V04-Probe" } });
  const t = await res.text();
  const h1 = t.match(/<h1[^>]*>([^<]+)</)?.[1]?.trim() ?? "(no h1)";
  const vehicleImg = t.match(/\/assets\/vehicles\/cars-normalized\/[^"'\s]+/)?.[0] ?? null;
  const oldImg = t.match(/\/assets\/cars-normalized\/[^"'\s]+/)?.[0] ?? null;
  const displayAliases = (t.match(/다르게 부르는 이름|displayAliases|별칭/g) ?? []).length;
  const noDb = t.includes("등록된 차량 규격 정보가 없습니다");
  const sorento = h1.includes("쏘렌토");
  console.log("---", slug, res.status);
  console.log("  h1:", h1);
  console.log("  vehicles img:", vehicleImg);
  console.log("  legacy img:", oldImg);
  console.log("  noDbMsg:", noDb, "| wrongSorento:", sorento);
}

// image HEAD checks
const imgs = [
  "/assets/vehicles/cars-normalized/renault/renault_samsung_sm3_neo_2014.png",
  "/assets/vehicles/cars-normalized/kia/kia_soul_2008.png",
  "/assets/vehicles/cars-normalized/kia/kia_mohave_the_master_2019.png",
  "/assets/vehicles/cars-normalized/kg/kg_torres_2022.png",
];
for (const p of imgs) {
  const r = await fetch(base + p, { method: "HEAD" });
  console.log("IMG", r.status, p);
}
