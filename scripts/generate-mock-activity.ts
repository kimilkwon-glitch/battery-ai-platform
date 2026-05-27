import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateMockActivity } from "../src/lib/mockActivityGenerate";

const outPath = join(process.cwd(), "src/data/activity/mock-activity.json");
const data = generateMockActivity(500);

writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Generated ${data.count} mock events → ${outPath}`);
