import Link from "next/link";
import { getCompareDeepNote } from "@/data/battery/compareDeepNotes";
import { bm } from "@/lib/design-tokens";

type Props = {
  codeA: string;
  codeB: string;
};

export function CompareDeepNotePanel({ codeA, codeB }: Props) {
  const note = getCompareDeepNote(codeA, codeB);
  if (!note) return null;

  return (
    <section
      className={
        note.notInterchangeable
          ? `${bm.warningPanel} ${bm.cardPad}`
          : `${bm.card} ${bm.cardPad} border-blue-100 bg-blue-50/40`
      }
    >
      <p className={bm.label}>비교 안내</p>
      <h2 className={`${bm.titleMd} mt-1`}>{note.headline}</h2>
      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">{note.summary}</p>
      <ul className="mt-2 space-y-1">
        {note.bullets.map((b) => (
          <li key={b} className="text-xs font-medium text-slate-600">
            · {b}
          </li>
        ))}
      </ul>
      {note.notInterchangeable ? (
        <p className="mt-3 text-xs font-bold text-amber-900">
          단순 대체·호환으로 보지 마세요. 차종·사진 기준으로 확인하세요.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Link className={bm.btnTertiary + " text-xs"} href="/photo-check">
          사진으로 확인
        </Link>
        <Link className={bm.btnTertiary + " text-xs"} href="/order-checklist">
          주문 전 체크
        </Link>
      </div>
    </section>
  );
}
