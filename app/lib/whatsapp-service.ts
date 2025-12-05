import { GameBoostWebhook } from "../types/event-payload";
import { AccountOrderWebhook } from "../types/event-payload/account-order-webhook";
import { CurrencyOrderWebhook } from "../types/event-payload/currency-order-webhook";
import { ItemOrderWebhook } from "../types/event-payload/item-order-webhook";
import { OrderReportWebhook } from "../types/event-payload/order-report-webhooks";
import { fetchWithAgent } from "./fetch-with-agent";

interface FonteConfig {
  apiUrl: string;
  token: string;
  defaultRecipient: string;
  countryCode: string;
}

interface FonteResponse {
  status: boolean;
  message?: string;
  detail?: string;
  id?: string;
}

class WhatsAppService {
  private config: FonteConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.FONNTE_API_URL || "https://api.fonnte.com/send",
      token: process.env.FONNTE_TOKEN || "",
      defaultRecipient: process.env.WHATSAPP_DEFAULT_RECIPIENT || "",
      countryCode: process.env.WHATSAPP_COUNTRY_CODE || "62",
    };

    if (!this.config.token) {
      console.warn(
        "⚠️ Fonnte API not configured. Notifications will be skipped."
      );
    }
  }

  async sendMessage(message: string, to?: string): Promise<boolean> {
    try {
      if (!this.config.token) {
        console.log("Fonnte API not configured, skipping notification");
        return false;
      }

      const recipient = to || this.config.defaultRecipient;

      if (!recipient) {
        throw new Error("No recipient specified");
      }


      const formData = new URLSearchParams();
      formData.append("target", recipient);
      formData.append("message", message);
      formData.append("countryCode", this.config.countryCode);
      formData.append("typing", "true");
      formData.append("delay", "0");

      const response = await fetchWithAgent(this.config.apiUrl, {
        method: "POST",
        headers: {
          Authorization: this.config.token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data: FonteResponse = await response.json();

      if (data.status) {
        console.log("✅ WhatsApp message sent via Fonnte:", data.id || "success");
        return true;
      }

      console.error("❌ Fonnte API returned error:", data.detail || data.message);
      return false;
    } catch (error) {
      console.error("❌ Error sending WhatsApp message:", error);
      return false;
    }
  }

  /**
   * Format and send webhook notification
   */
  async sendWebhookNotification(webhook: GameBoostWebhook): Promise<boolean> {
    const message = this.formatWebhookMessage(webhook);
    return this.sendMessage(message);
  }

  /**
   * Format webhook data into readable message
   */
  private formatWebhookMessage(webhook: GameBoostWebhook): string {
    const { event, payload } = webhook;

    const orderId = payload.id;
    const status = payload.status;
    const priceEur = payload.price_eur;
    const priceUsd = payload.price_usd;

    let message = "";

    switch (event) {
      case "currency.order.purchased":
        message = this.formatCurrencyOrder(webhook);
        break;

      case "account.order.purchased":
        message = this.formatAccountOrder(webhook);
        break;

      case "item.order.purchased":
        message = this.formatItemOrder(webhook);
        break;

      case "order.report.issued":
        message = this.formatOrderReport(webhook);
        break;

      default:
        message =
          `🔔 *New Webhook Event*\n\n` +
          `Event: ${event}\n` +
          `Order ID: ${orderId}\n` +
          `Status: ${status}\n` +
          `Price: €${priceEur} / $${priceUsd}`;
    }

    return message;
  }

  /**
   * Format currency order message
   */
  private formatCurrencyOrder({ payload }: CurrencyOrderWebhook): string {
    return (
      `🎮 *NEW CURRENCY ORDER* 🎮\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📦 Order ID: *#${payload.id}*\n` +
      `🎯 Game: *${payload.game?.name || "N/A"}*\n` +
      `👤 Buyer: *${payload.buyer?.username || "N/A"}*\n\n` +
      `💰 Currency: *${payload.currency_unit?.currency_name || "N/A"}*\n` +
      `📊 Quantity: *${payload.quantity || 0}*\n` +
      `💵 Price: *€${payload.price_eur}* / *$${payload.price_usd}*\n\n` +
      `📋 Status: *${payload.status?.toUpperCase()}*\n` +
      `⏱️ Delivery Time: *${payload.delivery_time?.format_long || "N/A"}*\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `✅ Please process this order immediately!`
    );
  }

  /**
   * Format account order message
   */
  private formatAccountOrder({ payload }: AccountOrderWebhook): string {
    return (
      `🎮 *NEW ACCOUNT ORDER* 🎮\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📦 Order ID: *#${payload.id}*\n` +
      `💵 Price: *€${payload.price_eur}* / *$${payload.price_usd}*\n` +
      `📋 Status: *${payload.status?.toUpperCase()}*\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `✅ Please process this order immediately!`
    );
  }

  /**
   * Format item order message
   */
  private formatItemOrder({ payload }: ItemOrderWebhook): string {
    return (
      `🎮 *NEW ITEM ORDER* 🎮\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📦 Order ID: *#${payload.id}*\n` +
      `💵 Price: *€${payload.price_eur}* / *$${payload.price_usd}*\n` +
      `📋 Status: *${payload.status?.toUpperCase()}*\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `✅ Please process this order immediately!`
    );
  }

  /**
   * Format order report message
   */
  private formatOrderReport({ payload }: OrderReportWebhook): string {
    return (
      `⚠️ *DISPUTE / REPORT ALERT* ⚠️\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📦 Order ID: *#${payload.id}*\n` +
      `💵 Amount: *€${payload.price_eur}* / *$${payload.price_usd}*\n` +
      `📋 Status: *${payload.status?.toUpperCase()}*\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `🚨 ACTION REQUIRED: Please check the dispute immediately!`
    );
  }

  /**
   * Send custom message to specific number
   */
  async sendCustomMessage(message: string, to: string): Promise<boolean> {
    return this.sendMessage(message, to);
  }

  /**
   * Send order status update
   */
  async sendStatusUpdate(
    orderId: number,
    oldStatus: string,
    newStatus: string
  ): Promise<boolean> {
    const message =
      `📢 *ORDER STATUS UPDATE*\n\n` +
      `Order ID: *#${orderId}*\n` +
      `Old Status: ${oldStatus}\n` +
      `New Status: *${newStatus.toUpperCase()}*\n\n` +
      `Updated at: ${new Date().toLocaleString()}`;

    return this.sendMessage(message);
  }
}

export const whatsappService = new WhatsAppService();

export { WhatsAppService };