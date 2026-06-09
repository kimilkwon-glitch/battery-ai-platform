#!/usr/bin/env node
const BASE = process.argv[2] ?? "https://battery-ai-platform.vercel.app";
const EXPECTED = "BM-VEHICLE-DB-INTEGRITY-20260530-V1";

async function fetchHtml(path) {
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}cb=${Date.now()}`;
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  return { status: res.status, html: await res.text(), url: res.url };
}

const forbidden = /vehicle-battery-db|차량표 미등록|needsReview|사진·문의|needs_review/i;

async function main() {
  const home = await fetchHtml("/");
  const stamp = home.html.match(/data-build-version="([^"]+)"/)?.[1] ?? "missing";
  console.log("stamp:", stamp, stamp === EXPECTED ? "OK" : "WAIT");
  console.log("home forbidden:", forbidden.test(home.html));

  const gv = await fetchHtml("/search?q=GV80");
  console.log("GV80 detail:", {
    genesis: gv.html.includes("제네시스"),
    gv80: gv.html.includes("GV80"),
    agm95r: gv.html.includes("AGM95R"),
  });

  for (const q of ["GV80", "K3", "코란도 C", "포터2 2020년식"]) {
    const { html, status } = await fetchHtml(`/search?q=${encodeURIComponent(q)}`);
    const topOk =
      q === "GV80"
        ? /제네시스 GV80/.test(html) && /AGM95R/.test(html)
        : q === "K3"
          ? /K3/.test(html)
          : q.includes("코란도")
            ? /코란도/.test(html)
            : /100R/.test(html);
    console.log(
      `search ${q}:`,
      status,
      "forbidden",
      forbidden.test(html),
      "content",
      topOk ? "OK" : "check",
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
