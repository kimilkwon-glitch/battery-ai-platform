"use client";

import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { SectionHeader } from "@/components/common/SectionHeader";
import { PlatformHubLinks } from "@/components/platform/hub/PlatformHubLinks";
import { PhotoCheckExampleCard } from "@/components/platform/hub/PhotoCheckExampleCard";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { bm } from "@/lib/design-tokens";
import { PHOTO_CHECK_EXAMPLES, PHOTO_CHECK_STEPS } from "@/lib/platform-hub-content";
import { HUB_ORDER_CHECKLIST } from "@/lib/platform-hub-routes";
import { HUB_STORE } from "@/lib/customer-hub-routes";
import { QNA_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import { resolveImageSlotAssetUrl } from "@/lib/media/resolve-asset-image";
import type { IconKey } from "@/lib/icon-map";

const PHOTO_STEP_HEADER_ICONS: IconKey[] = ["photoCheck", "photoLabel", "warning", "photoVerify"];

export function PhotoCheckClient() {
  const labelSlot = QNA_IMAGE_SLOTS.labelCheck();
  const labelSrc = resolveImageSlotAssetUrl(labelSlot);
  const goodExamples = PHOTO_CHECK_EXAMPLES.filter((c) => c.kind === "good");
  const badExamples = PHOTO_CHECK_EXAMPLES.filter((c) => c.kind === "bad");

  return (
    <div className={`${bm.hubPhoto} overflow-x-hidden`} data-page="photo-check">
      <section className={`${bm.reportCard} ${bm.cardPad}`}>
        <p className={bm.intentBadge}>보조 확인</p>
        <SectionHeader
          title="규격이 헷갈릴 때는 사진으로 한 번 더 확인하는 것이 안전합니다"
          description="차종·규격 검색으로 후보를 본 뒤, 라벨·단자·장착 위치를 함께 보면 오주문을 줄일 수 있습니다."
          iconKey="photoCheck"
        />
        <p className={`${bm.alertInfo} mt-3`}>
          포터2, 하이브리드, EV 보조배터리처럼 연식·연료에 따라 갈리는 경우에 특히 도움이 됩니다.
        </p>
        <div className="mt-4 max-w-md">
          <MediaImageSlot slot={labelSlot} src={labelSrc} className="max-h-[160px]" />
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader
          title="이렇게 찍으면 확인이 빠릅니다"
          description="규격 코드·단자 방향·트레이가 보이면 됩니다."
          iconKey="photoVerify"
        />
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {goodExamples.map((card) => (
            <PhotoCheckExampleCard card={card} key={card.title} />
          ))}
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader
          title="이렇게 찍히면 다시 보내 주세요"
          description="라벨·단자가 가리거나 흐리면 규격 확인이 어렵습니다."
          iconKey="warning"
        />
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {badExamples.map((card) => (
            <PhotoCheckExampleCard card={card} key={card.title} />
          ))}
        </div>
      </section>

      {PHOTO_CHECK_STEPS.map((block) => (
        <section className={`${bm.card} ${bm.cardPad}`} key={block.step}>
          <SectionHeader
            title={block.title}
            iconKey={PHOTO_STEP_HEADER_ICONS[block.step - 1] ?? "photoCheck"}
          />
          <ul className="mt-3 list-none space-y-2 p-0">
            {block.items.map((item, idx) => (
              <li className={`${bm.stepItem} text-xs font-medium leading-relaxed text-slate-700`} key={item}>
                <span className={bm.stepNum}>{idx + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {block.note ? (
            <p className="mt-3 text-xs font-semibold text-[var(--bm-primary)]">{block.note}</p>
          ) : null}
        </section>
      ))}

      <section className={bm.platformStrip}>
        <SectionHeader title="문의·상담" description="사진을 준비해 주시면 확인이 빠릅니다." iconKey="phone" />
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className={`${bm.btnNavy} inline-flex items-center gap-1.5 text-xs`} href="/search?q=AGM80L">
            <AppIcon iconKey="search" size="sm" className="!text-white" />
            차종 먼저 검색
          </Link>
          <Link className={`${bm.btnSecondary} inline-flex items-center gap-1.5 text-xs`} href="/compare">
            <AppIcon iconKey="compare" size="sm" />
            규격 비교 보기
          </Link>
          <Link className={`${bm.btnGhost} inline-flex items-center gap-1.5 text-xs`} href={HUB_STORE}>
            <AppIcon iconKey="store" size="sm" />
            매장·출장 문의
          </Link>
          <Link className={`${bm.btnGhost} inline-flex items-center gap-1.5 text-xs`} href={HUB_ORDER_CHECKLIST}>
            <AppIcon iconKey="checklist" size="sm" />
            주문 전 체크리스트
          </Link>
        </div>
      </section>

      <PlatformHubLinks title="관련 안내" limit={4} />
    </div>
  );
}
