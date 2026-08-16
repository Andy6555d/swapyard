import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

export const runtime = 'nodejs';

// Stripe moved current_period_end from the top-level Subscription
// object down onto each subscription item in newer API versions.
// This checks both locations so it works regardless of API version.
function getPeriodEnd(subscription: Stripe.Subscription): string | null {
  const topLevel = (subscription as any).current_period_end;
  const itemLevel = subscription.items?.data?.[0]?.current_period_end;
  const timestamp = topLevel ?? itemLevel;
  if (!timestamp) return null;
  return new Date(timestamp * 1000).toISOString();
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const outletId = session.client_reference_id;
        if (outletId && session.subscription && session.customer) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const update: Record<string, any> = {
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            subscription_status: 'active',
          };
          const periodEnd = getPeriodEnd(subscription);
          if (periodEnd) update.subscription_current_period_end = periodEnd;

          await admin.from('profiles').update(update).eq('id', outletId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const statusMap: Record<string, string> = {
          active: 'active',
          past_due: 'past_due',
          canceled: 'canceled',
          unpaid: 'past_due',
          incomplete_expired: 'canceled',
        };
        const update: Record<string, any> = {
          subscription_status: statusMap[subscription.status] ?? 'inactive',
        };
        const periodEnd = getPeriodEnd(subscription);
        if (periodEnd) update.subscription_current_period_end = periodEnd;

        await admin.from('profiles').update(update).eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await admin
          .from('profiles')
          .update({ subscription_status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
    }
  } catch (err: any) {
    console.error('Stripe webhook handler error:', err?.message);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
