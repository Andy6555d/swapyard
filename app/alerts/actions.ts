'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function savePushSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('push_subscriptions').upsert(
    {
      outlet_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: 'endpoint' }
  );

  await supabase.from('profiles').update({ push_enabled: true }).eq('id', user.id);
  revalidatePath('/alerts');
}

export async function disablePush() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('profiles').update({ push_enabled: false }).eq('id', user.id);
  await supabase.from('push_subscriptions').delete().eq('outlet_id', user.id);
  revalidatePath('/alerts');
}

export async function updateNotificationPreferences(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const categories = formData.getAll('categories') as string[];
  const countyOnly = formData.get('countyOnly') === 'on';

  await supabase
    .from('profiles')
    .update({
      notify_categories: categories.length > 0 ? categories : null,
      notify_county_only: countyOnly,
    })
    .eq('id', user.id);

  revalidatePath('/alerts');
  redirect('/alerts?saved=true');
}
