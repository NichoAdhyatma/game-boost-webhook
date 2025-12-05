import { OrderStatus } from "./order-statust";
import { WebhookEvent } from "./webhook-event";

export interface BaseWebhookPayload {
  event: WebhookEvent;
  payload: {
    id: number;
    status: OrderStatus;
    price_eur: string;
    price_usd: string;
    created_at: number;
    updated_at: number;
  };
}
