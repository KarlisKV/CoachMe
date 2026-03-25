'use server';

import { createClient } from '@/lib/supabase/server';
import { stripe, COACH_SUBSCRIPTION_PRICE, TRIAL_DAYS } from '@/lib/stripe/config';
import { revalidatePath } from 'next/cache';

export async function createCheckoutSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get coach profile to check if they have a customer ID
  const { data: coachProfile } = await supabase
    .from('coach_profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  try {
    let customerId = coachProfile?.stripe_customer_id;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          coach_id: user.id,
        },
      });
      customerId = customer.id;

      // Update coach profile with customer ID
      await supabase
        .from('coach_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_COACH_PRICE_ID!,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: {
          coach_id: user.id,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/coach/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/coach/subscription?success=false`,
    });

    return { success: true, sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Checkout error:', error);
    return { error: 'Failed to create checkout session' };
  }
}

export async function createBillingPortalSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: coachProfile } = await supabase
    .from('coach_profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!coachProfile?.stripe_customer_id) {
    return { error: 'No billing information found' };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: coachProfile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/coach/subscription`,
    });

    return { success: true, url: session.url };
  } catch (error) {
    console.error('Billing portal error:', error);
    return { error: 'Failed to create billing portal session' };
  }
}

export async function getSubscriptionStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: coachProfile } = await supabase
    .from('coach_profiles')
    .select('subscription_status, stripe_subscription_id, subscription_ends_at')
    .eq('id', user.id)
    .single();

  if (!coachProfile) {
    return { error: 'Coach profile not found' };
  }

  return {
    status: coachProfile.subscription_status,
    subscriptionId: coachProfile.stripe_subscription_id,
    endsAt: coachProfile.subscription_ends_at,
  };
}
