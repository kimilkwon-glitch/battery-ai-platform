import {
  getBatteryTalkStoreMode,
  isBatteryTalkStoreReady,
} from "@/lib/battery-talk/battery-talk-store-config";

export function AdminBatteryTalkDbStatus() {
  const mode = getBatteryTalkStoreMode();
  const ready = isBatteryTalkStoreReady();

  if (ready && mode === "postgres") {
    return (
      <p className="text-xs text-emerald-700">
        배터리톡: Postgres 연결됨 (battery_talk_sessions / battery_talk_messages)
      </p>
    );
  }

  if (mode === "json-dev") {
    return (
      <p className="text-xs text-amber-700">
        배터리톡: 개발용 JSON fallback (.data/battery-talk-threads.json) — production에서는
        DATABASE_URL 필수
      </p>
    );
  }

  return (
    <p className="text-xs font-semibold text-red-700">
      배터리톡 DB 미연결 — DATABASE_URL을 설정하고 npm run db:migrate:battery-talk 를 실행하세요.
      production에서 상담 저장·실시간 채팅이 비활성화됩니다.
    </p>
  );
}
