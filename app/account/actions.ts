'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function updateBuyingGroup(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const buyingGroup = formData.get('buyingGroup') as string;

  await supabase
    .from('profiles')
    .update({ buying_group: buyingGroup === 'none' ? null : buyingGroup })
    .eq('id', user.id);

  revalidatePath('/account');
  redirect('/account?saved=true');
}
