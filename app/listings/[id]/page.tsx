import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ContactReveal from '@/components/ContactReveal';

export const dynamic = 'force-dynamic';

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from('listings')
    .select('*, profiles(outlet_name, county, contact_email, contact_phone)')
    .eq('id', id)
    .single();

  if (!listing) notFound();

  const outlet = listing.profiles as any;
  const photos: string[] = listing.image_urls ?? [];

  return (
    <div className="wrap page">
      <a href="/browse" className="back-link">← Back to Browse</a>

      <div className="listing-detail">
        <div className="listing-gallery">
          {listing.status !== 'active' && (
            <div className={`status-stamp detail-stamp ${listing.status}`}>
              {listing.status === 'reserved' ? 'RESERVED' : 'SOLD'}
            </div>
          )}
          {photos.length > 0 ? (
            <div className="gallery-grid">
              {photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="gallery-item">
                  <img src={url} alt={`${listing.title} — photo ${i + 1}`} loading="lazy" />
                </a>
              ))}
            </div>
          ) : (
            <div className="gallery-empty">No photos provided</div>
          )}
        </div>

        <div className="listing-info">
          <div className="tag" style={{ position: 'static', display: 'inline-flex', transform: 'none', marginBottom: '14px' }}>
            €{Number(listing.price).toLocaleString()}
          </div>
          <div className="card-cat">{listing.category}</div>
          <h1>{listing.title}</h1>
          {listing.quantity && <p className="card-meta">Quantity: {listing.quantity}</p>}
          <p className="listing-desc">{listing.description}</p>

          <div className="listing-contact">
            <span className="stamp">{outlet?.outlet_name ?? 'Outlet'} · {listing.county}</span>
            <ContactReveal
              email={outlet?.contact_email}
              phone={outlet?.contact_phone}
              preferredContact={listing.preferred_contact ?? 'email'}
              listingId={listing.id}
              revealClassName="btn btn-primary btn-sm"
              revealLabel="Show contact details"
              emailClassName="btn btn-secondary btn-sm"
              phoneClassName="btn btn-primary btn-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
