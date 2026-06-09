export type ConsultationChannelSettings = {
  batteryTalkEnabled: boolean;
  externalChannelsEnabled: boolean;
  naverTalkUrl: string;
  kakaoChannelUrl: string;
  channelTalkPluginKey: string;
};

export const DEFAULT_CONSULTATION_SETTINGS: ConsultationChannelSettings = {
  batteryTalkEnabled: true,
  externalChannelsEnabled: false,
  naverTalkUrl: "",
  kakaoChannelUrl: "",
  channelTalkPluginKey: "",
};

export function normalizeConsultationSettings(
  raw: Partial<ConsultationChannelSettings> | null | undefined,
): ConsultationChannelSettings {
  return {
    batteryTalkEnabled: raw?.batteryTalkEnabled !== false,
    externalChannelsEnabled: Boolean(raw?.externalChannelsEnabled),
    naverTalkUrl: raw?.naverTalkUrl?.trim() ?? "",
    kakaoChannelUrl: raw?.kakaoChannelUrl?.trim() ?? "",
    channelTalkPluginKey: raw?.channelTalkPluginKey?.trim() ?? "",
  };
}
