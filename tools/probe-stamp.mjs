const r = await fetch("https://battery-ai-platform.vercel.app/?_cb=alias-v01");
const t = await r.text();
console.log("version", t.match(/data-build-version="([^"]+)"/)?.[1]);
console.log("rev", t.match(/data-build-rev="([^"]+)"/)?.[1]);

for (const q of ["K3", "케이쓰리", "K3쿱", "산타페 더프라임", "쏘렌토 하브"]) {
  const j = await fetch(
    `https://battery-ai-platform.vercel.app/api/qa/search-quality?q=${encodeURIComponent(q)}&_cb=alias-v01`,
  ).then((r) => r.json());
  console.log(q, j.recognized, j.summary?.slice(0, 60), "veh", j.vehicleResults?.length);
}
