import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export const isStripeConfigured = () => {
  return (
    stripeSecretKey &&
    stripeSecretKey !== '' &&
    stripeSecretKey.startsWith('sk_')
  );
};

export const stripe = isStripeConfigured()
  ? new Stripe(stripeSecretKey, { apiVersion: '2024-12-18.acacia' })
  : null;
