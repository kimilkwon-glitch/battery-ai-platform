import Link from "next/link";
import { BatteryMiniSpecLink } from "@/components/battery/BatteryMiniSpecLink";
import { BatteryContentThumb } from "@/components/BatteryThumbnail";
import { ContentCoverImage } from "@/components/content/ContentCoverImage";
import { bm } from "@/lib/design-tokens";
import {
  formatArticleDate,
  getGuideCategoryShortLabel,
  type Article,
} from "@/lib/content";
import { resolveContentCoverImage } from "@/lib/content/getContentImage";
import { resolveBatteryImageSetForCode } from "@/lib/batteryImages";
import { getVehicleAsset } from "@/lib/car-assets";

function GuideCardImage({ article }: { article: Article }) {
  const contentCover = resolveContentCoverImage(article.id);
  const primaryBattery = article.batteryIds[0];
  const imageSet = primaryBattery ? resolveBatteryImageSetForCode(primaryBattery) : undefined;
  const vehicleImg = article.vehicleIds[0] ? getVehicleAsset(article.vehicleIds[0])?.image : undefined;

  if (contentCover.showHero && contentCover.imagePath) {
    return (
      <ContentCoverImage
        contentId={article.id}
        objectFit="contain"
        title={article.title}
        variant="card"
      />
    );
  }

  if (contentCover.showHero && contentCover.imageNeeded) {
    return (
      <ContentCoverImage
        contentId={article.id}
        objectFit="contain"
        title={article.title}
        variant="card"
      />
    );
  }

  return (
    <div className={`${bm.imageBattery} !h-[120px] rounded-none rounded-t-2xl`}>
      {primaryBattery ? (
        <BatteryContentThumb
          code={primaryBattery}
          fit="contain"
          imageSet={imageSet}
          role="main"
        />
      ) : vehicleImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={article.title}
          className="max-h-full max-w-[90%] object-contain object-center"
          src={vehicleImg}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center px-3 text-center">
          <p className="text-[10px] font-bold text-slate-500">{getGuideCategoryShortLabel(article.category)}</p>
          <p className="mt-1 text-[10px] font-medium text-slate-400">관련 이미지 연결</p>
        </div>
      )}
    </div>
  );
}

export function GuideCard({ article }: { article: Article }) {
  return (
    <article className={`flex h-full flex-col overflow-hidden ${bm.cardInteractive}`}>
      <GuideCardImage article={article} />
      <div className={`flex flex-1 flex-col ${bm.cardPad} pt-3`}>
        <h3 className="line-clamp-2 text-sm font-black leading-snug text-slate-950">{article.title}</h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-[11px] font-semibold leading-relaxed text-[var(--bm-muted)]">
          {article.description}
        </p>
        <p className="mt-2 text-[10px] font-medium text-slate-500">
          {getGuideCategoryShortLabel(article.category)}
          {article.vehicleIds[0]
            ? ` · ${getVehicleAsset(article.vehicleIds[0])?.displayName ?? article.vehicleIds[0]}`
            : ""}
        </p>
        {article.batteryIds.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {article.batteryIds.slice(0, 3).map((c) => (
              <BatteryMiniSpecLink key={c} code={c} compact />
            ))}
          </div>
        ) : null}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <span className="text-[10px] font-semibold text-slate-400">{formatArticleDate(article.updatedAt)}</span>
          <Link className={`${bm.btnPrimary} !h-9 !px-3 !text-[10px]`} href={`/guides/${article.id}`}>
            자세히 보기
          </Link>
        </div>
      </div>
    </article>
  );
}
