"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { VehicleCardMedia } from "@/components/media/VehicleCardMedia";
import { bm } from "@/lib/design-tokens";
import { addCustomerVehicle } from "@/lib/customer-vehicles-storage";
import { searchVehicleCardLabels } from "@/lib/search/search-vehicle-card-display";
import {
  resolveSearchVehicleCardDetailHref,
  resolveSearchVehicleCardSpecHref,
  slugFromSearchVehicleRow,
} from "@/lib/search/search-vehicle-card-nav";
import type { VehicleSearchRow } from "@/components/platform/SearchVehicleResults";
import { cn } from "@/lib/utils";

type Props = {
  row: VehicleSearchRow;
};

/** 검색 결과·세대 선택 — 카드 클릭·규격·등록 CTA */
export function SearchVehicleResultCard({ row }: Props) {
  const router = useRouter();
  const [registered, setRegistered] = useState(false);
  const { title, brand, yearRange, imageSrc } = searchVehicleCardLabels(row);
  const detailHref = resolveSearchVehicleCardDetailHref(row);
  const specHref = resolveSearchVehicleCardSpecHref(row);
  const slug = slugFromSearchVehicleRow(row);

  function goDetail() {
    if (!detailHref) return;
    router.push(detailHref);
  }

  function handleRegister(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!detailHref || !slug) {
      router.push("/vehicles?register=1");
      return;
    }
    addCustomerVehicle({
      slug,
      displayName: row.model.trim() || title,
      href: detailHref,
      year: yearRange || row.year,
      fuel: row.fuel,
    });
    setRegistered(true);
  }

  const primaryBody = (
    <>
      <div className="bm-search-vehicle-card__media">
        <VehicleCardMedia
          alt={title}
          commercial={/porter|봉고|마이티|k3|쿱|koup/i.test(title)}
          className="bm-vehicle-card-media--search-result"
          placeholderTitle={title}
          slug={slug ?? undefined}
          src={imageSrc}
          variant="card"
        />
      </div>

      <div className="bm-search-vehicle-card__body">
        <div className="bm-search-vehicle-card__main">
          <h3 className="bm-search-vehicle-card__title">{title}</h3>
          <div className="bm-search-vehicle-card__identity">
            {brand ? <span className="bm-search-vehicle-card__brand">{brand}</span> : null}
            {yearRange ? <span className="bm-search-vehicle-card__year">{yearRange}</span> : null}
          </div>
        </div>

        <div className="bm-search-vehicle-card__footer">
          <span className="bm-search-vehicle-card__cta">
            자세히 보기
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          </span>
        </div>
      </div>
    </>
  );

  return (
    <article
      className={cn("bm-search-vehicle-card", detailHref && "bm-search-vehicle-card--clickable")}
      data-search-vehicle-slug={slug ?? undefined}
    >
      {detailHref ? (
        <Link href={detailHref} className="bm-search-vehicle-card__primary group">
          {primaryBody}
        </Link>
      ) : (
        <div
          className="bm-search-vehicle-card__primary group cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={goDetail}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              goDetail();
            }
          }}
        >
          {primaryBody}
        </div>
      )}

      <div className="bm-search-vehicle-card__actions">
        {specHref ? (
          <Link
            href={specHref}
            className={`${bm.btnSecondary} bm-search-vehicle-card__action-btn`}
            onClick={(e) => e.stopPropagation()}
          >
            규격 보기
          </Link>
        ) : null}
        <button
          type="button"
          className={`${bm.btnPrimary} bm-search-vehicle-card__action-btn`}
          onClick={handleRegister}
        >
          {registered ? "등록 완료" : "내 차량으로 등록"}
        </button>
        <Link
          href="/vehicles?register=1"
          className={`${bm.btnGhost} bm-search-vehicle-card__action-btn`}
          onClick={(e) => e.stopPropagation()}
        >
          차량정보 등록
        </Link>
      </div>

      {row.fuelHref && row.fuelHref !== specHref ? (
        <Link
          href={row.fuelHref}
          className="bm-search-vehicle-card__fuel-link"
          onClick={(e) => e.stopPropagation()}
        >
          연료별 배터리
        </Link>
      ) : null}
    </article>
  );
}
