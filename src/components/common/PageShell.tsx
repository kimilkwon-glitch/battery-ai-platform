import { PortalHeader } from "@/components/portal";
import { SiteFooter } from "@/components/common/SiteFooter";
import { bm } from "@/lib/design-tokens";

export function PageShell({
  children,
  title,
  pageLabel,
  description,
  breadcrumbs,
  showSearch = true,
  searchPlaceholder,
  defaultQuery,
  wide = false,
  showFooter = false,
}: {
  children: React.ReactNode;
  title?: string;
  pageLabel?: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  defaultQuery?: string;
  wide?: boolean;
  showFooter?: boolean;
}) {
  return (
    <main className={bm.pageBg}>
      <PortalHeader
        title={pageLabel ?? title}
        showSearch={showSearch}
        searchPlaceholder={searchPlaceholder}
        defaultQuery={defaultQuery}
      />
      <div className={wide ? bm.pageContainerWide : bm.pageContainer}>
        {title || description ? (
          <header className={`${bm.card} mb-5 ${bm.cardPad}`}>
            {title ? <h1 className="text-xl font-black tracking-tight text-slate-950">{title}</h1> : null}
            {description ? <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">{description}</p> : null}
          </header>
        ) : null}
        {children}
        {showFooter ? <SiteFooter className="mt-8" /> : null}
      </div>
    </main>
  );
}
