// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require("crypto");

console.log("Loaded secret:", process.env.GAMEBOOST_WEBHOOK_SECRET);


const WEBHOOK_URL = process.env.WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.GAMEBOOST_WEBHOOK_SECRET;

const samplePayloads = {
  "currency.order.purchased": {
    event: "currency.order.purchased",
    payload: {
      id: Date.now(),
      currency_offer_id: 789,
      game: {
        id: 1,
        name: "Genshin Impact",
        slug: "genshin-impact",
      },
      buyer: {
        id: 456,
        username: "test_buyer",
      },
      title: "1000 Genesis Crystals",
      description: "Fast delivery",
      quantity: 1000,
      currency_unit: {
        slug: "genesis-crystals",
        currency_name: "Genesis Crystals",
        name: "Genesis Crystals",
        symbol: "GC",
        multiplier: 1,
      },
      parameters: {},
      status: "pending",
      delivery_time: {
        duration: 30,
        unit: "minutes",
        format: "30m",
        format_long: "30 minutes",
        seconds: 1800,
      },
      credentials: {
        uid: 123456789,
      },
      price_eur: "15.99",
      price_usd: "17.99",
      unit_price_eur: "0.01599",
      unit_price_usd: "0.01799",
      created_at: Date.now(),
      updated_at: Date.now(),
    },
  },
  "account.order.purchased": {
    event: "account.order.purchased",
    payload: {
      id: Date.now(),
      status: "pending",
      price_eur: "49.99",
      price_usd: "54.99",
      created_at: Date.now(),
      updated_at: Date.now(),
    },
  },
  "item.order.purchased": {
    event: "item.order.purchased",
    payload: {
      id: Date.now(),
      status: "pending",
      price_eur: "9.99",
      price_usd: "10.99",
      created_at: Date.now(),
      updated_at: Date.now(),
    },
  },
  "order.report.issued": {
    event: "order.report.issued",
    payload: {
      id: Date.now(),
      status: "in_delivery",
      price_eur: "25.99",
      price_usd: "28.99",
      created_at: Date.now(),
      updated_at: Date.now(),
    },
  },
};

/**
 * Generate HMAC-SHA256 signature
 */
function generateSignature(payload, secret) {
  const payloadString = JSON.stringify(payload);
  return crypto
    .createHmac("sha256", secret)
    .update(payloadString)
    .digest("hex");
}

async function sendWebhook(eventType) {
  const payload = samplePayloads[eventType];

  if (!payload) {
    console.error(`❌ Unknown event type: ${eventType}`);
    console.log("Available events:", Object.keys(samplePayloads).join(", "));
    return;
  }

  const signature = generateSignature(payload, WEBHOOK_SECRET);

  console.log("\n📤 Sending webhook...");
  console.log("Event:", eventType);
  console.log("URL:", WEBHOOK_URL);
  console.log("Payload ID:", payload.payload.id);
  console.log("Signature:", signature);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "GameBoost Server",
        Signature: signature,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.text();

    console.log("\n✅ Response received:");
    console.log("Status:", response.status, response.statusText);
    console.log("Body:", responseData);

    if (response.ok) {
      console.log("\n✨ Webhook sent successfully!");
    } else {
      console.log("\n⚠️  Webhook failed with status:", response.status);
    }
  } catch (error) {
    console.error("\n❌ Error sending webhook:", error.message);
  }
}

async function testInvalidSignature() {
  const payload = samplePayloads["currency.order.purchased"];
  const invalidSignature = "invalid_signature_12345";

  console.log("\n🧪 Testing invalid signature...");

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "GameBoost Server",
        Signature: invalidSignature,
      },
      body: JSON.stringify(payload),
    });

    console.log("Status:", response.status);

    if (response.status === 401) {
      console.log("✅ Invalid signature correctly rejected");
    } else {
      console.log("⚠️  Expected 401, got:", response.status);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function testDuplicate(eventType) {
  console.log("\n🔄 Testing duplicate webhook...");

  await sendWebhook(eventType);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("\n🔄 Sending duplicate...");
  await sendWebhook(eventType);
}

/**
 * Send all webhook types
 */
async function testAll() {
  console.log("\n🧪 Testing all webhook types...\n");

  for (const eventType of Object.keys(samplePayloads)) {
    await sendWebhook(eventType);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

const args = process.argv.slice(2);
const command = args[0];
const eventType = args[1] || "currency.order.purchased";

async function main() {
  console.log("🎮 GameBoost Webhook Tester");
  console.log("================================");

  switch (command) {
    case "send":
      await sendWebhook(eventType);
      break;

    case "invalid":
      await testInvalidSignature();
      break;

    case "duplicate":
      await testDuplicate(eventType);
      break;

    case "all":
      await testAll();
      break;

    default:
      console.log("\nUsage:");
      console.log("  node test-webhook.js send [event-type]");
      console.log("  node test-webhook.js invalid");
      console.log("  node test-webhook.js duplicate [event-type]");
      console.log("  node test-webhook.js all");
      console.log("\nAvailable event types:");
      Object.keys(samplePayloads).forEach((type) => {
        console.log("  -", type);
      });
      console.log("\nExamples:");
      console.log("  node test-webhook.js send currency.order.purchased");
      console.log("  node test-webhook.js all");
      console.log("  node test-webhook.js duplicate");
      process.exit(1);
  }
}

main().catch(console.error);
