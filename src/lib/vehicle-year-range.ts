export type ParsedYearRange = {
  start: number;
  end: number | null;
  raw: string;
};

function expandTwoDigitYear(two: string): number {
  const n = parseInt(two, 10);
  return n <= 30 ? 2000 + n : 1900 + n;
}

/** 연식 문자열 → { start, end } (표시·병합용) */
export function normalizeYearRange(yearText: string): ParsedYearRange | null {
  const raw = yearText.trim();
  if (!raw) return null;

  const full = raw.match(/(19|20)(\d{2})\s*[-~]\s*(?:(19|20)(\d{2})|현재|이후)/);
  if (full) {
    const start = parseInt(full[1] + full[2], 10);
    if (!full[3] && /현재|이후/.test(raw)) return { start, end: null, raw };
    const end = full[3] ? parseInt(full[3] + full[4], 10) : null;
    return { start, end, raw };
  }

  const short = raw.match(/(\d{2})\s*~\s*(\d{2})\s*년/);
  if (short) {
    return {
      start: expandTwoDigitYear(short[1]),
      end: expandTwoDigitYear(short[2]),
      raw,
    };
  }

  const shortOpen = raw.match(/(\d{2})\s*년?\s*~\s*(?:현재|이후)/);
  if (shortOpen) {
    return { start: expandTwoDigitYear(shortOpen[1]), end: null, raw };
  }

  const shortBare = raw.match(/(\d{2})\s*~\s*(\d{2})(?:년)?(?!\d)/);
  if (shortBare) {
    return {
      start: expandTwoDigitYear(shortBare[1]),
      end: expandTwoDigitYear(shortBare[2]),
      raw,
    };
  }

  return null;
}

export function yearIntervalsOverlap(
  a: { start: number; end: number | null } | null,
  b: { start: number; end: number | null } | null,
): boolean {
  if (!a || !b) return true;
  const aEnd = a.end ?? 9999;
  const bEnd = b.end ?? 9999;
  return a.start <= bEnd + 2 && b.start <= aEnd + 2;
}
