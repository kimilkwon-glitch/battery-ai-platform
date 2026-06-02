/** 메인 히어로 배경 장식 — 콘텐츠 가독성을 해치지 않는 정적·미세 모션 레이어 */
export function HomeHeroBackdrop() {
  return (
    <div className="home-hero-backdrop" aria-hidden>
      <div className="home-hero-backdrop__base" />
      <div className="home-hero-backdrop__grid" />
      <div className="home-hero-backdrop__glow home-hero-backdrop__glow--a" />
      <div className="home-hero-backdrop__glow home-hero-backdrop__glow--b" />
      <div className="home-hero-backdrop__glow home-hero-backdrop__glow--c" />
      <div className="home-hero-backdrop__arc" />
      <div className="home-hero-backdrop__decor">
        <div className="home-hero-decor-card home-hero-decor-card--vehicle">
          <span className="home-hero-decor-card__badge">차종</span>
          <span className="home-hero-decor-card__title">그랜저 IG</span>
          <span className="home-hero-decor-card__meta">가솔린 · 2016~2019</span>
        </div>
        <div className="home-hero-decor-card home-hero-decor-card--spec">
          <span className="home-hero-decor-card__badge">규격</span>
          <span className="home-hero-decor-card__title">AGM80L</span>
          <span className="home-hero-decor-card__meta">ISG · L타입</span>
        </div>
        <div className="home-hero-decor-card home-hero-decor-card--data">
          <span className="home-hero-decor-card__badge">데이터</span>
          <span className="home-hero-decor-card__title">적용 후보</span>
          <span className="home-hero-decor-card__meta">연식·연료 매칭</span>
        </div>
      </div>
    </div>
  );
}
