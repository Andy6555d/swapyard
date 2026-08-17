import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { updateNotificationPreferences } from './actions';
import { CATEGORY_GROUPS, UNGROUPED_CATEGORIES } from '@/lib/constants';
import EnableNotifications from '@/components/EnableNotifications';

export const dynamic = 'force-dynamic';

export default async function AlertsPage({
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
    .select('push_enabled, notify_categories, notify_county_only, county')
    .eq('id', user.id)
    .single();

  const selectedCategories: string[] = profile?.notify_categories ?? [];

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Alerts</h1>
      </div>

      {params.saved && <div className="success-box">Preferences saved</div>}

      <div style={{ maxWidth: 560 }}>
        <div className="request-box" style={{ marginBottom: '28px' }}>
          <h2 className="admin-section-title">Push Notifications</h2>
          <p className="request-box-sub">
            Get notified the moment a new listing or request matches what you&apos;re looking for
            &mdash; even if SwapYard isn&apos;t open.
          </p>
          <EnableNotifications pushEnabled={!!profile?.push_enabled} />
        </div>

        <form action={updateNotificationPreferences}>
          <div className="field">
            <label>Only notify me about these categories</label>
            <p className="upload-status" style={{ marginBottom: '10px' }}>
              Leave everything unchecked to be notified about all categories.
            </p>
            {CATEGORY_GROUPS.map((g) => (
              <div key={g.group} style={{ marginBottom: '14px' }}>
                <div className="card-cat" style={{ marginBottom: '6px' }}>{g.group}</div>
                <div className="radio-group" style={{ flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                  {g.items.map((item) => (
                    <label className="radio-option" key={item}>
                      <input
                        type="checkbox"
                        name="categories"
                        value={item}
                        defaultChecked={selectedCategories.includes(item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="radio-group" style={{ flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
              {UNGROUPED_CATEGORIES.map((item) => (
                <label className="radio-option" key={item}>
                  <input
                    type="checkbox"
                    name="categories"
                    value={item}
                    defaultChecked={selectedCategories.includes(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="field checkbox-field">
            <label className="checkbox-label">
              <input type="checkbox" name="countyOnly" defaultChecked={!!profile?.notify_county_only} />
              <span>Only notify me about listings in {profile?.county || 'my county'}</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary">Save Preferences</button>
        </form>
      </div>
    </div>
  );
}
