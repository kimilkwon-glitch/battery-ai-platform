import { ArticleCard, BatteryCard, MetaInfoRow, MiniStatCard, PortalLayout, PortalPanel } from "@/components/portal";
import { compareUrl, diagnosisUrl, photoUrl, portalQuestions, portalVehicles, searchUrl, vehicleUrl } from "@/lib/portal-data";

const myVehicle = portalVehicles.find((v) => v.slug === "sorento-mq4")!;
const savedCompare = ["AGM80L", "DIN74L"] as const;

export default function MyPage() {
  return (
    <PortalLayout
      title="마이페이지"
      description={`${myVehicle.name} · ${myVehicle.recommendedBattery} 기준 최근 활동`}
      breadcrumbs={[{ label: "홈", href: "/" }, { label: "마이페이지" }]}
      sidebar={
        <>
          <PortalPanel title="문의 · Q&A">
            <a href={`/ai/chat?q=${encodeURIComponent(portalQuestions[2].title)}`}>
              <MetaInfoRow label="EV6" value="12V 상담" />
            </a>
            <a href="/community">
              <MetaInfoRow label="BMS" value="등록 문의" />
            </a>
          </PortalPanel>
        </>
      }
    >
      <div className="grid gap-3 md:grid-cols-3">
        <PortalPanel title="내 차량">
          <a href={vehicleUrl(myVehicle.slug)}>
            <MiniStatCard label={myVehicle.name} value={myVehicle.recommendedBattery} meta="SOH 82%" />
          </a>
        </PortalPanel>
        <PortalPanel title="진단 기록">
          <a href={diagnosisUrl(myVehicle.symptomSlugs[0])}>
            <MiniStatCard label="블랙박스 방전" value="주의" meta={myVehicle.name} />
          </a>
        </PortalPanel>
        <PortalPanel title="사진 분석">
          <a href={photoUrl(myVehicle.recommendedBattery)}>
            <MiniStatCard label="라벨 OCR" value={myVehicle.recommendedBattery} meta="제조 34개월" />
          </a>
        </PortalPanel>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <PortalPanel title="최근 검색">
          {[`${myVehicle.name} ${myVehicle.recommendedBattery}`, "AGM80L", "셀토스 AGM60L", "EV6 12V 방전"].map((x, i) => (
            <ArticleCard title={x} meta="최근 검색" href={searchUrl(x)} key={x} index={i} />
          ))}
        </PortalPanel>
        <PortalPanel title="최근 본 배터리">
          {[myVehicle.recommendedBattery, myVehicle.upgradeOptions[0], "DIN74L"].map((x, i) => (
            <BatteryCard title={x} spec="규격" meta={myVehicle.name} href={searchUrl(x)} key={x} index={i} />
          ))}
        </PortalPanel>
      </div>
      <PortalPanel title="저장한 비교">
        <a href={compareUrl(...savedCompare)}>
          <MetaInfoRow label="비교" value={`${savedCompare[0]} vs ${savedCompare[1]}`} />
        </a>
        <a href={compareUrl("AGM70L", "AGM80L")}>
          <MetaInfoRow label="비교" value="셀토스 AGM70L vs AGM80L" />
        </a>
      </PortalPanel>
      <PortalPanel title="최근 본 차량">
        {portalVehicles.slice(0, 4).map((v) => (
          <a href={vehicleUrl(v.slug)} key={v.slug}>
            <MetaInfoRow label={v.brand} value={`${v.name} · ${v.recommendedBattery}`} />
          </a>
        ))}
      </PortalPanel>
    </PortalLayout>
  );
}
