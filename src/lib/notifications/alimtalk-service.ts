import "server-only";

import type {
  AlimtalkEventType,
  AlimtalkSendResult,
  NotificationEntityType,
} from "@/lib/notifications/alimtalk-types";
import {
  notificationLogFindSent,
  notificationLogInsert,
} from "@/lib/notifications/notification-log-store";
import {
  buildSolapiAlimtalkPayload,
  dispatchSolapiAlimtalk,
  formatAlimtalkAmount,
  getSolapiConfig,
  getTemplateIdForEnvKey,
  isAlimtalkLiveEnabled,
  normalizeAlimtalkPhone,
  type SolapiConfig,
  type SolapiDispatchResult,
} from "@/lib/notifications/solapi.server";

const TEMPLATE_ENV_BY_EVENT: Record<AlimtalkEventType, string> = {
  signup: "SOLAPI_TEMPLATE_SIGNUP",
  order_created: "SOLAPI_TEMPLATE_ORDER_CREATED",
  order_confirmed: "SOLAPI_TEMPLATE_ORDER_CONFIRMED",
  order_shipped: "SOLAPI_TEMPLATE_SHIPPED",
  cancel_refund: "SOLAPI_TEMPLATE_CANCEL_REFUND",
};

export type AlimtalkVariableContext = {
  orderNumber?: string;
  productName?: string;
  paymentAmount?: number | null;
  carrier?: string;
  trackingNumber?: string;
  processStatus?: string;
};

export type SendAlimtalkInput = {
  eventType: AlimtalkEventType;
  entityType: NotificationEntityType;
  entityId: string;
  phone: string | null | undefined;
  recipientName?: string | null;
  orderId?: string | null;
  userId?: string | null;
  variables?: AlimtalkVariableContext;
};

export type AlimtalkServiceDeps = {
  isLive?: () => boolean;
  getConfig?: () => SolapiConfig | null;
  dispatch?: (config: SolapiConfig, payload: ReturnType<typeof buildSolapiAlimtalkPayload>) => Promise<SolapiDispatchResult>;
};

export function buildAlimtalkTemplateVariables(
  eventType: AlimtalkEventType,
  ctx: AlimtalkVariableContext = {},
): Record<string, string> {
  switch (eventType) {
    case "signup":
      return {};
    case "order_created":
      return {
        "#{주문번호}": ctx.orderNumber ?? "",
        "#{상품명}": ctx.productName ?? "",
        "#{결제금액}": formatAlimtalkAmount(ctx.paymentAmount),
      };
    case "order_confirmed":
      return {
        "#{주문번호}": ctx.orderNumber ?? "",
        "#{상품명}": ctx.productName ?? "",
      };
    case "order_shipped":
      return {
        "#{주문번호}": ctx.orderNumber ?? "",
        "#{택배사}": ctx.carrier ?? "",
        "#{운송장번호}": ctx.trackingNumber ?? "",
      };
    case "cancel_refund":
      return {
        "#{주문번호}": ctx.orderNumber ?? "",
        "#{처리상태}": ctx.processStatus ?? "",
      };
    default:
      return {};
  }
}

export function buildAlimtalkPayloadPreview(input: SendAlimtalkInput & { templateId: string; pfId: string }) {
  const phone = normalizeAlimtalkPhone(input.phone);
  if (!phone) return null;
  return buildSolapiAlimtalkPayload({
    phone,
    pfId: input.pfId,
    templateId: input.templateId,
    variables: buildAlimtalkTemplateVariables(input.eventType, input.variables),
  });
}

async function persistLog(
  input: SendAlimtalkInput,
  result: {
    status: AlimtalkSendResult["status"];
    templateId: string | null;
    skipReason?: AlimtalkSendResult["skipReason"];
    providerMessageId?: string | null;
    failedReason?: string | null;
  },
) {
  const phone = normalizeAlimtalkPhone(input.phone) ?? "";
  return notificationLogInsert({
    channel: "alimtalk",
    eventType: input.eventType,
    templateId: result.templateId,
    entityType: input.entityType,
    entityId: input.entityId,
    orderId: input.orderId ?? null,
    userId: input.userId ?? null,
    recipientPhone: phone,
    recipientName: input.recipientName ?? null,
    status: result.status,
    skipReason: result.skipReason ?? null,
    provider: "solapi",
    providerMessageId: result.providerMessageId ?? null,
    failedReason: result.failedReason ?? null,
    sentAt: result.status === "sent" ? new Date().toISOString() : null,
  });
}

export async function sendAlimtalkEvent(
  input: SendAlimtalkInput,
  deps: AlimtalkServiceDeps = {},
): Promise<AlimtalkSendResult> {
  const isLive = deps.isLive ?? isAlimtalkLiveEnabled;
  const getConfig = deps.getConfig ?? getSolapiConfig;
  const dispatch = deps.dispatch ?? dispatchSolapiAlimtalk;

  const existing = await notificationLogFindSent(input.entityType, input.entityId, input.eventType);
  if (existing) {
    return { ok: false, status: "skipped", skipReason: "already_sent", dryRun: !isLive() };
  }

  const phone = normalizeAlimtalkPhone(input.phone);
  if (!phone) {
    await persistLog(input, { status: "skipped", templateId: null, skipReason: "missing_phone" });
    return { ok: false, status: "skipped", skipReason: "missing_phone", dryRun: !isLive() };
  }

  const config = getConfig();
  if (!config) {
    await persistLog(input, { status: "skipped", templateId: null, skipReason: "missing_env" });
    return { ok: false, status: "skipped", skipReason: "missing_env", dryRun: !isLive() };
  }

  const envKey = TEMPLATE_ENV_BY_EVENT[input.eventType];
  const templateId = getTemplateIdForEnvKey(envKey);
  if (!templateId) {
    await persistLog(input, { status: "skipped", templateId: null, skipReason: "missing_template" });
    return { ok: false, status: "skipped", skipReason: "missing_template", dryRun: !isLive() };
  }

  const payload = buildSolapiAlimtalkPayload({
    phone,
    pfId: config.pfId,
    templateId,
    variables: buildAlimtalkTemplateVariables(input.eventType, input.variables),
  });

  if (!isLive()) {
    await persistLog(input, { status: "skipped", templateId, skipReason: "dry_run" });
    return { ok: true, status: "skipped", skipReason: "dry_run", dryRun: true, providerMessageId: null };
  }

  const dispatchResult = await dispatch(config, payload);
  if (!dispatchResult.ok) {
    await persistLog(input, {
      status: "failed",
      templateId,
      skipReason: "solapi_error",
      failedReason: dispatchResult.error,
    });
    return {
      ok: false,
      status: "failed",
      skipReason: "solapi_error",
      failedReason: dispatchResult.error,
      dryRun: false,
    };
  }

  await persistLog(input, {
    status: "sent",
    templateId,
    providerMessageId: dispatchResult.messageId,
  });
  return {
    ok: true,
    status: "sent",
    providerMessageId: dispatchResult.messageId,
    dryRun: false,
  };
}
