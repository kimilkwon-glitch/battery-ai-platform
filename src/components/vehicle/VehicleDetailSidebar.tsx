import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { BatteryMiniThumb } from "@/components/BatteryThumbnail";
import { resolveBatteryImageSetForCode } from "@/lib/batteryImages";
import { getArticlesByVehicleId } from "@/lib/content";
import type { FuelBatteryGroup } from "@/lib/vehicleBattery";
import type { IconKey } from "@/lib/icon-map";
import { bm } from "@/lib/design-tokens";

type RelatedVehicle = { slug: string; title: string; battery: string };

export function VehicleDetailSidebar({
  slug,
  fuelGroups,
  relatedFromDb,
  relatedFromCatalog,
  hideBatteryLinks = false,
}: {
  slug: string;
  fuelGroups: FuelBatteryGroup[];
  relatedFromDb: RelatedVehicle[];
  relatedFromCatalog: { slug: string; model: string; battery: string; tag: string }[];
  hideBatteryLinks?: boolean;
}) {
  const recommendedBatteries = [...new Set(fuelGroups.map((g) => g.primaryBattery).filter(Boolean))].slice(0, 3);

  const guides = getArticlesByVehicleId(slug).slice(0, 4);

  const relatedMap = new Map<string, RelatedVehicle>();
  for (const v of relatedFromDb) relatedMap.set(v.slug, v);
  for (const v of relatedFromCatalog) {
    if (!relatedMap.has(v.slug)) {
      relatedMap.set(v.slug, { slug: v.slug, title: v.model, battery: v.battery });
    }
  }
  const relatedVehicles = [...relatedMap.values()].slice(0, 4);

  const multiFuel = fuelGroups.length > 1;

  return (
    <aside className="space-y-3 lg:sticky lg:top-[72px] lg:self-start">
      {!hideBatteryLinks ? (
        <SidebarPanel iconKey="batterySpec" title={multiFuel ? "규격 바로가기" : "이 차량 추천 배터리"}>
          {recommendedBatteries.length === 0 ? (
            <p className="text-xs font-semibold text-slate-500">상단 연료별 카드에서 확인하세요.</p>
          ) : multiFuel ? (
            <ul className="space-y-1.5">
              {recommendedBatteries.map((code) => (
                <li key={code}>
                  <Link
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[var(--bm-primary)] hover:underline"
                    href={`/batteries/${encodeURIComponent(code)}`}
                  >
                    <AppIcon iconKey="batterySpec" size="xs" />
                    {code} 규격 상세 →
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-2">
              {recommendedBatteries.map((code) => (
                <Link
                  key={code}
                  className={`flex items-center gap-3 ${bm.cardPad} rounded-xl bg-slate-50/80 transition hover:border-[var(--bm-primary)] ring-1 ring-[var(--bm-border)]`}
                  href={`/batteries/${encodeURIComponent(code)}`}
                >
                  <BatteryMiniThumb
                    className="h-14 w-[72px] shrink-0"
                    code={code}
                    imageSet={resolveBatteryImageSetForCode(code)}
                  />
                  <span className="inline-flex items-center gap-1.5 text-sm font-black text-slate-900">
                    <AppIcon iconKey="battery" size="sm" />
                    {code}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </SidebarPanel>
      ) : (
        <SidebarPanel iconKey="batterySpec" title="배터리 확인">
          <p className="text-xs font-semibold text-slate-500">
            연료별 배터리 카드는 본문 상단에서 확인하세요.
          </p>
        </SidebarPanel>
      )}

      <SidebarPanel iconKey="guide" title="관련 가이드">
        {guides.length === 0 ? (
          <Link
            className="inline-flex items-center gap-1.5 text-xs font-black text-[var(--bm-primary)] hover:underline"
            href="/guides"
          >
            <AppIcon iconKey="guide" size="xs" />
            전체 가이드 보기 →
          </Link>
        ) : (
          <ul className="space-y-2">
            {guides.map((g) => (
              <li key={g.id}>
                <Link
                  className={`block ${bm.cardPad} rounded-lg text-xs font-bold leading-snug text-slate-800 transition hover:bg-blue-50 ring-1 ring-[var(--bm-border)]`}
                  href={`/guides/${g.id}`}
                >
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SidebarPanel>

      <SidebarPanel iconKey="vehicle" title="관련 차량">
        {relatedVehicles.length === 0 ? (
          <p className="text-xs font-semibold text-slate-500">관련 차량 정보 준비 중</p>
        ) : (
          <div className="space-y-2">
            {relatedVehicles.map((v) => (
              <Link
                key={v.slug}
                className={`block ${bm.cardPad} rounded-lg transition hover:bg-blue-50 ring-1 ring-[var(--bm-border)]`}
                href={`/vehicle/${v.slug}`}
              >
                <p className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                  <AppIcon iconKey="vehicle" size="xs" />
                  {v.title}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-[var(--bm-primary)]">
                  <AppIcon iconKey="batterySpec" size="xs" />
                  {v.battery}
                </p>
              </Link>
            ))}
          </div>
        )}
      </SidebarPanel>
    </aside>
  );
}

function SidebarPanel({
  title,
  children,
  iconKey,
}: {
  title: string;
  children: React.ReactNode;
  iconKey?: IconKey;
}) {
  return (
    <section className={`${bm.card} ${bm.cardPad}`}>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950">
        {iconKey ? (
          <span className="bm-icon-pill shrink-0" aria-hidden>
            <AppIcon iconKey={iconKey} size="sm" />
          </span>
        ) : null}
        <span>{title}</span>
      </h2>
      {children}
    </section>
  );
}
