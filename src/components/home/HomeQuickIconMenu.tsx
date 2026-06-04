import Link from "next/link";
import { HOME_QUICK_ICON_ITEMS } from "@/lib/home-quick-icons-data";

/** 검색 아래 — 사이트 주요 가이드·Q&A·지점 허브 (8개) */
export function HomeQuickIconMenu() {
  return (
    <nav
      className="home-quick-icons"
      data-home-section="quick-icons"
      aria-label="빠른 메뉴"
    >
      <ul className="home-quick-icons__grid">
        {HOME_QUICK_ICON_ITEMS.map((item) => {
          const Icon = item.Icon;
          return (
            <li key={item.id} className="home-quick-icons__item">
              <Link
                href={item.href}
                className={`home-quick-icon-card home-quick-icon-card--${item.accent}`}
              >
                <span className="home-quick-icon-card__icon-wrap" aria-hidden>
                  <Icon className="home-quick-icon-card__icon" strokeWidth={2} />
                </span>
                <span className="home-quick-icon-card__text">
                  <span className="home-quick-icon-card__title">{item.label}</span>
                  <span className="home-quick-icon-card__desc">{item.description}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
