import Link from "next/link";
import { Star } from "lucide-react";
import type { HomeReplacementStoryCard } from "@/lib/home-replacement-stories-data";

function StoryStars({ rating }: { rating: number }) {
  return (
    <div className="home-trust-story-card__stars" aria-label={`${rating}점`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating ? "home-trust-story-card__star home-trust-story-card__star--on" : "home-trust-story-card__star"
          }
          strokeWidth={2}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function HomeTrustStoryCard({ card }: { card: HomeReplacementStoryCard }) {
  return (
    <article className="home-trust-story-card__inner">
      <header className="home-trust-story-card__head">
        <p className="home-trust-story-card__customer">
          <span>{card.authorLabel}</span>
          <span className="home-trust-story-card__customer-sep" aria-hidden>
            ·
          </span>
          <span>{card.vehicleLabel}</span>
        </p>
        <StoryStars rating={card.rating} />
      </header>

      <p className="home-trust-story-card__quote">&ldquo;{card.quote}&rdquo;</p>

      <ul className="home-trust-story-card__badges" aria-label="후기 장점">
        {card.badges.map((badge) => (
          <li key={badge}>{badge}</li>
        ))}
      </ul>

      <div className="home-trust-story-card__work" aria-label="작업 정보">
        <p className="home-trust-story-card__work-line home-trust-story-card__work-line--place">
          {card.workInfo.placeLine}
        </p>
        <p className="home-trust-story-card__work-line">{card.workInfo.vehicleLine}</p>
        <p className="home-trust-story-card__work-line home-trust-story-card__work-line--battery">
          {card.workInfo.batteryLine}
        </p>
        <p className="home-trust-story-card__work-line home-trust-story-card__work-line--services">
          {card.workInfo.servicesLine}
        </p>
      </div>

      <Link href={card.href} className="home-trust-story-card__more">
        후기 자세히 보기
      </Link>
    </article>
  );
}
