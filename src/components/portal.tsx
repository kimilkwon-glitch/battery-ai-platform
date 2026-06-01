import type { ReactNode } from "react";
import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import { VehicleThumbnail } from "@/components/VehicleThumbnail";
import { productCardShell, vehicleCardShell, vehicleCardTextCol } from "@/components/car/car-card-styles";
import { bm } from "@/lib/design-tokens";
import { carImageForPlatformVehicleId } from "@/lib/car-data";
import { VehicleSpecBadge } from "@/components/car/VehicleSpecBadge";
import { getVehicleCardHints } from "@/lib/vehicle-card-hints";
import { getVehicleBodyType, uniqueCrossLinks } from "@/lib/platform-data";
import { PortalHeaderClient } from "@/components/platform/PortalHeaderClient";
import { portalNav } from "@/components/platform/PortalHeaderNav";
import { ContentUiIcon } from "@/components/content/ContentUiIcon";
import { IconBadge } from "@/components/common/IconBadge";
import { resolveContentUiIconFromText, type ContentUiIconKey } from "@/lib/content-ui-icons";
import type { IconKey } from "@/lib/icon-map";
import { resolveIconKeyForHubLink } from "@/lib/icon-map";
export { portalNav };

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="mb-2 flex flex-wrap items-center gap-1 text-[11px] font-bold text-slate-400">
      {items.map((item, index) => (
        <span className="flex items-center gap-1" key={`${item.label}-${index}`}>
          {index > 0 ? <span className="text-slate-300">›</span> : null}
          {item.href ? (
            <a className="font-black text-blue-600 hover:underline" href={item.href}>
              {item.label}
            </a>
          ) : (
            <span className="font-black text-slate-600">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function CrossLinkCard({
  title,
  description,
  href,
  iconKey,
}: {
  title: string;
  description: string;
  href: string;
  iconKey?: IconKey;
}) {
  const key = iconKey ?? resolveIconKeyForHubLink(title, href);
  return (
    <a
      className={`flex h-full flex-col ${bm.cardInteractive} ${bm.cardPad}`}
      href={href}
    >
      <span className="mb-2">
        <IconBadge iconKey={key} size="md" />
      </span>
      <span className={`block ${bm.cardTitle}`}>{title}</span>
      <span className={`mt-1.5 flex-1 ${bm.typoCaption}`}>{description}</span>
      <span className={`mt-3 text-xs font-bold text-[var(--bm-primary)]`}>안내 보기 →</span>
    </a>
  );
}

export function CrossLinkGrid({
  links,
}: {
  links: { title: string; description: string; href: string; iconKey?: IconKey }[];
}) {
  const deduped = uniqueCrossLinks(links);
  return (
    <PortalPanel title="다음에 확인하기">
      <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {deduped.map((link, index) => (
          <CrossLinkCard
            description={link.description}
            href={link.href}
            title={link.title}
            key={`${link.href}-${index}`}
          />
        ))}
      </div>
    </PortalPanel>
  );
}

export function RelatedSection({
  vehicles,
  batteries,
  guides,
  questions,
}: {
  vehicles?: { label: string; meta: string; href: string }[];
  batteries?: { label: string; meta: string; href: string }[];
  guides?: { label: string; meta: string; href: string }[];
  questions?: { label: string; meta: string; href: string }[];
}) {
  const blocks = [
    ["관련 차량", vehicles],
    ["관련 배터리", batteries],
    ["관련 가이드", guides],
    ["관련 Q&A", questions],
  ].filter(([, items]) => items && items.length > 0) as [string, { label: string; meta: string; href: string }[]][];

  if (blocks.length === 0) return null;

  return (
    <PortalPanel title="함께 보면 좋은 내용">
      <div className="grid gap-3 md:grid-cols-2">
        {blocks.map(([title, items]) => (
          <div key={title}>
            <p className="mb-1.5 text-[10px] font-black text-slate-400">{title}</p>
            <div className="space-y-1">
              {items.map((item, index) => (
                <a
                  className="grid grid-cols-[1fr_auto] gap-2 rounded-md bg-slate-50 px-2 py-1.5 text-xs ring-1 ring-slate-200 hover:bg-blue-50"
                  href={item.href}
                  key={`${item.href}-${item.label}-${index}`}
                >
                  <span className="truncate font-black">{item.label}</span>
                  <span className="text-[10px] font-bold text-blue-600">{item.meta}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PortalPanel>
  );
}

export function PortalHeader({
  title,
  showSearch = false,
  searchPlaceholder = "차량명, 연식, 배터리 규격 검색",
  defaultQuery,
}: {
  title?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  defaultQuery?: string;
}) {
  return (
    <PortalHeaderClient
      defaultQuery={defaultQuery}
      searchPlaceholder={searchPlaceholder}
      showSearch={showSearch}
    />
  );
}

export function PortalLayout({
  title,
  description,
  children,
  sidebar,
  showSearch = false,
  defaultQuery,
  breadcrumbs,
  crossLinks,
  related,
}: {
  title: string;
  description: string;
  children: ReactNode;
  sidebar: ReactNode;
  showSearch?: boolean;
  defaultQuery?: string;
  breadcrumbs?: BreadcrumbItem[];
  crossLinks?: { title: string; description: string; href: string }[];
  related?: {
    vehicles?: { label: string; meta: string; href: string }[];
    batteries?: { label: string; meta: string; href: string }[];
    guides?: { label: string; meta: string; href: string }[];
    questions?: { label: string; meta: string; href: string }[];
  };
}) {
  return (
    <main className={bm.pageBg}>
      <PortalHeader title={title} showSearch={showSearch} defaultQuery={defaultQuery} />
      <section className={`relative z-0 ${bm.pageContainer} scroll-mt-24 pt-5`}>
        {breadcrumbs ? <Breadcrumb items={breadcrumbs} /> : null}
        <div className={`mb-3 flex flex-wrap items-end justify-between gap-2 ${bm.card} px-3 py-2`}>
          <div>
            <h1 className="text-lg font-black tracking-[-0.04em]">{title}</h1>
          </div>
          <p className="max-w-xl text-xs font-semibold text-[var(--bm-muted)]">{description}</p>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
          <section className="space-y-3">
            {children}
            {crossLinks && crossLinks.length > 0 ? <CrossLinkGrid links={crossLinks} /> : null}
            {related ? <RelatedSection {...related} /> : null}
          </section>
          <RightSidebar>{sidebar}</RightSidebar>
        </div>
      </section>
    </main>
  );
}

export function RightSidebar({ children }: { children: ReactNode }) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-[calc(3.5rem+1px)] lg:z-10 lg:h-fit lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
      {children}
    </aside>
  );
}

export function PanelHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
      <h2 className="text-sm font-black tracking-[-0.02em]">{title}</h2>
      {meta ? <span className="text-[10px] font-black text-[var(--bm-primary)]">{meta}</span> : null}
    </div>
  );
}

/** @deprecated use PanelHeader or common/SectionHeader */
export const SectionHeader = PanelHeader;

export function PortalPanel({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  return (
    <section className={`${bm.card} p-3`}>
      <PanelHeader title={title} meta={meta} />
      {children}
    </section>
  );
}

export function StatusBadge({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "red" | "green" | "amber" | "cyan" | "dark" | "gray";
}) {
  const toneClass =
    tone === "red"
      ? bm.badgeRed
      : tone === "green"
        ? bm.badgeGreen
        : tone === "amber"
          ? bm.badgeAmber
          : tone === "cyan"
            ? bm.badgeCyan
            : tone === "dark"
              ? "bg-[var(--bm-navy)] text-white ring-[var(--bm-navy)]"
              : tone === "gray"
                ? bm.badgeGray
                : bm.badgeBlue;

  return <span className={`${bm.badge} ${toneClass}`}>{children}</span>;
}

export function MetaInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm ring-1 ring-slate-200">
      <span className="font-bold text-slate-400">{label}</span>
      <span className="text-right font-semibold text-slate-700">{value}</span>
    </div>
  );
}

export function MiniStatCard({ label, value, meta }: { label: string; value: string; meta?: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200">
      <p className="text-[10px] font-black text-slate-400">{label}</p>
      <p className="mt-0.5 truncate text-sm font-black text-slate-900">{value}</p>
      {meta ? <p className="mt-0.5 text-[10px] font-bold text-blue-600">{meta}</p> : null}
    </div>
  );
}

export function SearchBar({ placeholder = "차량명, 연식, 배터리 규격 검색" }: { placeholder?: string }) {
  return (
    <form action="/search" className="grid gap-2 md:grid-cols-[1fr_auto]">
      <input className={bm.input} name="q" placeholder={placeholder} />
      <button className={bm.btnPrimary}>검색</button>
    </form>
  );
}

export function RankingWidget({ title, items }: { title: string; items: [string, string, string?][] }) {
  return (
    <PortalPanel title={title}>
      <div className="space-y-1">
        {items.map(([label, meta, href], index) => (
          <a className="grid grid-cols-[24px_1fr_auto] items-center gap-2 rounded-md px-2 py-1.5 hover:bg-blue-50" href={href ?? `/search?q=${encodeURIComponent(label)}`} key={label}>
            <span className="text-xs font-black text-slate-400">{index + 1}</span>
            <span className="truncate text-xs font-black">{label}</span>
            <span className="text-[10px] font-black text-blue-600">{meta}</span>
          </a>
        ))}
      </div>
    </PortalPanel>
  );
}

export function PopularKeywordWidget({ items }: { items: string[] }) {
  return (
    <PortalPanel title="인기 키워드">
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <a className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-600" href={`/search?q=${encodeURIComponent(item)}`} key={item}>
            {item}
          </a>
        ))}
      </div>
    </PortalPanel>
  );
}

export function Thumb({ label, tone = 0 }: { label: string; tone?: number }) {
  const tones = ["from-slate-950 to-blue-600", "from-blue-900 to-cyan-600", "from-slate-700 to-slate-500", "from-indigo-800 to-blue-500"];
  return <span className={`relative block h-14 overflow-hidden rounded-lg bg-gradient-to-br ${tones[tone % tones.length]} p-1.5 text-[9px] font-black text-white`}><span className="rounded bg-white/15 px-1.5 py-0.5">{label}</span><span className="absolute bottom-2 left-2 right-2 h-4 rounded-full bg-white/20 blur-sm" /></span>;
}

export function VehicleCard({
  title,
  href,
  vehicleId,
  onNavigate,
}: {
  title: string;
  /** @deprecated 연식은 vehicleId 기준 hints.yearLine 사용 */
  meta?: string;
  href: string;
  vehicleId: string;
  index?: number;
  onNavigate?: () => void;
}) {
  const bodyType = getVehicleBodyType(vehicleId);
  const imageSrc = carImageForPlatformVehicleId(vehicleId);
  const hints = getVehicleCardHints(vehicleId);
  const isCommercial =
    bodyType === "truck" ||
    bodyType === "van" ||
    /porter|bongo/i.test(vehicleId);

  const yearLine = hints.yearLine;

  return (
    <a className={`${vehicleCardShell}`} href={href} onClick={onNavigate}>
      <VehicleThumbnail
        bodyType={bodyType}
        commercial={isCommercial}
        imageSrc={imageSrc}
        label={title.split(" ")[0]}
      />
      <span className={vehicleCardTextCol}>
        <p className="truncate text-sm font-black leading-tight text-slate-950 group-hover:text-blue-700">
          {title}
          <span className="ml-1.5 text-[11px] font-bold text-slate-400">{yearLine}</span>
        </p>
        <div className="flex items-end justify-between gap-1 leading-none">
          <span className="text-[15px] font-semibold tracking-tight text-slate-800">{hints.primaryCode}</span>
          <span className="mb-0.5 shrink-0 text-[10px] font-black text-blue-600 opacity-0 transition group-hover:opacity-100">
            찾기 →
          </span>
        </div>
        {hints.tokens.length > 0 ? (
          <div className="mt-1 flex flex-nowrap items-center gap-0.5 overflow-hidden">
            {hints.tokens.slice(0, 2).map((token) => (
              <VehicleSpecBadge
                key={token.kind === "diff" ? `diff-${token.level}` : token.kind}
                token={token}
              />
            ))}
          </div>
        ) : null}
      </span>
    </a>
  );
}

export function BatteryCard({
  title,
  spec,
  meta,
  href,
  imageSet,
  image,
  role = "main",
  fit = "cover",
}: {
  title: string;
  spec: string;
  meta: string;
  href: string;
  index?: number;
  imageSet?: import("@/lib/battery-image").BatteryImageSet;
  image?: string;
  role?: import("@/lib/battery-image").BatteryImageRole;
  fit?: "cover" | "contain";
}) {
  return (
    <a className={`block overflow-hidden ${productCardShell}`} href={href}>
      <BatteryThumbnail code={title} imageSet={imageSet} image={image} role={role} fit={fit} ratio="16/9" tall darkOverlay={false} />
      <div className="px-4 pb-1 pt-3">
        <p className="text-sm font-black text-slate-950">{title}</p>
        <p className="mt-1 text-[11px] font-semibold text-slate-600">{spec}</p>
        {meta ? (
          <p className="mt-1.5">
            <StatusBadge tone="gray">{meta}</StatusBadge>
          </p>
        ) : null}
      </div>
    </a>
  );
}

export function ArticleCard({
  title,
  meta,
  href,
  iconKey,
}: {
  title: string;
  meta: string;
  href: string;
  index?: number;
  iconKey?: ContentUiIconKey;
}) {
  const resolved = iconKey ?? resolveContentUiIconFromText(`${title} ${meta}`);
  return (
    <a
      className="grid grid-cols-[52px_1fr] items-center gap-2.5 rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200/80 transition hover:bg-white hover:shadow-sm"
      href={href}
    >
      <ContentUiIcon iconKey={resolved} size={48} />
      <span className="min-w-0">
        <span className="block line-clamp-2 text-sm font-black leading-snug text-slate-950">{title}</span>
        <span className="mt-1 block line-clamp-1 text-xs font-medium text-slate-500">{meta}</span>
      </span>
    </a>
  );
}
