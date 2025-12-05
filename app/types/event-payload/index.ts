import { AccountOrderWebhook } from "./account-order-webhook";
import { CurrencyOrderWebhook } from "./currency-order-webhook";
import { ItemOrderWebhook } from "./item-order-webhook";
import { OrderReportWebhook } from "./order-report-webhooks";

export type GameBoostWebhook =
  | CurrencyOrderWebhook
  | AccountOrderWebhook
  | ItemOrderWebhook
  | OrderReportWebhook;

  