"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConsultationChannelSettings } from "@/lib/consultation/consultation-settings";

export function AdminConsultationSettingsCard() {
  const [settings, setSettings] = useState<ConsultationChannelSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/consultation-settings", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { ok?: boolean; settings?: ConsultationChannelSettings }) => {
        if (d.ok && d.settings) setSettings(d.settings);
      });
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/consultation-settings", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  };

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>배터리톡 · 외부 상담 채널</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <label className="flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={settings.batteryTalkEnabled}
            onChange={(e) => setSettings({ ...settings, batteryTalkEnabled: e.target.checked })}
          />
          배터리톡 사용
        </label>
        <label className="flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={settings.externalChannelsEnabled}
            onChange={(e) => setSettings({ ...settings, externalChannelsEnabled: e.target.checked })}
          />
          외부 상담 버튼 노출
        </label>
        <label className="block">
          <span className="text-xs font-bold text-slate-500">네이버 톡톡 URL</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
            value={settings.naverTalkUrl}
            onChange={(e) => setSettings({ ...settings, naverTalkUrl: e.target.value })}
            placeholder="https://"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-slate-500">카카오 채널 URL</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
            value={settings.kakaoChannelUrl}
            onChange={(e) => setSettings({ ...settings, kakaoChannelUrl: e.target.value })}
            placeholder="https://"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-slate-500">ChannelTalk Plugin Key (선택)</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
            value={settings.channelTalkPluginKey}
            onChange={(e) => setSettings({ ...settings, channelTalkPluginKey: e.target.value })}
          />
        </label>
        <button
          type="button"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white"
          onClick={() => void save()}
        >
          {saving ? "저장 중…" : "저장"}
        </button>
        {saved ? <p className="text-xs font-bold text-emerald-700">저장되었습니다.</p> : null}
      </CardContent>
    </Card>
  );
}
