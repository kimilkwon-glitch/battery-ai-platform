const urls = [
  ["EV6", "https://battery-ai-platform.vercel.app/search?q=EV6%20%EB%B3%B4%EC%A1%B0%EB%B0%B0%ED%84%B0%EB%A6%AC"],
  ["ioniq5", "https://battery-ai-platform.vercel.app/search?q=%EC%95%84%EC%9D%B4%EC%98%A4%EB%8B%895%20%EB%B0%B0%ED%84%B0%EB%A6%AC"],
  ["busan", "https://battery-ai-platform.vercel.app/search?q=%EB%B6%80%EC%82%B0%20%EB%B0%B0%ED%84%B0%EB%A6%AC%20%EC%B6%9C%EC%9E%A5"],
  ["deokcheon", "https://battery-ai-platform.vercel.app/search?q=%EB%8D%95%EC%B2%9C%20%EB%B0%B0%ED%84%B0%EB%A6%AC%20%EA%B5%90%EC%B2%B4"],
  ["hakjang", "https://battery-ai-platform.vercel.app/search?q=%ED%95%99%EC%9E%A5%EC%A0%90%20%EB%B0%B0%ED%84%B0%EB%A6%AC%20%EA%B5%90%EC%B2%B4"],
  ["delivery", "https://battery-ai-platform.vercel.app/search?q=%ED%83%9D%EB%B0%B0%20%EB%B0%B0%ED%84%B0%EB%A6%AC%20%EC%A3%BC%EB%AC%B8"],
  ["shop", "https://battery-ai-platform.vercel.app/search?q=%EB%B0%B0%ED%84%B0%EB%A6%AC%20%EC%83%81%ED%92%88%20%ED%99%95%EC%9D%B8"],
  ["ray", "https://battery-ai-platform.vercel.app/search?q=%EB%A0%88%EC%9D%B4%20%EB%B8%94%EB%9E%99%EB%B0%95%EC%8A%A4%20%EB%B0%A9%EC%A0%84"],
  ["compare100r", "https://battery-ai-platform.vercel.app/search?q=100R%20vs%20AGM95L"],
  ["porter-bat", "https://battery-ai-platform.vercel.app/search?q=%ED%8F%AC%ED%84%B02%20%EB%B0%B0%ED%84%B0%EB%A6%AC"],
];

const pick = (html, re) => [...html.matchAll(re)].map((m) => m[1].trim());

for (const [name, url] of urls) {
  const h = await (await fetch(url)).text();
  console.log(JSON.stringify({
    name,
    primary: pick(h, /btnPrimary[^>]*>([^<]+)/g),
    secondary: pick(h, /btnSecondary[^>]*>([^<]+)/g),
    tertiary: pick(h, /btnTertiary[^>]*>([^<]+)/g).slice(0, 8),
    vehicle: pick(h, /href="(\/vehicle\/[^"]+)"/g).slice(0, 4),
    battery: pick(h, /href="(\/batteries\/[^"]+)"/g).slice(0, 4),
    compare: h.match(/href="(\/compare[^"]+)"/)?.[1] ?? null,
    diagnosis: pick(h, /href="(\/diagnosis\/[^"]+)"/g).slice(0, 2),
    service: h.includes("/service-center"),
    shop: h.includes("/shop"),
    noSpec: h.includes("등록된 차량 규격"),
    noVehicle: h.includes("일치하는 차량"),
    focus: h.includes('id="search-focus"'),
    intent: pick(h, /text-xs font-bold text-blue-600">([^<]+)/g)[0] ?? null,
    h1: h.match(/검색 결과/) ? "ok" : null,
  }));
}
