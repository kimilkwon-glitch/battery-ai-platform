import { NextResponse } from "next/server";
import { getConsultationSettings } from "@/lib/consultation/consultation-settings-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getConsultationSettings();
    return NextResponse.json({
      ok: true,
      settings: {
        batteryTalkEnabled: settings.batteryTalkEnabled,
        externalChannelsEnabled: settings.externalChannelsEnabled,
        naverTalkUrl: settings.naverTalkUrl || null,
        kakaoChannelUrl: settings.kakaoChannelUrl || null,
        hasChannelTalk: Boolean(settings.channelTalkPluginKey?.trim()),
      },
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
