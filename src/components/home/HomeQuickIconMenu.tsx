import Image from "next/image";
import Link from "next/link";
import { HOME_QUICK_ICON_ITEMS } from "@/lib/home-quick-icons-data";

/** 혜택 아래 — 퀵 카테고리 아이콘 (8개, 별도 섹션 제목 없음) */
export function HomeQuickIconMenu() {
  return (
    <nav
      className="home-quick-icons"
      data-home-section="quick-icons"
      aria-label="주요 안내 바로가기"
    >
      <ul className="home-quick-icons__grid">
        {HOME_QUICK_ICON_ITEMS.map((item) => (
          <li key={item.id} className="home-quick-icons__item">
            <Link
              href={item.href}
              className="home-quick-icon-card"
              data-quick-accent={item.accent}
              data-quick-icon-variant={item.iconVariant ?? "default"}
            >
              <span className="home-quick-icon-card__icon-wrap home-quick-icon-card__icon-wrap--image" aria-hidden>
                <Image
                  src={item.imageSrc}
                  alt=""
                  width={72}
                  height={72}
                  className="home-quick-icon-card__image"
                  sizes="(max-width: 639px) 56px, 64px"
                />
              </span>
              <span className="home-quick-icon-card__text">
                <span className="home-quick-icon-card__title">{item.label}</span>
                <span className="home-quick-icon-card__desc">{item.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
