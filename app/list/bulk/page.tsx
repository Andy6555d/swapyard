import { createClient } from '@/lib/supabase/server';
import BulkUploadForm from '@/components/BulkUploadForm';

export const dynamic = 'force-dynamic';

export default async function BulkUploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultCounty = '';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('county')
      .eq('id', user.id)
      .single();
    defaultCounty = profile?.county ?? '';
  }

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Bulk Upload Stock</h1>
        <span className="sub">FOR MULTIPLE ITEMS AT ONCE</span>
      </div>
      <p style={{ maxWidth: 560, color: 'var(--steel)', fontSize: '13.5px', marginBottom: '24px' }}>
        Got a lot to list at once? Fill in the spreadsheet template and upload it here to publish
        several listings in one go. Once they&apos;re live, add photos to each from your phone
        directly in My Listings.
      </p>
      <div style={{ maxWidth: 640 }}>
        <BulkUploadForm defaultCounty={defaultCounty} />
      </div>
      <p style={{ marginTop: '24px' }}>
        <a href="/list" className="contact-link">Prefer to list one item at a time? →</a>
      </p>
    </div>
  );
}
