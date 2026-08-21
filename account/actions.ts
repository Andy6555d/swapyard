'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { BUYING_GROUPS } from '@/lib/constants';

export async function updateBuyingGroup(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const buyingGroup = formData.get('buyingGroup') as string;
  const newValue = buyingGroup !== 'none' && BUYING_GROUPS.includes(buyingGroup) ? buyingGroup : null;

  const { data: current } = await supabase
    .from('profiles')
    .select('buying_group')
    .eq('id', user.id)
    .single();

  // Any actual change to the claimed group resets verification.
  // Setting it back to the exact same value doesn't re-trigger review.
  const changed = current?.buying_group !== newValue;

  await supabase
    .from('profiles')
    .update({
      buying_group: newValue,
      ...(changed ? { buying_group_verified: false } : {}),
    })
    .eq('id', user.id);

  revalidatePath('/account');
  redirect('/account?saved=true');
}
