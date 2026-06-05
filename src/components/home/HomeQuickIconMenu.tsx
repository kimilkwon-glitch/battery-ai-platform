import Image from "next/image";
import Link from "next/link";
import { HOME_QUICK_ICON_ITEMS } from "@/lib/home-quick-icons-data";

function QuickIconTitle({ label, mobileLines }: { label: string; mobileLines?: [string, string] }) {
  if (!mobileLines) {
    return <span className="home-quick-icon-card__title">{label}</span>;
  }

  return (
    <span className="home-quick-icon-card__title">
      <span className="home-quick-icon-card__title-full">{label}</span>
      <span className="home-quick-icon-card__title-stacked" aria-hidden>
        {mobileLines.map((line) => (
          <span key={line} className="home-quick-icon-card__title-line">
            {line}
          </span>
        ))}
      </span>
    </span>
  );
}

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
          const isVehicle = item.iconVariant === "vehicle";
          return (
            <li key={item.id} className="home-quick-icons__item">
              <Link
                href={item.href}
                className="home-quick-icon-card"
                data-quick-accent={item.accent}
                data-quick-icon-variant={item.iconVariant ?? "default"}
              >
                <span className="home-quick-icon-card__icon-wrap" aria-hidden>
                  <span
                    className="home-quick-icon-card__icon-bg"
                    style={{ backgroundColor: item.chipBg }}
                  >
                    <Image
                      src={item.imageSrc}
                      alt=""
                      width={isVehicle ? 50 : 42}
                      height={isVehicle ? 50 : 42}
                      className="home-quick-icon-card__image"
                      sizes={isVehicle ? "(max-width: 639px) 46px, 50px" : "(max-width: 639px) 40px, 42px"}
                    />
                  </span>
                </span>
                <span className="home-quick-icon-card__text">
                  <QuickIconTitle label={item.label} mobileLines={item.titleMobileLines} />
                  <span className="home-quick-icon-card__title-accent" aria-hidden />
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
