import { getDiagnosisCategories } from "@/lib/diagnosis-data";
import type { ContentUiIconKey } from "@/lib/content-ui-icons";
import { ArticleCard, MetaInfoRow, PortalLayout, PortalPanel } from "@/components/portal";
import { DiagnosisCategoryGrid } from "@/components/platform/DiagnosisCategoryGrid";
import { DiagnosisFlowClient } from "@/components/platform/DiagnosisFlowClient";
import { guideHref, searchHref, vehicleHref } from "@/lib/platform-data";

const sidebarSymptoms = [
  { label: "시동 늦게 걸림", href: "/diagnosis/slow-engine-start" },
  { label: "블랙박스 방전", href: "/diagnosis/blackbox-drain" },
  { label: "겨울철 방전", href: "/diagnosis/winter-discharge" },
  { label: "AGM 교체 필요", href: "/diagnosis/agm-replacement" },
  { label: "EV 12V 방전", href: "/diagnosis/ev12v-discharge" },
  { label: "IBS/BMS 오류", href: "/diagnosis/ibs-bms-error" },
];

export default function DiagnosisPage() {
  const categories = getDiagnosisCategories();

  return (
    <PortalLayout
      title="증상 확인"
      description="증상 선택 → 차량 입력 → 결과 확인 → 배터리·작업 가능점으로 연결"
      breadcrumbs={[{ label: "홈", href: "/" }, { label: "증상진단" }]}
      related={{
        vehicles: [
          { label: "그랜저 IG", meta: "AGM80L", href: vehicleHref("grandeur-ig") },
          { label: "셀토스", meta: "AGM60L", href: vehicleHref("seltos") },
          { label: "EV6", meta: "12V", href: vehicleHref("ev6") },
        ],
        batteries: [
          { label: "AGM80L", meta: "검색", href: searchHref("AGM80L") },
          { label: "DIN74L", meta: "검색", href: searchHref("DIN74L") },
        ],
        guides: [{ label: "겨울철 CCA", meta: "가이드", href: guideHref("winter-cca") }],
      }}
      sidebar={
        <>
          <PortalPanel title="최근 많이 확인된 증상">
            <div className="space-y-2">
              {sidebarSymptoms.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200 transition hover:bg-blue-50"
                >
                  <span className="text-sm font-black text-slate-300">{index + 1}</span>
                  <span className="text-sm font-black text-slate-800">{item.label}</span>
                </a>
              ))}
            </div>
          </PortalPanel>
          <PortalPanel title="계절별 방전 주의">
            <div className="space-y-2">
              {["겨울철 CCA 저하", "장기주차 OCV 하락", "블랙박스 상시전원", "EV 12V 보조배터리"].map((item) => (
                <MetaInfoRow label="주의" value={item} key={item} />
              ))}
            </div>
          </PortalPanel>
          <PortalPanel title="최근 진단 사례">
            <div className="space-y-2">
              {(
                [
                  {
                    title: "쏘렌토 MQ4 시동 지연",
                    meta: "시동 지연 · AGM80L 확인",
                    iconKey: "start-delay" as ContentUiIconKey,
                  },
                  {
                    title: "EV6 12V 저전압",
                    meta: "EV 12V · 보조배터리 점검",
                    iconKey: "low-voltage" as ContentUiIconKey,
                  },
                  {
                    title: "BMW 520i BMS 등록",
                    meta: "IBS/BMS · 등록 필요",
                    iconKey: "bms-registration" as ContentUiIconKey,
                  },
                  {
                    title: "그랜저 IG 블랙박스 방전",
                    meta: "대기전류 · 컷오프 설정",
                    iconKey: "dashcam-drain" as ContentUiIconKey,
                  },
                ] as const
              ).map((item) => (
                <ArticleCard
                  title={item.title}
                  meta={item.meta}
                  href={`/community?q=${encodeURIComponent(item.title)}`}
                  iconKey={item.iconKey}
                  key={item.title}
                />
              ))}
            </div>
          </PortalPanel>
        </>
      }
    >
      <DiagnosisFlowClient />
      <PortalPanel title="증상별 상세 페이지" meta="자주 찾는 증상 6개">
        <DiagnosisCategoryGrid categories={categories} />
      </PortalPanel>
    </PortalLayout>
  );
}
