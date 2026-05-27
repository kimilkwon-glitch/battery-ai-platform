/** 데이터 소스 상태 — UI에 노출하지 않음 */

export type DataSourceKind = "legacy" | "real" | "sample" | "fallback" | "merged";

export type DataLoadResult<T> = {
  items: T[];
  source: DataSourceKind;
  isEmpty: boolean;
};

export function pickDataset<T>(real: T[], sample: T[]): DataLoadResult<T> {
  if (real.length > 0) {
    return { items: real, source: "real", isEmpty: false };
  }
  if (sample.length > 0) {
    return { items: sample, source: "sample", isEmpty: false };
  }
  return { items: [], source: "fallback", isEmpty: true };
}

export function mergeUniqueById<T extends { [key: string]: unknown }>(
  items: T[],
  idKey: keyof T,
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const id = String(item[idKey]);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(item);
  }
  return out;
}
