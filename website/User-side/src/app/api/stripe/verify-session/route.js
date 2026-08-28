import { NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '@/lib/stripe';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    if (isStripeConfigured()) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return NextResponse.json({
        status: session.payment_status,
        customer_email: session.customer_details?.email,
        amount_total: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency,
        metadata: session.metadata,
      });
    } else {
      return NextResponse.json({
        status: 'paid',
        customer_email: 'test.customer@bavi.in',
        amount_total: 4500000,
        currency: 'inr',
        simulated: true,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
