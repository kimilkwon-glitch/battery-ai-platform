"use client";

import {
  BookOpen,
  Camera,
  MapPin,
  MessageCircle,
  PlayCircle,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import {
  OFFICIAL_CHANNELS,
  OFFICIAL_CHANNELS_SUBTITLE,
  OFFICIAL_CHANNELS_TITLE,
  storeChannelLinks,
  type OfficialChannel,
  type OfficialChannelId,
} from "@/lib/official-channels";
import type { StoreLinkKey } from "@/lib/external-links";

const CHANNEL_ICONS: Record<OfficialChannelId, LucideIcon> = {
  naver_place: MapPin,
  naver_blog: BookOpen,
  naver_smartstore: ShoppingBag,
  daangn: MessageCircle,
  instagram: Camera,
  youtube: PlayCircle,
};

function ChannelPill({ channel, compact }: { channel: OfficialChannel; compact?: boolean }) {
  const Icon = CHANNEL_ICONS[channel.id];
  const isReady = channel.status === "active" && channel.href;
  const comingLabel =
    channel.id === "instagram" || channel.id === "youtube" ? "예정" : "준비중";

  const inner = (
    <>
      <Icon className="size-3 shrink-0 opacity-70" aria-hidden />
      <span>{compact ? channel.shortLabel : channel.label}</span>
      {!isReady ? (
        <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
          {comingLabel}
        </span>
      ) : null}
    </>
  );

  const className = clsx(
    "official-channel-pill inline-flex shrink-0 items-center gap-1.5 rounded-full border font-bold transition",
    compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]",
    isReady
      ? "border-slate-200/90 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      : "cursor-default border-slate-100 bg-slate-50/90 text-slate-500 opacity-55",
  );

  if (isReady && channel.href) {
    return (
      <a
        href={channel.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }

  return (
    <span className={className} aria-disabled="true" title={`${channel.label} ${comingLabel}`}>
      {inner}
    </span>
  );
}

/** 메인·매장·푸터 공통 공식 운영 채널 UI */
export function OfficialChannelsStrip({
  variant = "home",
  className = "",
  title = OFFICIAL_CHANNELS_TITLE,
  subtitle,
  channels = OFFICIAL_CHANNELS,
}: {
  variant?: "home" | "section" | "footer";
  className?: string;
  title?: string;
  subtitle?: string;
  channels?: OfficialChannel[];
}) {
  if (variant === "footer") {
    return (
      <div className={clsx("official-channels-footer", className)}>
        <p className="text-[10px] font-black text-slate-500">{title}</p>
        <p className="mt-1.5 flex flex-wrap gap-x-1 gap-y-0.5 text-[10px] font-semibold text-slate-500">
          {channels.map((ch, i) => {
            const ready = ch.status === "active" && ch.href;
            const suffix =
              ch.status === "coming_soon"
                ? ch.id === "instagram" || ch.id === "youtube"
                  ? " 예정"
                  : " 준비중"
                : "";
            return (
              <span key={ch.id} className="inline-flex items-center">
                {i > 0 ? <span className="mx-0.5 text-slate-300">·</span> : null}
                {ready && ch.href ? (
                  <a
                    href={ch.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--bm-primary)] hover:underline"
                  >
                    {ch.label}
                  </a>
                ) : (
                  <span className="text-slate-400">
                    {ch.label}
                    {suffix}
                  </span>
                )}
              </span>
            );
          })}
        </p>
      </div>
    );
  }

  const isHome = variant === "home";

  return (
    <section
      className={clsx(
        "official-channels-strip",
        isHome ? "mt-10 sm:mt-12" : "mt-6",
        className,
      )}
      data-section="official-channels"
      aria-label={title}
    >
      <div className={clsx(isHome ? "text-center" : "text-left")}>
        <h2
          className={clsx(
            "font-black text-slate-800",
            isHome ? "text-[11px] tracking-wide text-slate-500 uppercase" : "text-sm text-slate-900",
          )}
        >
          {title}
        </h2>
        {subtitle !== undefined ? (
          <p
            className={clsx(
              "font-medium text-slate-500",
              isHome ? "mt-1 text-[11px]" : "mt-1 text-xs",
            )}
          >
            {subtitle}
          </p>
        ) : isHome ? (
          <p className="mt-1 text-[11px] font-medium text-slate-500">{OFFICIAL_CHANNELS_SUBTITLE}</p>
        ) : (
          <p className="mt-1 text-xs font-medium text-slate-500">{OFFICIAL_CHANNELS_SUBTITLE}</p>
        )}
      </div>

      <div
        className={clsx(
          "mt-3 flex gap-2",
          isHome
            ? "home-official-channels-scroll -mx-1 flex-nowrap overflow-x-auto px-1 pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible"
            : "flex-wrap",
        )}
      >
        {channels.map((ch) => (
          <ChannelPill key={ch.id} channel={ch} compact={isHome} />
        ))}
      </div>
    </section>
  );
}

/** 지점 카드용 — 플레이스·블로그·당근 (공식채널과 분리) */
export function StoreOfficialChannelLinks({
  storeId,
  className = "",
}: {
  storeId: StoreLinkKey;
  className?: string;
}) {
  const channels = storeChannelLinks(storeId);

  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      {channels.map((ch) => {
        const Icon = CHANNEL_ICONS[ch.id];
        const label =
          ch.id === "naver_place"
            ? "네이버 플레이스"
            : ch.id === "naver_blog"
              ? "블로그"
              : "당근";
        return (
          <a
            key={ch.id}
            href={ch.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-slate-700 hover:border-slate-300 hover:shadow-sm"
          >
            <Icon className="size-3.5 opacity-70" aria-hidden />
            {label}
          </a>
        );
      })}
    </div>
  );
}
