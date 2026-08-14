import { createClient } from '@/lib/supabase/server';
import { createRequest, markRequestFulfilled, deleteRequest } from '../actions';
import { CATEGORY_GROUPS, UNGROUPED_CATEGORIES, COUNTIES } from '@/lib/constants';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('county')
    .eq('id', user.id)
    .single();

  const { data: requests } = await supabase
    .from('requests')
    .select('*, profiles(outlet_name, contact_email)')
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Requests</h1>
        <span className="sub">{requests?.length ?? 0} OPEN REQUESTS</span>
      </div>

      {params.error && <div className="error-box">{params.error}</div>}

      <div className="request-box">
        <h2 className="admin-section-title">Ask if anyone has it</h2>
        <p className="request-box-sub">
          Looking for something you can&apos;t find listed? Post it here — other outlets will see it and can get in touch if they have it.
        </p>
        <form action={createRequest}>
          <div className="field">
            <label htmlFor="title">What are you looking for?</label>
            <input type="text" id="title" name="title" placeholder="e.g. Surplus 100mm dense blocks, any quantity" required />
          </div>
          <div className="field">
            <label htmlFor="description">More detail (optional)</label>
            <textarea id="description" name="description" placeholder="Quantity needed, timeframe, anything else useful..." />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" required defaultValue="">
                <option value="" disabled>Select category</option>
                {CATEGORY_GROUPS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </optgroup>
                ))}
                {UNGROUPED_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="county">Your county</label>
              <select id="county" name="county" required defaultValue={profile?.county ?? ''}>
                <option value="" disabled>Select county</option>
                {COUNTIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Post Request</button>
        </form>
      </div>

      <h2 className="admin-section-title" style={{ marginTop: '36px' }}>Open Requests</h2>
      {(requests ?? []).length === 0 ? (
        <div className="empty">No open requests right now.</div>
      ) : (
        <div className="grid">
          {(requests ?? []).map((r: any) => (
            <div className="card" key={r.id}>
              <div className="card-body">
                <div className="card-cat">{r.category}</div>
                <p className="card-title">{r.title}</p>
                {r.description && <p className="card-desc">{r.description}</p>}
                <div className="card-foot">
                  <span className="stamp">{r.profiles?.outlet_name ?? 'Outlet'} · {r.county}</span>
                  {r.outlet_id === user.id ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <form action={markRequestFulfilled}>
                        <input type="hidden" name="requestId" value={r.id} />
                        <button type="submit" className="btn btn-secondary btn-sm">Fulfilled</button>
                      </form>
                      <form action={deleteRequest}>
                        <input type="hidden" name="requestId" value={r.id} />
                        <button type="submit" className="btn btn-danger btn-sm">Delete</button>
                      </form>
                    </div>
                  ) : (
                    <a className="contact-link" href={`mailto:${r.profiles?.contact_email}`}>
                      I have this →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
