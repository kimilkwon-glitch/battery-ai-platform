"use client";

import Link from "next/link";
import { getSearchResultGroups, type SearchResultGroup } from "@/lib/navigationGraph";

export function SearchGroupedNav({ query }: { query: string }) {
  const groups = getSearchResultGroups(query);
  if (!groups.length) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-black text-slate-900">유형별 검색 결과</h2>
      <p className="mt-1 text-xs font-semibold text-slate-500">검색어와 연결된 페이지를 바로 이동할 수 있습니다.</p>
      <div className="mt-4 space-y-4">
        {groups.map((group) => (
          <GroupBlock key={group.type} group={group} />
        ))}
      </div>
    </section>
  );
}

function GroupBlock({ group }: { group: SearchResultGroup }) {
  return (
    <div>
      <p className="text-[11px] font-black text-blue-600">{group.label}</p>
      <div className="mt-2 space-y-2">
        {group.items.map((item) => (
          <div key={item.href} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <Link href={item.href} className="text-sm font-black text-slate-900 hover:text-blue-700">
              {item.label}
            </Link>
            {item.meta ? <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{item.meta}</p> : null}
            {item.actions?.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.actions.map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-black text-slate-700 ring-1 ring-slate-200 hover:bg-blue-600 hover:text-white"
                  >
                    {a.title}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
