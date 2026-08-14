import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: activeCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { data: outletRows } = await supabase.from('profiles').select('county');
  const outletCount = outletRows?.length ?? 0;
  const countyCount = new Set((outletRows ?? []).map((o) => o.county)).size;

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow">Independent merchants only · No fees on trades · No middleman</div>
            <h1>Move your aged stock<br />to a merchant who needs it.</h1>
            <p className="lede">
              SwapYard is a noticeboard for independent merchants to move surplus and end-of-line stock.
              List it, a nearby merchant buys it, you deliver it — no commission, no public listing.
            </p>
            <div className="hero-ctas">
              {user ? (
                <a href="/browse" className="btn btn-primary">Browse Stock</a>
              ) : (
                <>
                  <a href="/signup" className="btn btn-primary">Register Your Outlet</a>
                  <a href="/login" className="btn btn-ghost">Log In</a>
                </>
              )}
            </div>
          </div>
          <div className="ticker">
            <div className="ticker-row"><span className="k">Active listings</span><span className="v">{activeCount ?? 0}</span></div>
            <div className="ticker-row"><span className="k">Outlets registered</span><span className="v">{outletCount}</span></div>
            <div className="ticker-row"><span className="k">Counties covered</span><span className="v">{countyCount}</span></div>
            <div className="ticker-row"><span className="k">Platform fee</span><span className="v">€200.00 / year</span></div>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className="page-head" style={{ marginTop: '44px' }}>
          <h1>How it Works</h1>
        </div>
        <div className="how-grid">
          <div className="how-step">
            <div className="how-num">01</div>
            <h3>List your aged stock</h3>
            <p>Got stock you no longer need — surplus, end-of-line, or aged? Upload photos, product details, quantity, a brief description, and your asking price.</p>
          </div>
          <div className="how-step">
            <div className="how-num">02</div>
            <h3>A fellow merchant gets in touch</h3>
            <p>Other outlets browse and search listings. If it&apos;s what they need, they reach out directly to you to organise the deal.</p>
          </div>
          <div className="how-step">
            <div className="how-num">03</div>
            <h3>Sort it between yourselves</h3>
            <p>You agree the details and deliver — that&apos;s it, done. No commission, no middleman.</p>
          </div>
          <div className="how-step">
            <div className="how-num">04</div>
            <h3>Can&apos;t find it? Ask</h3>
            <p>Post a request for what you&apos;re looking for — outlets that have it can reach out directly to you instead.</p>
          </div>
        </div>
      </section>
    </>
  );
}
