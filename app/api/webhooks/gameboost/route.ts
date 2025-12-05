import { isWebhookProcessed, logWebhook, markWebhookProcessed, storeFailedWebhook, verifyWebhookSignature } from "@/app/helper/verify-webhook-signature";
import { WEBHOOK_SECRET } from "@/app/lib/config";
import { GameBoostWebhook } from "@/app/types/event-payload";
import { NextRequest, NextResponse } from "next/server";
import { processWebhook } from "./webhook-event";

export async function POST(request: NextRequest) {
  try {
    if (!WEBHOOK_SECRET) {
      console.error('Webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const userAgent = request.headers.get('user-agent');
    if (userAgent !== 'GameBoost Server') {
      console.warn('Invalid User-Agent:', userAgent);
      return NextResponse.json(
        { error: 'Invalid User-Agent' },
        { status: 401 }
      );
    }

    const signature = request.headers.get('signature');
    if (!signature) {
      console.warn('Missing signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const rawBody = await request.text();
    
    if (!verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET)) {
      console.warn('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const webhook: GameBoostWebhook = JSON.parse(rawBody);

    logWebhook(webhook);

    if (isWebhookProcessed(webhook.event, webhook.payload.id)) {
      console.log(`Webhook already processed (retry): ${webhook.event}_${webhook.payload.id}`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const response = NextResponse.json({ received: true }, { status: 200 });

    setImmediate(async () => {
      try {
        await processWebhook(webhook);
        markWebhookProcessed(webhook.event, webhook.payload.id);
        console.log(`✅ Webhook processed successfully: ${webhook.event}_${webhook.payload.id}`);
      } catch (error) {
        console.error('Webhook processing failed:', error);
        await storeFailedWebhook(webhook, error as Error);
      }
    });

    return response;

  } catch (error) {
    console.error('Webhook handler error:', error);
    
    return NextResponse.json(
      { received: true, error: 'Internal error' },
      { status: 200 }
    );
  }
}


export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}