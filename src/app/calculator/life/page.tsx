import { MetaInfoRow, MiniStatCard, PortalLayout, PortalPanel, RankingWidget, StatusBadge } from "@/components/portal";
import { communityUrl, diagnosisUrl, guideUrl, photoUrl, searchUrl } from "@/lib/portal-data";

const inputs = ["월 주행거리", "장기주차 여부", "블랙박스 사용", "최근 방전 횟수", "배터리 사용 기간", "전압/CCA 입력"];

export default function BatteryLifeCalculatorPage() {
  return (
    <PortalLayout
      title="배터리 수명 계산기"
      description="차량 사용 패턴과 전압/CCA를 입력해 예상 수명과 교체 권장 여부를 확인합니다."
      breadcrumbs={[{ label: "홈", href: "/" }, { label: "수명 계산기" }]}
      crossLinks={[
        { title: "현재 배터리 규격 검색", description: "AGM80L", href: searchUrl("AGM80L") },
        { title: "교체 추천 배터리 보기", description: "AGM95L", href: searchUrl("AGM95L") },
        { title: "증상진단으로 이동", description: "시동·방전", href: diagnosisUrl("slow-engine-start") },
        { title: "사진분석으로 이동", description: "SOH·제조일", href: photoUrl() },
        { title: "관리 가이드", description: "겨울철 CCA", href: guideUrl("겨울철") },
        { title: "Q&A 보기", description: "수명 질문", href: communityUrl("배터리 수명") },
      ]}
      sidebar={
        <>
          <PortalPanel title="평균 수명 데이터">
            {["일반 2.5~3년", "AGM 3~4년", "EV 12V 2~3년"].map((x) => (
              <MetaInfoRow label="평균" value={x} key={x} />
            ))}
          </PortalPanel>
          <RankingWidget
            title="방전 위험 요인"
            items={[
              ["블랙박스 상시전원", "높음", diagnosisUrl("blackbox-drain")],
              ["단거리 주행", "중상", searchUrl("단거리 방전")],
              ["겨울철 CCA 저하", "상승", diagnosisUrl("winter-discharge")],
            ]}
          />
        </>
      }
    >
      <PortalPanel title="사용 패턴 입력">
        <div className="grid gap-2 md:grid-cols-3">
          {inputs.map((x) => (
            <input className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold ring-1 ring-slate-200" placeholder={x} key={x} />
          ))}
        </div>
      </PortalPanel>
      <div className="grid gap-3 md:grid-cols-[1fr_320px]">
        <PortalPanel title="예상 수명 결과">
          <div className="grid gap-2 md:grid-cols-4">
            <MiniStatCard label="예상 SOH" value="82%" meta="관찰" />
            <MiniStatCard label="예상 수명" value="3개월" meta="교체 준비" />
            <MiniStatCard label="방전 위험" value="중상" meta="겨울 주의" />
            <MiniStatCard label="권장" value="점검 필요" meta="CCA 테스트" />
          </div>
        </PortalPanel>
        <PortalPanel title="위험도 게이지">
          <div className="h-3 rounded-full bg-slate-100">
            <div className="h-3 w-[72%] rounded-full bg-gradient-to-r from-blue-500 to-red-500" />
          </div>
          <div className="mt-3">
            <StatusBadge tone="red">교체 권장 여부: 조건부 권장</StatusBadge>
          </div>
        </PortalPanel>
      </div>
    </PortalLayout>
  );
}
