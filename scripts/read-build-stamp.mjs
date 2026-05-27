import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function readBuildStamp() {
  const raw = readFileSync(join(root, "build-stamp.json"), "utf8");
  const { stamp } = JSON.parse(raw);
  if (!stamp || typeof stamp !== "string") {
    throw new Error("build-stamp.json must contain { \"stamp\": \"...\" }");
  }
  return stamp;
}
