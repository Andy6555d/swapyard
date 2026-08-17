import { createClient } from '@/lib/supabase/server';
import { markSold, markReserved, relist, deleteListing } from '../actions';
import { redirect } from 'next/navigation';
import AddPhotosButton from '@/components/AddPhotosButton';

export const dynamic = 'force-dynamic';

export default async function MyListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('outlet_id', user.id)
    .order('created_at', { ascending: false });

  const items = listings ?? [];
  const activeCount = items.filter((i) => i.status === 'active').length;
  const reservedCount = items.filter((i) => i.status === 'reserved').length;
  const soldCount = items.filter((i) => i.status === 'sold').length;

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>My Listings</h1>
        <span className="sub">{activeCount} ACTIVE · {reservedCount} RESERVED · {soldCount} SOLD</span>
      </div>

      {items.length === 0 ? (
        <div className="empty">
          You haven&apos;t listed anything yet. <a href="/list" className="contact-link">List your first item →</a>
        </div>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <div className="card" key={item.id}>
              <div className={`tag ${item.status !== 'active' ? 'sold' : ''}`}>
                €{Number(item.price).toLocaleString()}
              </div>
              <div className="card-media">
                {item.status !== 'active' && (
                  <div className={`status-stamp ${item.status}`}>
                    {item.status === 'reserved' ? 'RESERVED' : 'SOLD'}
                  </div>
                )}
                {item.image_urls?.[0] ? (
                  <img src={item.image_urls[0]} alt={item.title} loading="lazy" />
                ) : (
                  <span className="placeholder">{item.category}</span>
                )}
              </div>
              <div className="card-body">
                <div className="card-cat">{item.category}</div>
                <p className="card-title">{item.title}</p>
                <p className="card-desc">{item.description}</p>
                {item.quantity && <p className="card-meta">Quantity: {item.quantity}</p>}
                <div className="card-foot" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                  <AddPhotosButton listingId={item.id} currentCount={item.image_urls?.length ?? 0} />
                  {item.status === 'active' && (
                    <>
                      <form action={markReserved}>
                        <input type="hidden" name="listingId" value={item.id} />
                        <button type="submit" className="btn btn-ghost btn-sm">Mark Reserved</button>
                      </form>
                      <form action={markSold}>
                        <input type="hidden" name="listingId" value={item.id} />
                        <button type="submit" className="btn btn-secondary btn-sm">Mark as Sold</button>
                      </form>
                    </>
                  )}
                  {item.status === 'reserved' && (
                    <>
                      <form action={markSold}>
                        <input type="hidden" name="listingId" value={item.id} />
                        <button type="submit" className="btn btn-secondary btn-sm">Mark as Sold</button>
                      </form>
                      <form action={relist}>
                        <input type="hidden" name="listingId" value={item.id} />
                        <button type="submit" className="btn btn-ghost btn-sm">Relist</button>
                      </form>
                    </>
                  )}
                  {item.status === 'sold' && (
                    <form action={relist}>
                      <input type="hidden" name="listingId" value={item.id} />
                      <button type="submit" className="btn btn-ghost btn-sm">Relist</button>
                    </form>
                  )}
                  <form action={deleteListing}>
                    <input type="hidden" name="listingId" value={item.id} />
                    <button type="submit" className="btn btn-danger btn-sm">Delete</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
