import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  adminSetPassword,
  adminSendResetEmail,
  adminDeleteOutlet,
  adminDeleteListing,
  adminGrantAccess,
  adminRevokeAccess,
} from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!myProfile?.is_admin) redirect('/');

  const { data: outlets } = await supabase.from('profiles').select('*').order('outlet_name');
  const { data: listings } = await supabase
    .from('listings')
    .select('*, profiles(outlet_name)')
    .order('created_at', { ascending: false });
  const { data: requests } = await supabase.from('requests').select('status, fulfilled_via_swapyard');

  const confirmedSales = (listings ?? []).filter((l) => l.status === 'sold' && l.sold_via_swapyard === true);
  const confirmedValue = confirmedSales.reduce((sum, l) => sum + Number(l.price || 0), 0);
  const confirmedRequestsFulfilled = (requests ?? []).filter(
    (r) => r.status === 'fulfilled' && r.fulfilled_via_swapyard === true
  ).length;

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Admin</h1>
        <span className="sub">
          {outlets?.length ?? 0} OUTLETS · {listings?.length ?? 0} LISTINGS
        </span>
      </div>

      {params.error && <div className="error-box">{params.error}</div>}
      {params.success && <div className="success-box">{params.success}</div>}

      <h2 className="admin-section-title">Confirmed Outcomes</h2>
      <div className="admin-table-wrap" style={{ padding: '20px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div>
            <div className="calc-result-line" style={{ color: 'var(--steel)' }}>Stock value moved through SwapYard</div>
            <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: '28px', color: 'var(--amber-dark)' }}>
              €{confirmedValue.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="calc-result-line" style={{ color: 'var(--steel)' }}>Confirmed transactions</div>
            <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: '28px', color: 'var(--ink)' }}>
              {confirmedSales.length}
            </div>
          </div>
          <div>
            <div className="calc-result-line" style={{ color: 'var(--steel)' }}>Requests fulfilled via SwapYard</div>
            <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: '28px', color: 'var(--ink)' }}>
              {confirmedRequestsFulfilled}
            </div>
          </div>
        </div>
      </div>

      <h2 className="admin-section-title">Outlets</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Outlet</th>
              <th>County</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Billing</th>
              <th>Password</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(outlets ?? []).map((o) => (
              <tr key={o.id}>
                <td>
                  {o.outlet_name}
                  {o.is_admin && <span className="admin-badge">ADMIN</span>}
                </td>
                <td>{o.county}</td>
                <td>{o.contact_email}</td>
                <td>{o.contact_phone || '—'}</td>
                <td>
                  <span className={`billing-badge billing-${o.subscription_status || 'inactive'}`}>
                    {o.is_admin ? 'admin' : o.subscription_status || 'inactive'}
                  </span>
                  {!o.is_admin && (
                    <div className="admin-inline-form" style={{ marginTop: '6px' }}>
                      {o.subscription_status !== 'active' && o.subscription_status !== 'comp' && (
                        <form action={adminGrantAccess}>
                          <input type="hidden" name="outletId" value={o.id} />
                          <button type="submit" className="btn btn-ghost btn-sm">Grant free access</button>
                        </form>
                      )}
                      {o.subscription_status === 'comp' && (
                        <form action={adminRevokeAccess}>
                          <input type="hidden" name="outletId" value={o.id} />
                          <button type="submit" className="btn btn-ghost btn-sm">Revoke</button>
                        </form>
                      )}
                    </div>
                  )}
                </td>
                <td>
                  <form action={adminSetPassword} className="admin-inline-form">
                    <input type="hidden" name="outletId" value={o.id} />
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="New password"
                      minLength={6}
                      required
                      className="admin-mini-input"
                    />
                    <button type="submit" className="btn btn-secondary btn-sm">
                      Set
                    </button>
                  </form>
                  <form action={adminSendResetEmail} className="admin-inline-form" style={{ marginTop: '6px' }}>
                    <input type="hidden" name="email" value={o.contact_email} />
                    <button type="submit" className="btn btn-ghost btn-sm">
                      Email reset link
                    </button>
                  </form>
                </td>
                <td>
                  {!o.is_admin && (
                    <form action={adminDeleteOutlet}>
                      <input type="hidden" name="outletId" value={o.id} />
                      <button type="submit" className="btn btn-danger btn-sm">
                        Remove
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="admin-section-title" style={{ marginTop: '36px' }}>All Listings</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Outlet</th>
              <th>Status</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(listings ?? []).map((l: any) => (
              <tr key={l.id}>
                <td>{l.title}</td>
                <td>{l.profiles?.outlet_name ?? '—'}</td>
                <td>{l.status}</td>
                <td>€{Number(l.price).toLocaleString()}</td>
                <td>
                  <form action={adminDeleteListing}>
                    <input type="hidden" name="listingId" value={l.id} />
                    <button type="submit" className="btn btn-danger btn-sm">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
