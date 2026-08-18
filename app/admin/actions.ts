'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) redirect('/');
}

export async function adminSetPassword(formData: FormData) {
  await requireAdmin();
  const outletId = formData.get('outletId') as string;
  const newPassword = formData.get('newPassword') as string;

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(outletId, {
    password: newPassword,
  });

  if (error) {
    redirect('/admin?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/admin');
  redirect('/admin?success=' + encodeURIComponent('Password updated'));
}

export async function adminSendResetEmail(formData: FormData) {
  await requireAdmin();
  const email = formData.get('email') as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    redirect('/admin?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/admin');
  redirect('/admin?success=' + encodeURIComponent('Reset email sent to ' + email));
}

export async function adminDeleteOutlet(formData: FormData) {
  await requireAdmin();
  const outletId = formData.get('outletId') as string;

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(outletId);

  if (error) {
    redirect('/admin?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/admin');
  redirect('/admin?success=' + encodeURIComponent('Outlet removed'));
}

export async function adminDeleteListing(formData: FormData) {
  await requireAdmin();
  const listingId = formData.get('listingId') as string;

  const admin = createAdminClient();
  await admin.from('listings').delete().eq('id', listingId);

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function adminGrantAccess(formData: FormData) {
  await requireAdmin();
  const outletId = formData.get('outletId') as string;

  const admin = createAdminClient();
  await admin.from('profiles').update({ subscription_status: 'comp' }).eq('id', outletId);

  revalidatePath('/admin');
}

export async function adminVerifyBuyingGroup(formData: FormData) {
  await requireAdmin();
  const outletId = formData.get('outletId') as string;

  const admin = createAdminClient();
  await admin.from('profiles').update({ buying_group_verified: true }).eq('id', outletId);

  revalidatePath('/admin');
}

export async function adminUnverifyBuyingGroup(formData: FormData) {
  await requireAdmin();
  const outletId = formData.get('outletId') as string;

  const admin = createAdminClient();
  await admin.from('profiles').update({ buying_group_verified: false }).eq('id', outletId);

  revalidatePath('/admin');
}

export async function adminRevokeAccess(formData: FormData) {
  await requireAdmin();
  const outletId = formData.get('outletId') as string;

  const admin = createAdminClient();
  await admin.from('profiles').update({ subscription_status: 'inactive' }).eq('id', outletId);

  revalidatePath('/admin');
}
