import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;

    if (!webhookUrl) {
      // Silently skip if webhook URL not configured (dev environment)
      return NextResponse.json({ sent: false, reason: 'No webhook URL configured' });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        source: 'avenue-z-signal',
        timestamp: new Date().toISOString(),
      }),
    });

    return NextResponse.json({
      sent: true,
      status: response.status
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({
      sent: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
