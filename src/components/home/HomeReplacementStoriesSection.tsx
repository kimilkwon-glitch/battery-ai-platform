import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import {
  HOME_REPLACEMENT_REVIEWS_HREF,
  HOME_REPLACEMENT_STORIES_DESC,
  HOME_REPLACEMENT_STORIES_TITLE,
  HOME_REPLACEMENT_STORY_CARDS,
  HOME_REPLACEMENT_WORK_CASES_HREF,
  type HomeReplacementStoryCard,
} from "@/lib/home-replacement-stories-data";

function StoryStars({ rating }: { rating: number }) {
  return (
    <div className="home-story-card__stars" aria-label={`${rating}점`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < rating ? "home-story-card__star home-story-card__star--on" : "home-story-card__star"}
          strokeWidth={2}
          aria-hidden
        />
      ))}
    </div>
  );
}

function StoryCard({ card }: { card: HomeReplacementStoryCard }) {
  return (
    <li className="home-story-card">
      <article className="home-story-card__inner">
        <div className="home-story-card__main">
          <div className="home-story-card__head">
            <p className="home-story-card__meta">
              <span>{card.authorLabel}</span>
              <span className="home-story-card__meta-sep" aria-hidden>
                ·
              </span>
              <span>{card.placeLabel}</span>
            </p>
            <StoryStars rating={card.rating} />
          </div>
          <p className="home-story-card__quote">&ldquo;{card.quote}&rdquo;</p>
          <dl className="home-story-card__facts">
            {card.vehicle ? (
              <div className="home-story-card__fact">
                <dt>차량</dt>
                <dd>{card.vehicle}</dd>
              </div>
            ) : null}
            {card.battery ? (
              <div className="home-story-card__fact">
                <dt>배터리</dt>
                <dd>{card.battery}</dd>
              </div>
            ) : null}
            <div className="home-story-card__fact">
              <dt>방식</dt>
              <dd>{card.serviceLabel}</dd>
            </div>
          </dl>
          <Link href={card.href} className="home-story-card__link">
            후기 보기 →
          </Link>
        </div>
        {card.imageSrc ? (
          <div className="home-story-card__thumb">
            <Image
              src={card.imageSrc}
              alt={card.imageAlt ?? "교체 후기"}
              width={88}
              height={88}
              className="home-story-card__thumb-img"
              sizes="88px"
            />
          </div>
        ) : null}
      </article>
    </li>
  );
}

/** 메인 — 실제 교체 후기·작업 사례 (라인업 아래) */
export function HomeReplacementStoriesSection() {
  return (
    <section
      className="home-replacement-stories"
      data-home-section="replacement-stories"
      aria-labelledby="home-replacement-stories-title"
    >
      <div className="home-replacement-stories__layout">
        <div className="home-replacement-stories__intro">
          <h2 id="home-replacement-stories-title" className="home-replacement-stories__title">
            {HOME_REPLACEMENT_STORIES_TITLE}
          </h2>
          <p className="home-replacement-stories__desc">{HOME_REPLACEMENT_STORIES_DESC}</p>
          <div className="home-replacement-stories__actions">
            <Link href={HOME_REPLACEMENT_REVIEWS_HREF} className="home-replacement-stories__btn home-replacement-stories__btn--primary">
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
        </div>
        <ul className="home-replacement-stories__list">
          {HOME_REPLACEMENT_STORY_CARDS.map((card) => (
            <StoryCard key={card.id} card={card} />
          ))}
        </ul>
      </div>
    </section>
  );
}
