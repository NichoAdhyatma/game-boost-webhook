export const WEBHOOK_SECRET = process.env.GAMEBOOST_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  console.error(
    "❌ GAMEBOOST_WEBHOOK_SECRET is not set in environment variables"
  );
}

export const PROCESSED_WEBHOOK_TTL_MS = 24 * 60 * 60 * 1000;

export const processedWebhooks = new Map<string, number>();

export function pruneProcessedWebhooks() {
  const now = Date.now();
  for (const [id, ts] of processedWebhooks.entries()) {
    if (now - ts > PROCESSED_WEBHOOK_TTL_MS) {
      processedWebhooks.delete(id);
    }
  }
}

if (typeof setInterval !== "undefined") {
  setInterval(pruneProcessedWebhooks, 60 * 60 * 1000); 
}
