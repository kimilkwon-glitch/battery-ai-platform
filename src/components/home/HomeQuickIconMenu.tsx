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
        {HOME_QUICK_ICON_ITEMS.map((item) => {
          const Icon = item.Icon;
          return (
            <li key={item.id} className="home-quick-icons__item">
              <Link
                href={item.href}
                className="home-quick-icon-card"
                data-quick-accent={item.accent}
              >
                <span className="home-quick-icon-card__icon-wrap" aria-hidden>
                  <Icon className="home-quick-icon-card__icon" strokeWidth={2.25} />
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
