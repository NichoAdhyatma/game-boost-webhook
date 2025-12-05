import crypto from "crypto";
import {
  processedWebhooks,
  PROCESSED_WEBHOOK_TTL_MS,
  pruneProcessedWebhooks,
} from "../lib/config";
import { GameBoostWebhook } from "../types/event-payload";

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

export function isWebhookProcessed(event: string, payloadId: number): boolean {
  const webhookId = `${event}_${payloadId}`;
  const ts = processedWebhooks.get(webhookId);
  if (!ts) return false;

  const now = Date.now();
  if (now - ts > PROCESSED_WEBHOOK_TTL_MS) {
    processedWebhooks.delete(webhookId);
    return false;
  }

  return true;
}

export function markWebhookProcessed(event: string, payloadId: number): void {
  const webhookId = `${event}_${payloadId}`;
  processedWebhooks.set(webhookId, Date.now());

  try {
    pruneProcessedWebhooks();
  } catch (e) {
    console.error("Error pruning processed webhooks:", e);
  }

}

export function logWebhook(webhook: GameBoostWebhook) {
  console.log({
    timestamp: new Date().toISOString(),
    event: webhook.event,
    payload_id: webhook.payload.id,
    status: webhook.payload.status,
  });
}

export async function storeFailedWebhook(
  webhook: GameBoostWebhook,
  error: Error
) {
  console.error("Failed webhook stored for reprocessing:", {
    event: webhook.event,
    payload_id: webhook.payload.id,
    error: error.message,
    timestamp: new Date().toISOString(),
  });
}
