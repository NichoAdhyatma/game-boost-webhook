import { BaseWebhookPayload } from "../base-webhook-payload";
import { OrderStatus } from "../order-statust";

export interface CurrencyOrderWebhook extends BaseWebhookPayload {
  event: 'currency.order.purchased';
  payload: {
    id: number;
    currency_offer_id: number;
    game: {
      id: number;
      name: string;
      slug: string;
    };
    buyer: {
      id: number;
      username: string;
    };
    rating?: {
      id: number;
      labels: string[];
      rating: number;
      comment: string;
      created_at: number;
      updated_at: number;
    };
    title: string;
    description: string;
    quantity: number;
    currency_unit: {
      slug: string;
      currency_name: string;
      name: string;
      symbol: string;
      multiplier: number;
    };
    parameters: Record<string, unknown>;
    status: OrderStatus;
    delivery_time: {
      duration: number;
      unit: string;
      format: string;
      format_long: string;
      seconds: number;
    };
    credentials?: {
      uid: number;
    };
    completion_proof_url?: string;
    price_eur: string;
    price_usd: string;
    unit_price_eur: string;
    unit_price_usd: string;
    created_at: number;
    updated_at: number;
  };
}
