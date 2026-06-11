/** 스윗트래커 trackingInfo API 원본 응답 (필요 필드만) */
export type SweetTrackerTrackingDetail = {
  timeString?: string;
  where?: string;
  kind?: string;
  telno?: string;
  telno2?: string;
  remark?: string;
};

export type SweetTrackerTrackingInfoResponse = {
  status?: boolean;
  msg?: string;
  complete?: boolean;
  completeYN?: string;
  invoiceNo?: string;
  level?: number;
  lastStateDetail?: SweetTrackerTrackingDetail;
  lastDetail?: SweetTrackerTrackingDetail;
  trackingDetails?: SweetTrackerTrackingDetail[];
};

export type DeliveryTrackProgress = {
  time: string;
  location: string;
  status: string;
  description: string;
};

export type DeliveryTrackResult = {
  ok: true;
  carrier: { code: string; name: string };
  invoiceNumber: string;
  status: string;
  lastUpdatedAt: string | null;
  progresses: DeliveryTrackProgress[];
};

export type DeliveryTrackError = {
  ok: false;
  message: string;
};
