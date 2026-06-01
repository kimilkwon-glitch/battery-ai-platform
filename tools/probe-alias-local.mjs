import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Use compiled approach - dynamic import won't work easily. Test resolver only.
import { resolveSearchVehicleAlias } from "../src/lib/search/search-vehicle-aliases.ts";

const queries = ["K3", "케이쓰리", "K3쿱", "산타페 더프라임", "21년식 싼타페", "쏘렌토 하브", "포터 전기"];
for (const q of queries) {
  const r = resolveSearchVehicleAlias(q);
  console.log(q, "->", r?.formalDisplayName ?? r?.label, r?.assetId, r?.searchRecognitionNote?.slice(0, 50));
}
