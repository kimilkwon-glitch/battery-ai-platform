#!/usr/bin/env node
/**
 * P0 search fix verification (production or local)
 * Usage: node scripts/verify-search-p0-fix.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";

const CASES = [
  { q: "CMF80L", must: ["CMF80L"], mustNot: ["/batteries/80L", ">80L<span"] },
  { q: "단자 방향 CMF80L", must: ["CMF80L"], mustNot: ["/batteries/80L"] },
  { q: "스타리아 디젤 CMF80L", must: ["CMF80L"], mustNot: ["/batteries/80L"] },
  { q: "EV6 보조배터리", must: ["EV6", "search-focus"], mustNot: ["/vehicle/cr-v", "등록된 차량 규격 정보가 없습니다"] },
  { q: "아이오닉5 배터리", must: ["아이오닉5", "search-focus"], mustNot: ["등록된 차량 규격 정보가 없습니다"] },
  { q: "스포티지 NQ5 하이브리드", must: ["AGM60L", "/vehicle/sportage-nq5"], mustNot: ["DIN74R"] },
  {
    q: "그랜저 IG 가솔린",
    must: ["AGM80L", "search-focus"],
    mustNot: ["AGM70L 규격 상세", 'data-primary-battery="AGM70L"'],
  },
  { q: "그랜저 IG 디젤", must: ["AGM80L"] },
  { q: "쏘렌토 MQ4 하이브리드", must: ["AGM60L", "sorento-mq4"] },
  { q: "포터2 20년식", must: ["100R", "porter2-new"] },
];

let pass = 0;
let fail = 0;

for (const c of CASES) {
  const url = `${BASE}/search?q=${encodeURIComponent(c.q)}`;
  const html = await (await fetch(url, { headers: { "User-Agent": "BM-P0-Verify/1.0" } })).text();
  const errors = [];
  for (const m of c.must) {
    if (!html.includes(m)) errors.push(`missing: ${m}`);
  }
  for (const n of c.mustNot ?? []) {
    if (html.includes(n)) errors.push(`forbidden: ${n}`);
  }
  if (errors.length === 0) {
    pass++;
    console.log(`PASS  ${c.q}`);
  } else {
    fail++;
    console.log(`FAIL  ${c.q}`);
    for (const e of errors) console.log(`      ${e}`);
  }
}

console.log(`\n${pass}/${CASES.length} passed`);
process.exit(fail > 0 ? 1 : 0);
