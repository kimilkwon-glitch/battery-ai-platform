import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { bm } from "@/lib/design-tokens";

/** 메인 — EV/하이브리드 보조 12V 짧은 안내만 (대형 카드 그리드 없음) */
export function HomeEvHybridHint() {
  return (
    <p className={`${bm.typoCaption} flex flex-wrap items-center gap-x-2 gap-y-1`}>
      <AppIcon iconKey="ev" size="sm" />
      <span>하이브리드·EV 보조 12V는 차종별로 다릅니다.</span>
      <Link className="font-bold text-[var(--bm-primary)] hover:underline" href="/guides/knowledge/bk-ev-aux-12v">
        자세한 안내 보기
      </Link>
    </p>
  );
}
