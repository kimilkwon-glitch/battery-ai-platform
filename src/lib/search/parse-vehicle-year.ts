export type VehicleYearEra = "from2020" | "until2019" | null;

export type VehicleYearHint = {
  year: number | null;
  era: VehicleYearEra;
};

/** 검색어 연식 힌트 — 포터2 20년식 / 2020년 이후 등 */
export function parseVehicleYearHint(query: string): VehicleYearHint {
  const q = query.replace(/\s+/g, " ").trim();

  if (
    /(?:21|22|23|24|25)\s*년\s*식|20\s*년\s*(?:식|이후)|2020\s*년?\s*(?:식|이후)?|(?:^|\s)2020(?:\s*년)?(?:\s*이후)?/i.test(q) ||
    /(?:^|\s)(202[1-5])(?:\s*년)?(?:\s*이후)?/i.test(q) ||
    /이후\s*20\s*년|2020년형(?:\s*이후)?/i.test(q)
  ) {
    const m = q.match(/(?:^|\s)(202[1-5])(?:\s*년)?/i);
    const yy = q.match(/\b(21|22|23|24|25)\s*년\s*식/i);
    const year = m ? Number(m[1]) : yy ? 2000 + Number(yy[1]) : 2020;
    return { year, era: "from2020" };
  }

  if (
    /19\s*년\s*(?:식|이전)|2019\s*년?\s*(?:식|이전)?|(?:^|\s)2019(?:\s*년)?(?:\s*이전)?/i.test(q) ||
    /~19|이전\s*연식/i.test(q)
  ) {
    return { year: 2019, era: "until2019" };
  }

  const yearStyle = q.match(/(?:19|20)(\d{2})\s*년\s*식/i);
  if (yearStyle) {
    const yy = Number(yearStyle[1]);
    const year = yy >= 50 ? 1900 + yy : 2000 + yy;
    if (year >= 2020) return { year, era: "from2020" };
    if (year <= 2019) return { year, era: "until2019" };
    return { year, era: null };
  }

  const shortYear = q.match(/\b(1[6-9]|2[0-5])\s*년(?:\s*식)?\b/i);
  if (shortYear) {
    const yy = Number(shortYear[1]);
    const year = yy >= 16 && yy <= 25 ? 2000 + yy : yy;
    if (year >= 2020) return { year, era: "from2020" };
    if (year <= 2019) return { year, era: "until2019" };
    return { year, era: null };
  }

  const fourDigit = q.match(/\b(20\d{2})\s*년?/i);
  if (fourDigit) {
    const year = Number(fourDigit[1]);
    if (year >= 2020) return { year, era: "from2020" };
    if (year <= 2019) return { year, era: "until2019" };
    return { year, era: null };
  }

  return { year: null, era: null };
}

export function isPorter2Query(query: string): boolean {
  return /포터\s*2|포터2|Porter\s*2/i.test(query);
}
