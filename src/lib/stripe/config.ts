import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

export const COACH_SUBSCRIPTION_PRICE = 3000; // €30 in cents
export const TRIAL_DAYS = 30;
