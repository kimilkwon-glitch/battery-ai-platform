import {
  getOperationalStoreMode,
  getOperationalStoreStatus,
  isOperationalStoreReady,
} from "@/lib/db/operational-store-config";

const DOMAIN_LABELS: Record<string, string> = {
  claims: "클레임 (취소/반품/환불)",
  order_requests: "상담 주문 요청",
  inquiries: "고객 문의 / 상품 Q&A",
  battery_talk: "배터리톡",
  order_admin_meta: "결제주문 관리자 메모·송장",
  support_notices: "고객센터 공지",
  consultation_settings: "상담 채널 설정",
};

const POSTGRES_ALWAYS = [
  { label: "결제 주문 본체", mode: "postgres" as const },
  { label: "회원", mode: "postgres" as const },
  { label: "프로모션/쿠폰", mode: "postgres" as const },
  { label: "메인 배너 (CMS)", mode: "postgres" as const },
  { label: "고객 리뷰 (CMS)", mode: "postgres" as const },
];

function modeBadge(mode: string): { text: string; className: string } {
  if (mode === "postgres") return { text: "Postgres", className: "text-emerald-700" };
  if (mode === "json-dev") return { text: "JSON (dev)", className: "text-amber-700" };
  return { text: "미연결", className: "text-red-700 font-semibold" };
}

export function AdminOperationalDataStatus() {
  const status = getOperationalStoreStatus();
  const mode = getOperationalStoreMode();
  const ready = isOperationalStoreReady();

  return (
    <div className="space-y-3 text-xs text-slate-600">
      <p>
        DB 엔진: <span className="font-semibold">Neon Postgres</span> (DATABASE_URL)
        {!ready ? (
          <span className="ml-2 font-semibold text-red-700">
            — production 운영 데이터 저장 불가
          </span>
        ) : null}
      </p>

      <div>
        <p className="mb-1 font-semibold text-slate-500">항상 Postgres (기존)</p>
        <ul className="space-y-0.5">
          {POSTGRES_ALWAYS.map((row) => {
            const b = modeBadge(row.mode);
            return (
              <li key={row.label}>
                {row.label}: <span className={b.className}>{b.text}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <p className="mb-1 font-semibold text-slate-500">운영 데이터 (이번 전환)</p>
        <ul className="space-y-0.5">
          {Object.entries(status.domains).map(([key, domainMode]) => {
            const b = modeBadge(domainMode);
            return (
              <li key={key}>
                {DOMAIN_LABELS[key] ?? key}: <span className={b.className}>{b.text}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {mode === "json-dev" ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-amber-900">
          개발 모드: DATABASE_URL 없음 → JSON fallback 사용 중. production 배포 전 DATABASE_URL
          설정 및 npm run db:migrate:operational-data 필요.
        </p>
      ) : null}

      {mode === "unavailable" ? (
        <p className="rounded border border-red-200 bg-red-50 px-2 py-1.5 text-red-900">
          DATABASE_URL 미설정 — production에서 문의·클레임·주문요청·배터리톡 저장 API는 503으로
          실패합니다.
        </p>
      ) : null}
    </div>
  );
}
