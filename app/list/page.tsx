import { createClient } from '@/lib/supabase/server';
import ListStockForm from './ListStockForm';

export const dynamic = 'force-dynamic';

export default async function ListStockPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultCounty = '';
  let hasPhone = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('county, contact_phone')
      .eq('id', user.id)
      .single();
    defaultCounty = profile?.county ?? '';
    hasPhone = !!profile?.contact_phone;
  }

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>List Surplus Stock</h1>
        <span className="sub">TAKES ~2 MINUTES</span>
      </div>
      <div style={{ maxWidth: 560 }}>
        <ListStockForm defaultCounty={defaultCounty} hasPhone={hasPhone} />
      </div>
    </div>
  );
}
