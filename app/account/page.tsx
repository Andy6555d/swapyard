import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { updateBuyingGroup } from './actions';
import { BUYING_GROUPS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('outlet_name, county, buying_group, buying_group_verified')
    .eq('id', user.id)
    .single();

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Account</h1>
      </div>

      {params.saved && <div className="success-box">Saved</div>}

      <div style={{ maxWidth: 560 }}>
        <div className="request-box">
          <h2 className="admin-section-title">Buying Group</h2>
          <p className="request-box-sub">
            We ask so you can choose, listing by listing, whether to share with everyone on
            SwapYard or keep something just within your own buying group. Group claims are
            reviewed before they unlock group-only sharing, so it can take a short while after
            you set or change this before that option becomes available.
          </p>

          {profile?.buying_group && (
            <p style={{ marginBottom: '14px' }}>
              {profile.buying_group_verified ? (
                <span className="billing-badge billing-active">Verified ✓</span>
              ) : (
                <span className="billing-badge billing-past_due">Pending verification</span>
              )}
            </p>
          )}

          <form action={updateBuyingGroup}>
            <div className="field">
              <label htmlFor="buyingGroup">Your buying group</label>
              <select id="buyingGroup" name="buyingGroup" defaultValue={profile?.buying_group || 'none'}>
                <option value="none">None / Independent</option>
                {BUYING_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Save</button>
          </form>
        </div>

        <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--steel)' }}>
          Outlet: {profile?.outlet_name} &middot; {profile?.county}
        </p>
      </div>
    </div>
  );
}
