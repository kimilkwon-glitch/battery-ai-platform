"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/common/SectionHeader";
import { PlatformHubLinks } from "@/components/platform/hub/PlatformHubLinks";
import { PhotoCheckExampleCard } from "@/components/platform/hub/PhotoCheckExampleCard";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { bm } from "@/lib/design-tokens";
import { PHOTO_CHECK_EXAMPLES, PHOTO_CHECK_STEPS } from "@/lib/platform-hub-content";
import { HUB_ORDER_CHECKLIST } from "@/lib/platform-hub-routes";
import { HUB_PHOTO, HUB_STORE } from "@/lib/customer-hub-routes";
import { QNA_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import { resolveImageSlotAssetUrl } from "@/lib/media/resolve-asset-image";

export function PhotoCheckClient() {
  const labelSlot = QNA_IMAGE_SLOTS.labelCheck();
  const labelSrc = resolveImageSlotAssetUrl(labelSlot);
  const goodExamples = PHOTO_CHECK_EXAMPLES.filter((c) => c.kind === "good");
  const badExamples = PHOTO_CHECK_EXAMPLES.filter((c) => c.kind === "bad");

  return (
    <div className="space-y-5 overflow-x-hidden" data-page="photo-check">
      <section className={`${bm.reportCard} ${bm.cardPad}`}>
        <p className={bm.intentBadge}>보조 검증</p>
        <SectionHeader
          title="사진 확인 안내"
          description="사진확인은 메인 답변이 아닙니다. DB·차종 검색 후 최종 검증용으로 사용하세요."
        />
        <p className="mt-3 text-xs font-semibold leading-relaxed text-[var(--bm-primary)]">
          사진확인은 메인 답변이 아니라 보조 검증입니다. 차종·연식·연료 확인과 함께 쓰세요.
        </p>
        <div className="mt-4 max-w-md">
          <MediaImageSlot slot={labelSlot} src={labelSrc} className="max-h-[160px]" />
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader
          title="좋은 사진 예시"
          description="아래 항목이 보이면 규격·단자 확인이 빨라집니다."
        />
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {goodExamples.map((card) => (
            <PhotoCheckExampleCard card={card} key={card.title} />
          ))}
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader
          title="피해야 할 사진"
          description="아래처럼 찍히면 재촬영을 요청할 수 있습니다."
        />
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {badExamples.map((card) => (
            <PhotoCheckExampleCard card={card} key={card.title} />
          ))}
        </div>
      </section>

      {PHOTO_CHECK_STEPS.map((block) => (
        <section className={`${bm.card} ${bm.cardPad}`} key={block.step}>
          <SectionHeader title={block.title} />
          <ul className="mt-3 list-none space-y-2 p-0">
            {block.items.map((item) => (
              <li
                className={`${bm.surfaceMuted} rounded-xl px-3 py-2.5 text-xs font-medium leading-relaxed text-slate-700`}
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
          {block.note ? (
            <p className="mt-3 text-xs font-semibold text-[var(--bm-primary)]">{block.note}</p>
          ) : null}
        </section>
      ))}

      <section className={bm.platformStrip}>
        <SectionHeader title="문의·상담" description="사진 준비 후 연락하면 확인이 빠릅니다." />
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className={`${bm.btnNavy} text-xs`} href={HUB_PHOTO}>
            사진 분석 페이지
          </Link>
          <Link className={`${bm.btnSecondary} text-xs`} href={HUB_STORE}>
            매장·출장 문의
          </Link>
          <Link className={`${bm.btnGhost} text-xs`} href={HUB_ORDER_CHECKLIST}>
            오주문 체크리스트
          </Link>
        </div>
      </section>

      <PlatformHubLinks title="다음 허브" limit={4} />
    </div>
  );
}
