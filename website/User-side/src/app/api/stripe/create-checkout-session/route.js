import { NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '@/lib/stripe';

export async function POST(request) {
  try {
    const body = await request.json();
    const { milestoneId, amount, milestoneTitle, customerEmail } = body;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      return NextResponse.json(
        { error: 'Server configuration error: NEXT_PUBLIC_SITE_URL is not set.' },
        { status: 500 }
      );
    }

    if (isStripeConfigured()) {
      // Create actual Stripe Checkout Session in Test Mode
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: milestoneTitle || 'BAVI Construction Milestone',
                description: `Payment for Milestone ID: ${milestoneId}`,
              },
              unit_amount: Math.round(Number(amount) * 100), // in paise
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${siteUrl}/dashboard/payments?session_id={CHECKOUT_SESSION_ID}&status=success&milestone=${milestoneId}`,
        cancel_url: `${siteUrl}/dashboard/payments?status=cancelled`,
        customer_email: customerEmail || undefined,
        metadata: {
          milestoneId: String(milestoneId),
        },
      });

      return NextResponse.json({ sessionId: session.id, url: session.url });
    } else {
      // Fallback Test Mode simulation for immediate testing without API key setup
      const simulatedSessionId = 'cs_test_' + Date.now() + '_' + Math.random().toString(36).substring(7);
      return NextResponse.json({
        sessionId: simulatedSessionId,
        url: `${siteUrl}/dashboard/payments?session_id=${simulatedSessionId}&status=success&milestone=${milestoneId}`,
        simulated: true,
        message: 'Stripe Test Mode Simulator Active'
      });
    }
  } catch (error) {
    console.error('Stripe Session Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize Stripe checkout session' },
      { status: 500 }
    );
  }
}
