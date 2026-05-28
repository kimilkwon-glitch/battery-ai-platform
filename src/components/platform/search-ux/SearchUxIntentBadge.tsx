import { bm } from "@/lib/design-tokens";

export function SearchUxIntentBadge({ label }: { label: string }) {
  return <p className={bm.intentBadge}>{label}</p>;
}
