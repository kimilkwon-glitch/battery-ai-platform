import Link from "next/link";
import { Quote, Star } from "lucide-react";
import {
  HOME_REPLACEMENT_REVIEWS_HREF,
  HOME_REPLACEMENT_STORIES_DESC,
  HOME_REPLACEMENT_STORIES_EYEBROW,
  HOME_REPLACEMENT_STORIES_LABEL,
  HOME_REPLACEMENT_STORIES_PILLS,
  HOME_REPLACEMENT_STORIES_TITLE,
  HOME_REPLACEMENT_STORIES_VISIBLE_COUNT,
  HOME_REPLACEMENT_STORY_CARDS,
  HOME_REPLACEMENT_WORK_CASES_HREF,
  type HomeReplacementStoryCard,
} from "@/lib/home-replacement-stories-data";

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

function StoryCard({ card }: { card: HomeReplacementStoryCard }) {
  return (
    <li className="home-trust-story-card">
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
    </li>
  );
}

function StoryActions({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Link
        href={HOME_REPLACEMENT_REVIEWS_HREF}
        className="home-replacement-stories__btn home-replacement-stories__btn--primary"
      >
        후기 더보기
      </Link>
      <Link
        href={HOME_REPLACEMENT_WORK_CASES_HREF}
        className="home-replacement-stories__btn home-replacement-stories__btn--secondary"
        target="_blank"
        rel="noopener noreferrer"
      >
        작업 사례 보기
      </Link>
    </div>
  );
}

/** 메인 — 실제 교체 후기·작업 사례 (라인업 아래, 타이어픽형 신뢰 카드) */
export function HomeReplacementStoriesSection() {
  const visibleCards = HOME_REPLACEMENT_STORY_CARDS.slice(0, HOME_REPLACEMENT_STORIES_VISIBLE_COUNT);

  return (
    <section
      className="home-replacement-stories"
      data-home-section="replacement-stories"
      aria-labelledby="home-replacement-stories-title"
    >
      <div className="home-replacement-stories__layout">
        <div className="home-replacement-stories__intro">
          <div className="home-replacement-stories__intro-card">
            <div className="home-replacement-stories__intro-inner">
              <p className="home-replacement-stories__eyebrow">
                <Quote className="home-replacement-stories__eyebrow-icon" strokeWidth={2.25} aria-hidden />
                <span>{HOME_REPLACEMENT_STORIES_EYEBROW}</span>
              </p>
              <p className="home-replacement-stories__label">{HOME_REPLACEMENT_STORIES_LABEL}</p>
              <h2 id="home-replacement-stories-title" className="home-replacement-stories__title">
                {HOME_REPLACEMENT_STORIES_TITLE}
              </h2>
              <p className="home-replacement-stories__desc">{HOME_REPLACEMENT_STORIES_DESC}</p>
              <ul className="home-replacement-stories__pills" aria-label="후기 유형">
                {HOME_REPLACEMENT_STORIES_PILLS.map((pill) => (
                  <li key={pill}>{pill}</li>
                ))}
              </ul>
              <StoryActions className="home-replacement-stories__actions home-replacement-stories__actions--desktop" />
            </div>
          </div>
        </div>

        <div className="home-replacement-stories__cards-wrap">
          <div className="home-replacement-stories__scroller" aria-label="교체 후기 카드">
            <ul className="home-replacement-stories__list">
              {visibleCards.map((card) => (
                <StoryCard key={card.id} card={card} />
              ))}
            </ul>
          </div>
        </div>

        <StoryActions className="home-replacement-stories__actions home-replacement-stories__actions--mobile" />
      </div>
    </section>
  );
}
