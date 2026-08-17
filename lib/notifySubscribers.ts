import { createAdminClient } from '@/lib/supabase/admin';
import webpush from '@/lib/webpush';

type NotifyParams = {
  category: string;
  county: string;
  title: string;
  excludeOutletId: string;
  url: string;
};

export async function notifyMatchingSubscribers({
  category,
  county,
  title,
  excludeOutletId,
  url,
}: NotifyParams) {
  const admin = createAdminClient();

  // Find outlets who want push notifications and whose preferences match
  const { data: matchingOutlets } = await admin
    .from('profiles')
    .select('id, notify_categories, notify_county_only, county')
    .eq('push_enabled', true)
    .neq('id', excludeOutletId);

  if (!matchingOutlets || matchingOutlets.length === 0) return;

  const outletIds = matchingOutlets
    .filter((o) => {
      const categoryOk = !o.notify_categories?.length || o.notify_categories.includes(category);
      const countyOk = !o.notify_county_only || o.county === county;
      return categoryOk && countyOk;
    })
    .map((o) => o.id);

  if (outletIds.length === 0) return;

  const { data: subscriptions } = await admin
    .from('push_subscriptions')
    .select('*')
    .in('outlet_id', outletIds);

  if (!subscriptions) return;

  const payload = JSON.stringify({ title, url });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
      } catch (err: any) {
        // 410 Gone / 404 means the subscription is dead — clean it up
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await admin.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    })
  );
}
