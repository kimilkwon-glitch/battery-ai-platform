import { PortalHeader } from "@/components/portal";
import { bm } from "@/lib/design-tokens";

export default function Loading() {
  return (
    <main className={bm.pageBg}>
      <PortalHeader />
      <section className={bm.pageContainer}>
        <div className={`mb-3 ${bm.card} px-3 py-2`}>
          <div className="h-3 w-24 animate-pulse rounded bg-blue-100" />
          <div className="mt-2 h-5 w-48 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div className={`${bm.card} p-3`} key={item}>
                <div className="mb-2 h-4 w-32 animate-pulse rounded bg-slate-100" />
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="h-16 animate-pulse rounded-lg bg-slate-50" />
                  <div className="h-16 animate-pulse rounded-lg bg-slate-50" />
                </div>
              </div>
            ))}
          </div>
          <aside className="space-y-3">
            <div className={`h-40 animate-pulse ${bm.card}`} />
            <div className={`h-32 animate-pulse ${bm.card}`} />
          </aside>
        </div>
      </section>
    </main>
  );
}
