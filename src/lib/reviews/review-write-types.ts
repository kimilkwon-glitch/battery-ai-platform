export type ReviewWriteOrderContext = {
  orderId: string;
  orderNumber: string;
  orderNumberShort: string;
  productName: string;
  brand?: string;
  batteryCode: string;
  vehicleName?: string;
  fulfillmentLabel: string;
  serviceType?: string;
  createdAt: string;
  orderStatusLabel: string;
  eligible: boolean;
  alreadyReviewed: boolean;
};
