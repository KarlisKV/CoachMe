import { stripe } from '@/lib/stripe/config';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const coachId = session.metadata?.coach_id;

        if (coachId) {
          // Determine if trial or active
          const subscriptionStatus = session.subscription ? 'trial' : 'active';

          await supabase
            .from('coach_profiles')
            .update({
              subscription_status: subscriptionStatus,
              stripe_subscription_id: session.subscription,
            })
            .eq('id', coachId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const coachId = subscription.metadata?.coach_id;

        if (coachId) {
          let status = 'active';
          if (subscription.status === 'trialing') {
            status = 'trial';
          } else if (subscription.status === 'cancelled' || subscription.status === 'past_due') {
            status = 'cancelled';
          }

          const endsAt = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null;

          await supabase
            .from('coach_profiles')
            .update({
              subscription_status: status,
              subscription_ends_at: endsAt,
            })
            .eq('id', coachId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const coachId = subscription.metadata?.coach_id;

        if (coachId) {
          await supabase
            .from('coach_profiles')
            .update({
              subscription_status: 'cancelled',
            })
            .eq('id', coachId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        // Keep subscription active on successful payment
        // This is handled by Stripe automatically
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        // Log failed payment but don't immediately cancel subscription
        // Stripe will handle retries automatically
        console.log('Payment failed for invoice:', invoice.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
