import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createCheckoutSession, createPortalSession } from './actions';

export const dynamic = 'force-dynamic';

export default async function SubscribePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_current_period_end, is_admin')
    .eq('id', user.id)
    .single();

  const status = profile?.subscription_status ?? 'inactive';
  const isActive = status === 'active' || status === 'comp' || profile?.is_admin;
  const periodEnd = profile?.subscription_current_period_end
    ? new Date(profile.subscription_current_period_end).toLocaleDateString('en-IE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Billing</h1>
      </div>

      <div className="auth-shell">
        {isActive ? (
          <>
            <h1>You&apos;re subscribed</h1>
            <p className="sub">
              {status === 'comp'
                ? 'You have free access granted by the platform admin.'
                : profile?.is_admin
                ? 'Admin accounts have full access.'
                : periodEnd
                ? `Your subscription renews on ${periodEnd}.`
                : 'Your subscription is active.'}
            </p>
            {status === 'active' && (
              <form action={createPortalSession}>
                <button type="submit" className="btn btn-secondary btn-full">
                  Manage Billing
                </button>
              </form>
            )}
          </>
        ) : (
          <>
            <h1>Subscribe to SwapYard</h1>
            <p className="sub">
              {status === 'past_due'
                ? 'Your last payment didn\u2019t go through — update your card to keep access.'
                : status === 'canceled'
                ? 'Your subscription has ended. Resubscribe to regain access.'
                : 'Full access to list stock, browse, and post requests — €200/year.'}
            </p>
            <form action={createCheckoutSession}>
              <button type="submit" className="btn btn-primary btn-full">
                Subscribe — €200/year
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
              <a href="/faq" className="contact-link">Got questions first? Read the FAQ →</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
