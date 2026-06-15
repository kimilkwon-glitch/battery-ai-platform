import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { GuidePost } from "@/data/battery-guide-posts";
import { GUIDE_POST_CATEGORY_META } from "@/data/battery-guide-posts";

type Props = {
  post: GuidePost;
  className?: string;
};

function BatteryGuideCardMedia({ post }: { post: GuidePost }) {
  if (post.thumbnail) {
    return (
      <div className="battery-guide-card__media">
        <Image
          src={post.thumbnail}
          alt=""
          fill
          className="battery-guide-card__img object-cover"
          sizes="(max-width: 639px) 88vw, 50vw"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`battery-guide-card__media battery-guide-card__media--placeholder battery-guide-card__media--${post.category}`}
      aria-hidden
    >
      <span className="battery-guide-card__placeholder-label">
        {GUIDE_POST_CATEGORY_META[post.category].label}
      </span>
    </div>
  );
}

export function BatteryGuideCard({ post, className }: Props) {
  return (
    <Link
      href={`/guide/battery/${post.id}`}
      className={`battery-guide-card group ${className ?? ""}`.trim()}
      aria-label={`${post.title} 자세히 보기`}
    >
      <BatteryGuideCardMedia post={post} />
      <div className="battery-guide-card__body">
        <h3 className="battery-guide-card__title">{post.title}</h3>
        <p className="battery-guide-card__summary">{post.summary}</p>
        <span className="battery-guide-card__cta">
          자세히 보기
          <ChevronRight className="battery-guide-card__cta-icon" strokeWidth={2.5} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
