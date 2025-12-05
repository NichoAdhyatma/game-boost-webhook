import { BaseWebhookPayload } from "../base-webhook-payload";
import { OrderStatus } from "../order-statust";

export interface ItemOrderWebhook extends BaseWebhookPayload {
  event: 'item.order.purchased';
  payload: {
    id: number;
    status: OrderStatus;
    price_eur: string;
    price_usd: string;
    created_at: number;
    updated_at: number;
  };
}