import { createClient } from '@/lib/supabase/server';
import BrowseGrid from './BrowseGrid';

export default async function BrowsePage() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from('listings')
    .select('*, profiles(outlet_name, contact_email, contact_phone)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  const formatted = (listings ?? []).map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    county: item.county,
    quantity: item.quantity,
    price: item.price,
    image_urls: item.image_urls ?? [],
    status: item.status,
    outlet_name: item.profiles?.outlet_name ?? 'Outlet',
    contact_email: item.profiles?.contact_email ?? '',
    contact_phone: item.profiles?.contact_phone ?? null,
  }));

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Browse Stock</h1>
        <span className="sub">{formatted.length} ACTIVE LISTINGS</span>
      </div>
      <BrowseGrid listings={formatted} />
    </div>
  );
}
