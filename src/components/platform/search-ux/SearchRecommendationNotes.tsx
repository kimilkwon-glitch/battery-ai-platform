export function SearchRecommendationNotes({ reasons }: { reasons: string[] }) {
  if (reasons.length === 0) return null;
  return (
    <ul className="space-y-1 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 text-xs font-medium leading-relaxed text-slate-600">
      {reasons.map((line) => (
        <li key={line} className="flex gap-2">
          <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}
