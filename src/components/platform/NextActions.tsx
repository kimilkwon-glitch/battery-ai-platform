"use client";

import Link from "next/link";
import type { ActionLink } from "@/lib/platform-data";

export function NextActions({ title = "다음에 확인하기", actions }: { title?: string; actions: ActionLink[] }) {
  return (
    <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 ring-1 ring-blue-100">
      <h3 className="text-sm font-black text-slate-900">{title}</h3>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((a, index) => (
          <Link
            key={`${a.href}-${a.title}-${index}`}
            href={a.href}
            className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-600 hover:text-white hover:ring-blue-600"
          >
            <p className="text-xs font-black">{a.title}</p>
            <p className="mt-1 text-[10px] font-semibold opacity-80">{a.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
