const cases = [
  ["busan", "%EB%B6%80%EC%82%B0%20%EB%B0%B0%ED%84%B0%EB%A6%AC%20%EC%B6%9C%EC%9E%A5"],
  ["deokcheon", "%EB%8D%95%EC%B2%9C%20%EB%B0%B0%ED%84%B0%EB%A6%AC%20%EA%B5%90%EC%B2%B4"],
  ["hakjang", "%ED%95%99%EC%9E%A5%EC%A0%90%20%EB%B0%B0%ED%84%B0%EB%A6%AC%20%EA%B5%90%EC%B2%B4"],
  ["delivery", "%ED%83%9D%EB%B0%B0%20%EB%B0%B0%ED%84%B0%EB%A6%AC%20%EC%A3%BC%EB%AC%B8"],
  ["shop-q", "%EB%B0%B0%ED%84%B0%EB%A6%AC%20%EC%83%81%ED%92%88%20%ED%99%95%EC%9D%B8"],
  ["ev6", "EV6%20%EB%B3%B4%EC%A1%B0%EB%B0%B0%ED%84%B0%EB%A6%AC"],
  ["ioniq5", "%EC%95%84%EC%9D%B4%EC%98%A4%EB%8B%895%20%EB%B0%B0%ED%84%B0%EB%A6%AC"],
];
const base = "https://battery-ai-platform.vercel.app/search?q=";
for (const [name, q] of cases) {
  const h = await (await fetch(base + q)).text();
  const links = [...h.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)</g)]
    .map((m) => ({ href: m[1], label: m[2].trim() }))
    .filter((l) => l.label.length > 1 && l.label.length < 40);
  const uniq = [];
  const seen = new Set();
  for (const l of links) {
    const k = l.label + l.href;
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(l);
  }
  console.log("\n##", name);
  for (const l of uniq.slice(0, 15)) console.log(`  - ${l.label} → ${l.href}`);
  const msgs = [
    "등록된 차량 규격",
    "일치하는 차량",
    "택배 주문",
    "출장",
    "학장",
    "덕천",
    "부산",
  ];
  for (const m of msgs) if (h.includes(m)) console.log(`  [marker] ${m}`);
}
