import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/portal";
import { PageShell } from "@/components/common/PageShell";
import { BatteryMiniSpecLink } from "@/components/battery/BatteryMiniSpecLink";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { bm } from "@/lib/design-tokens";
import { HUB_PHOTO, HUB_STORE } from "@/lib/customer-hub-routes";
import { getQuestionById, getQuestionsForBattery, getQuestionsForVehicle } from "@/lib/qna";
import { QNA_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import {
  guideHref,
  searchHref,
  vehicleHref,
  type Question,
} from "@/lib/platform-data";
import { normalizeBatteryCode } from "@/lib/batteryNormalize";

export const dynamic = "force-dynamic";

function relatedQuestionsFor(q: Question): Question[] {
  const pool = new Map<string, Question>();
  if (q.batteryCode) {
    for (const item of getQuestionsForBattery(q.batteryCode, 6)) {
      if (item.id !== q.id) pool.set(item.id, item);
    }
  }
  if (q.vehicleId) {
    for (const item of getQuestionsForVehicle(q.vehicleId, 6)) {
      if (item.id !== q.id) pool.set(item.id, item);
    }
  }
  return [...pool.values()].slice(0, 4);
}

function imageSlotForQuestion(q: Question) {
  if (/블랙박스|방전|암전류/.test(q.title)) return QNA_IMAGE_SLOTS.blackboxCheck();
  if (/단자|L\/R|80R/.test(q.title)) return QNA_IMAGE_SLOTS.terminalDirection();
  if (/하이브리드|EV|12V|보조/.test(q.title)) return QNA_IMAGE_SLOTS.hybridAuxLocation();
  if (/포터|90R|100R/.test(q.title)) return QNA_IMAGE_SLOTS.porterInstall();
  if (/라벨|CMF|제조/.test(q.title)) return QNA_IMAGE_SLOTS.labelCheck();
  return QNA_IMAGE_SLOTS.labelCheck();
}

export default async function CommunityQuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = getQuestionById(id);
  if (!question) notFound();

  const related = relatedQuestionsFor(question);
  const batteryCodes = [
    ...new Set(
      [
        question.batteryCode,
        ...(question.relatedBatteryCodes ?? []),
      ].filter(Boolean) as string[],
    ),
  ].slice(0, 4);

  return (
    <PageShell pageLabel="Q&A 상세" showSearch wide={false}>
      <Breadcrumb
        items={[
          { label: "홈", href: "/" },
          { label: "Q&A", href: "/community" },
          { label: question.title },
        ]}
      />

      <article className={`${bm.card} ${bm.cardPad} mt-4`}>
        <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">{question.category}</p>
        <h1 className={`${bm.sectionTitleLg} mt-2`}>{question.title}</h1>
        <p className="mt-4 text-sm font-medium leading-relaxed text-slate-700">
          {question.shortAnswer ?? question.answer}
        </p>
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
          <p className="text-sm font-medium leading-relaxed text-slate-600">{question.answer}</p>
        </div>

        <div className="mt-4 max-w-lg">
          <MediaImageSlot slot={imageSlotForQuestion(question)} />
        </div>

        {batteryCodes.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-black text-slate-500">관련 규격</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {batteryCodes.map((code) => (
                <BatteryMiniSpecLink key={code} code={normalizeBatteryCode(code)} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
          {question.vehicleId ? (
            <Link className="text-blue-600 hover:underline" href={vehicleHref(question.vehicleId)}>
              관련 차량 보기
            </Link>
          ) : null}
          {question.relatedSearchQueries?.slice(0, 2).map((sq) => (
            <Link className="text-blue-600 hover:underline" href={searchHref(sq)} key={sq}>
              {sq} 검색
            </Link>
          ))}
          {question.guideId ? (
            <Link className="text-blue-600 hover:underline" href={guideHref(question.guideId)}>
              가이드 보기
            </Link>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link className={`${bm.btnPrimary} text-xs`} href={HUB_PHOTO}>
            사진으로 최종 확인
          </Link>
          <Link className={`${bm.btnSecondary} text-xs`} href={HUB_STORE}>
            부산 매장/출장 문의
          </Link>
          <Link className={`${bm.btnGhost} text-xs`} href="/community">
            질문 허브로
          </Link>
        </div>
      </article>

      {related.length > 0 ? (
        <section className={`${bm.card} ${bm.cardPad} mt-4`}>
          <h2 className={bm.sectionTitle}>관련 질문</h2>
          <ul className="mt-3 space-y-2">
            {related.map((rq) => (
              <li key={rq.id}>
                <Link
                  className="block rounded-xl border border-slate-200 bg-white px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/30"
                  href={`/community/${rq.id}`}
                >
                  <p className="font-heading text-sm font-bold text-slate-900">{rq.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-500">
                    {rq.shortAnswer ?? rq.answer}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageShell>
  );
}
