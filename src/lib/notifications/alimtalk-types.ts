export type AlimtalkEventType =
  | "signup"
  | "order_created"
  | "order_confirmed"
  | "order_shipped"
  | "cancel_refund";

export type NotificationEntityType = "member" | "order" | "claim";

export type NotificationLogStatus = "sent" | "skipped" | "failed";

export type NotificationSkipReason =
  | "missing_env"
  | "missing_phone"
  | "missing_template"
  | "already_sent"
  | "dry_run"
  | "invalid_phone";

export type NotificationLogRecord = {
  id: string;
  channel: "alimtalk";
  eventType: AlimtalkEventType;
  templateId: string | null;
  entityType: NotificationEntityType;
  entityId: string;
  orderId?: string | null;
  userId?: string | null;
  recipientPhone: string;
  recipientName: string | null;
  status: NotificationLogStatus;
  skipReason: NotificationSkipReason | "solapi_error" | null;
  provider: "solapi";
  providerMessageId: string | null;
  failedReason: string | null;
  sentAt: string | null;
  createdAt: string;
};

export type AlimtalkSendResult = {
  ok: boolean;
  status: NotificationLogStatus;
  skipReason?: NotificationSkipReason | "solapi_error";
  providerMessageId?: string | null;
  failedReason?: string | null;
  dryRun: boolean;
};

export type SolapiAlimtalkPayload = {
  to: string;
  pfId: string;
  templateId: string;
  variables: Record<string, string>;
};
