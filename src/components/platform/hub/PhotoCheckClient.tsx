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
import { CUSTOMER_CENTER_ORDER_GUIDE } from "@/lib/customer-center-routes";
import { HUB_SUPPORT } from "@/lib/customer-hub-routes";
import { HUB_PHOTO, HUB_STORE } from "@/lib/customer-hub-routes";
import { QNA_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import { resolveImageSlotAssetUrl } from "@/lib/media/resolve-asset-image";
import type { IconKey } from "@/lib/icon-map";

const PHOTO_STEP_HEADER_ICONS: IconKey[] = ["photoCheck", "photoLabel", "warning", "photoVerify"];

const WHY_PHOTO_POINTS = [
  { title: "단자 방향 L/R", body: "케이블·트레이와 맞지 않으면 장착이 어렵습니다." },
  { title: "AGM / 일반 타입", body: "ISG·스마트충전 차량은 타입 혼동이 위험합니다." },
  { title: "배터리 높이·고정 방식", body: "홀드다운·트레이 패턴이 다르면 맞지 않습니다." },
  { title: "기존 배터리 라벨", body: "규격 코드·제조일이 선명해야 확인이 빠릅니다." },
] as const;

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
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="왜 사진 확인이 필요한가" iconKey="help" />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {WHY_PHOTO_POINTS.map((p) => (
            <div key={p.title} className={`${bm.surfaceMuted} p-3`}>
              <p className="text-xs font-black text-slate-900">{p.title}</p>
              <p className="mt-1 text-[11px] font-medium text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader
          title="이렇게 찍어주세요"
          description="규격 코드와 단자 방향이 보이게 찍어주세요. 배터리 전체와 주변 고정쇠가 함께 나오면 확인이 빠릅니다."
          iconKey="photoVerify"
        />
        <div className="mt-3 max-w-md">
          <MediaImageSlot slot={labelSlot} src={labelSrc} className="max-h-[160px]" />
          <p className="mt-2 text-[11px] font-semibold text-slate-500">라벨·단자 확인 예시</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {goodExamples.map((card) => (
            <PhotoCheckExampleCard card={card} key={card.title} />
          ))}
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <SectionHeader title="좋은 사진 / 아쉬운 사진" iconKey="photoCheck" />
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {badExamples.map((card) => (
            <PhotoCheckExampleCard card={card} key={card.title} />
          ))}
        </div>
      </section>

      {PHOTO_CHECK_STEPS.slice(3).map((block) => (
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
        <SectionHeader title="상담·택배" description="사진과 차종 정보를 함께 보내 주시면 확인이 빠릅니다." iconKey="phone" />
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className={`${bm.btnNavy} inline-flex items-center gap-1.5 text-xs`} href="/vehicles">
            <AppIcon iconKey="vehicle" size="sm" className="!text-white" />
            차종 먼저 검색
          </Link>
          <Link className={`${bm.btnSecondary} inline-flex items-center gap-1.5 text-xs`} href={HUB_ORDER_CHECKLIST}>
            <AppIcon iconKey="checklist" size="sm" />
            주문 전 체크
          </Link>
          <Link className={`${bm.btnSecondary} inline-flex items-center gap-1.5 text-xs`} href={HUB_PHOTO}>
            <AppIcon iconKey="photoCheck" size="sm" />
            사진 안내
          </Link>
          <Link className={`${bm.btnTertiary} inline-flex items-center gap-1.5 text-xs`} href={HUB_STORE}>
            <AppIcon iconKey="store" size="sm" />
            매장·출장 상담
          </Link>
          <Link className={`${bm.btnTertiary} inline-flex items-center gap-1.5 text-xs`} href={CUSTOMER_CENTER_ORDER_GUIDE}>
            <AppIcon iconKey="checklist" size="sm" />
            주문 안내
          </Link>
          <Link className={`${bm.btnTertiary} inline-flex items-center gap-1.5 text-xs`} href={HUB_SUPPORT}>
            <AppIcon iconKey="qna" size="sm" />
            고객센터
          </Link>
        </div>
      </section>

      <PlatformHubLinks title="관련 안내" limit={4} />
    </div>
  );
}
