import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getOperationalStoreMode,
  getOperationalStoreStatus,
  isOperationalStoreReady,
} from "@/lib/db/operational-store-config";
import { getReviewImageStorageStatus } from "@/lib/reviews/review-image-storage.server";
import { RETENTION_POLICY_SUMMARY } from "@/lib/retention/operational-data-retention";

const DOMAIN_LABELS: Record<string, string> = {
  claims: "클레임 (취소/반품/환불)",
  order_requests: "상담 주문 요청",
  inquiries: "고객 문의 / 상품 Q&A",
  battery_talk: "배터리톡",
  order_admin_meta: "결제주문 관리자 메모·송장",
  support_notices: "고객센터 공지",
  consultation_settings: "상담 채널 설정",
  reply_templates: "관리자 답변 템플릿",
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

function readRetentionLastRun(): { finishedAt: string; mode: string } | null {
  const path = join(process.cwd(), ".data", "retention-cleanup-last-run.json");
  if (!existsSync(path)) return null;
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as {
      finishedAt?: string;
      mode?: string;
    };
    if (!raw.finishedAt) return null;
    return { finishedAt: raw.finishedAt, mode: raw.mode ?? "anonymize" };
  } catch {
    return null;
  }
}

export function AdminOperationalDataStatus() {
  const status = getOperationalStoreStatus();
  const mode = getOperationalStoreMode();
  const ready = isOperationalStoreReady();
  const lastRetentionRun = readRetentionLastRun();
  const reviewImageStorage = getReviewImageStorageStatus();

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

      <div className="rounded border border-slate-200 bg-slate-50 px-2.5 py-2">
        <p className="mb-1 font-semibold text-slate-600">리뷰 사진 저장</p>
        <p className={reviewImageStorage.configured ? "text-emerald-700" : "text-red-700 font-semibold"}>
          {reviewImageStorage.configured
            ? `사용 중: ${reviewImageStorage.message}`
            : reviewImageStorage.message}
        </p>
      </div>

      <div className="rounded border border-slate-200 bg-slate-50 px-2.5 py-2">
        <p className="mb-1 font-semibold text-slate-600">문의·상담 보관 정책</p>
        <ul className="space-y-0.5 text-slate-600">
          <li>{RETENTION_POLICY_SUMMARY.productQna}</li>
          <li>{RETENTION_POLICY_SUMMARY.generalInquiry}</li>
          <li>{RETENTION_POLICY_SUMMARY.batteryTalk}</li>
          <li>{RETENTION_POLICY_SUMMARY.defaultMode}</li>
        </ul>
        <p className="mt-2 text-slate-500">
          정리 스크립트:{" "}
          <span className="font-mono">npm run retention:cleanup -- --dry-run</span>
        </p>
        {lastRetentionRun ? (
          <p className="mt-1 text-slate-500">
            마지막 정리 실행: {new Date(lastRetentionRun.finishedAt).toLocaleString("ko-KR")} (
            {lastRetentionRun.mode})
          </p>
        ) : null}
      </div>
    </div>
  );
}
