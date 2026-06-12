import Link from "next/link";
import { HUB_GUIDE, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

const DISCOVER_LINKS = [
  {
    id: "guides",
    title: "배터리 가이드",
    description: "점검·증상·불량·AS 안내",
    href: HUB_GUIDE,
  },
  {
    id: "stores",
    title: "직영점 안내",
    description: "덕천점·학장점·상담",
    href: HUB_STORE_DETAIL,
  },
] as const;

/** 라인업 하단 — 가이드·후기·지점 허브 (아이콘 메뉴와 역할 분리) */
export function HomeMainDiscoverStrip() {
  return (
    <section
      className="home-main-discover"
      data-home-section="discover"
      aria-label="추가 안내"
    >
      <div className="home-main-discover__grid">
        {DISCOVER_LINKS.map((item) => (
          <Link key={item.id} href={item.href} className="home-main-discover__card">
            <span className="home-main-discover__title">{item.title}</span>
            <span className="home-main-discover__desc">{item.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
