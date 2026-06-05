/**
 * 자사몰 주문·결제 API 타입 (PG 연동 전 stub)
 */
import type { BatteryCartItem, FulfillmentMethod } from "@/types/cart";
import type {
  CommerceOrderLifecycleStatus,
  CommerceOrderPriceSnapshot,
  CommercePaymentStatus,
} from "@/types/commerce-order";
import type {
  OrderRequestCustomerType,
  OrderRequestFulfillmentMethod,
  OrderRequestStoreId,
  OrderRequestUsedBatteryOption,
  OrderRequestVehicle,
} from "@/types/order-request";

export type CommerceOrderStatus = CommerceOrderLifecycleStatus;
export type CommercePaymentRecordStatus = CommercePaymentStatus;

export type CreateOrderCustomerInfo = {
  name: string;
  phone: string;
  email?: string;
  customerType?: OrderRequestCustomerType;
  orderMemo?: string;
};

export type CreateOrderAddressInfo = {
  deliveryAddress?: string;
  visitRegion?: string;
  storeId?: OrderRequestStoreId;
  preferredTime?: string;
};

export type CreateOrderPriceSummary = {
  clientFinalAmount?: number | null;
  priceLines?: CommerceOrderPriceSnapshot[];
};

export type CreateOrderRequestBody = {
  cartItems: BatteryCartItem[];
  customerInfo: CreateOrderCustomerInfo;
  vehicleInfo?: OrderRequestVehicle;
  fulfillmentType: OrderRequestFulfillmentMethod;
  returnBatteryOption: OrderRequestUsedBatteryOption;
  addressInfo?: CreateOrderAddressInfo;
  selectedStore?: OrderRequestStoreId;
  requestMemo?: string;
  priceSummary?: CreateOrderPriceSummary;
};

export type CommerceOrderRecord = {
  orderId: string;
  orderNumber: string;
  orderStatus: CommerceOrderStatus;
  paymentStatus: CommercePaymentRecordStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerType: OrderRequestCustomerType;
  vehicleName?: string;
  vehicleYear?: string;
  vehicleFuel?: string;
  plateSuffix?: string;
  productName: string;
  brand?: string;
  batteryCode: string;
  internetPrice: number | null;
  onsitePrice: number | null;
  fulfillmentType: FulfillmentMethod;
  returnBatteryOption: OrderRequestUsedBatteryOption;
  deliveryFee: number;
  storeInstallDiscount: number;
  finalAmount: number | null;
  address?: string;
  store?: string;
  selectedStore?: OrderRequestStoreId;
  requestMemo?: string;
  itemsJson: BatteryCartItem[];
  priceLines: CommerceOrderPriceSnapshot[];
  paymentRequestId?: string;
  paymentProvider?: "toss";
  paymentKey?: string;
  paidAmount?: number | null;
  paymentMethod?: string;
  pgTransactionId?: string;
  paymentFailReason?: string;
  paymentFailCode?: string;
  approvedAt?: string;
  receiptUrl?: string;
  tossPaymentStatus?: string;
  statusHistory: CommerceOrderStatusEvent[];
  createdAt: string;
  updatedAt: string;
};

export type CommerceOrderStatusEvent = {
  status: CommerceOrderStatus;
  paymentStatus?: CommercePaymentRecordStatus;
  note?: string;
  at: string;
};

export type PaymentPrepareRequestBody = {
  orderId: string;
  clientAmount?: number | null;
  paymentRequestId?: string;
};

export type PaymentPrepareResponse = {
  ok: true;
  provider: "toss";
  paymentRequestId: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  orderName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerMobilePhone: string;
  fulfillmentType: FulfillmentMethod;
  successUrl: string;
  failUrl: string;
  returnUrl: string;
  clientKey: string;
  testMode: boolean;
  message: string;
};

export type PaymentConfirmRequestBody = {
  orderId: string;
  paymentRequestId?: string;
  paymentKey?: string;
  transactionId?: string;
  amount?: number;
};

export type PaymentConfirmResponse = {
  ok: true;
  orderId: string;
  orderNumber: string;
  amount: number;
  paymentStatus: CommercePaymentRecordStatus;
  orderStatus: CommerceOrderStatus;
  productName?: string;
  brand?: string;
  customerName?: string;
  vehicleName?: string;
  fulfillmentType?: FulfillmentMethod;
  alreadyConfirmed?: boolean;
};

export type PaymentFailRequestBody = {
  orderId: string;
  paymentRequestId?: string;
  errorCode?: string;
  errorMessage?: string;
};

/** 클라이언트 checkout → review 세션 */
export type CheckoutSessionPayload = {
  version: 1;
  flow: "cart" | "buy_now";
  items: BatteryCartItem[];
  customer: CreateOrderCustomerInfo;
  vehicle: OrderRequestVehicle;
  fulfillment: {
    method: OrderRequestFulfillmentMethod;
    storeId?: OrderRequestStoreId;
    region?: string;
    preferredTime?: string;
  };
  usedBatteryReturn: OrderRequestUsedBatteryOption;
  memo?: string;
  priceLines: CommerceOrderPriceSnapshot[];
  estimatedTotal: number | null;
  savedAt: string;
};

export type AdminCommercePaymentMeta = {
  orderNumber?: string;
  paymentProvider?: "toss";
  paymentStatus: CommercePaymentRecordStatus;
  orderStatus: CommerceOrderStatus;
  estimatedAmount: number | null;
  paidAmount: number | null;
  paymentMethod?: string;
  paymentKey?: string;
  pgTransactionId?: string;
  paymentRequestId?: string;
  paymentFailReason?: string;
  paymentFailCode?: string;
  approvedAt?: string;
  receiptUrl?: string;
  testMode?: boolean;
  statusHistory: CommerceOrderStatusEvent[];
};
