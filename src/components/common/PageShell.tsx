import clsx from "clsx";
import { PortalHeader } from "@/components/portal";
import { SiteFooter } from "@/components/common/SiteFooter";
import { bm } from "@/lib/design-tokens";
import { type DesignZone, zoneClass, zoneHeaderClass } from "@/lib/design-zones";

export function PageShell({
  children,
  title,
  pageLabel,
  description,
  breadcrumbs,
  showSearch = false,
  searchPlaceholder,
  defaultQuery,
  wide = false,
  showFooter = false,
  zone = "default",
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
  /** 기능별 포인트 컬러 (헤더 좌측 라인) */
  zone?: DesignZone;
}) {
  return (
    <main className={bm.pageBg}>
      <PortalHeader
        title={pageLabel ?? title}
        showSearch={showSearch}
        searchPlaceholder={searchPlaceholder}
        defaultQuery={defaultQuery}
      />
      <div className={clsx(wide ? bm.pageContainerWide : bm.pageContainer, zoneClass(zone))}>
        {title || description ? (
          <header className={clsx(bm.cardPremium, "mb-5", bm.cardPad, zoneHeaderClass(zone))}>
            {title ? <h1 className={bm.titleLg}>{title}</h1> : null}
            {description ? <p className={`mt-1 max-w-2xl ${bm.textSub}`}>{description}</p> : null}
          </header>
        ) : null}
        {children}
        {showFooter ? <SiteFooter className="mt-8" /> : null}
      </div>
    </main>
  );
}
