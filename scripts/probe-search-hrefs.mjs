#!/usr/bin/env node
import { buildSearchPageResults } from "../src/lib/search-page-results.ts";

const qs = ["K3", "케이쓰리", "아반떼", "그랜저 IG", "쏘렌토 MQ4", "포터2", "스타리아", "AGM80L", "쏘나타"];
for (const q of qs) {
  const r = buildSearchPageResults(q);
  const v = r.vehicles.slice(0, 4).map((x) => x.href);
  console.log(
    JSON.stringify({
      q,
      vehicles: r.vehicles.length,
      recognized: Boolean(r.recognizedVehicle),
      hrefs: v,
      recHref: r.recognizedVehicle?.href ?? null,
    }),
  );
}
