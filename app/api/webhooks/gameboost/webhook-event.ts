import { whatsappService } from "@/app/lib/whatsapp-service";
import { GameBoostWebhook } from "@/app/types/event-payload";
import { AccountOrderWebhook } from "@/app/types/event-payload/account-order-webhook";
import { CurrencyOrderWebhook } from "@/app/types/event-payload/currency-order-webhook";
import { ItemOrderWebhook } from "@/app/types/event-payload/item-order-webhook";
import { OrderReportWebhook } from "@/app/types/event-payload/order-report-webhooks";

export async function processCurrencyOrder(webhook: CurrencyOrderWebhook) {
  console.log("Processing currency order:", {
    orderId: webhook.payload.id,
    game: webhook.payload.game.name,
    quantity: webhook.payload.quantity,
    currency: webhook.payload.currency_unit.currency_name,
    buyer: webhook.payload.buyer.username,
    status: webhook.payload.status,
  });

  try {
    await whatsappService.sendWebhookNotification(webhook);
    console.log("✅ WhatsApp notification sent for order:", webhook.payload.id);
  } catch (error) {
    console.error("❌ Failed to send WhatsApp notification:", error);
  }
}

export async function processAccountOrder(webhook: AccountOrderWebhook) {
  console.log("Processing account order:", {
    orderId: webhook.payload.id,
    status: webhook.payload.status,
  });

  try {
    await whatsappService.sendWebhookNotification(webhook);
    console.log("✅ WhatsApp notification sent for order:", webhook.payload.id);
  } catch (error) {
    console.error("❌ Failed to send WhatsApp notification:", error);
  }
}

export async function processItemOrder(webhook: ItemOrderWebhook) {
  console.log("Processing item order:", {
    orderId: webhook.payload.id,
    status: webhook.payload.status,
  });

  try {
    await whatsappService.sendWebhookNotification(webhook);
    console.log("✅ WhatsApp notification sent for order:", webhook.payload.id);
  } catch (error) {
    console.error("❌ Failed to send WhatsApp notification:", error);
  }
}

export async function processOrderReport(webhook: OrderReportWebhook) {
  console.log("Processing order report:", {
    orderId: webhook.payload.id,
    status: webhook.payload.status,
  });

  try {
    await whatsappService.sendWebhookNotification(webhook);
    console.log("✅ WhatsApp notification sent for order:", webhook.payload.id);
  } catch (error) {
    console.error("❌ Failed to send WhatsApp notification:", error);
  }
}

export async function processWebhook(webhook: GameBoostWebhook) {
  const notifications: Promise<void>[] = [];

  switch (webhook.event) {
    case "currency.order.purchased":
      notifications.push(processCurrencyOrder(webhook));
      break;
    case "account.order.purchased":
      notifications.push(processAccountOrder(webhook));
      break;
    case "item.order.purchased":
      notifications.push(processItemOrder(webhook));
      break;
    case "order.report.issued":
      notifications.push(processOrderReport(webhook));
      break;
    default:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.warn("Unknown webhook event:", (webhook as any).event);
  }

  await Promise.allSettled(notifications);
}
