export type WebhookEvent =
  | 'account.order.purchased'
  | 'currency.order.purchased'
  | 'item.order.purchased'
  | 'order.report.issued';