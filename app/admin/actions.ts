'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function requireAdmin(): Promise<string> {
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

  return user.id;
}

async function logAdminAction(
  adminId: string,
  action: string,
  targetOutletId: string | null,
  detail: string | null = null
) {
  const admin = createAdminClient();
  await admin.from('admin_action_log').insert({
    admin_id: adminId,
    action,
    target_outlet_id: targetOutletId,
    detail,
  });
}

export async function adminSetPassword(formData: FormData) {
  const adminId = await requireAdmin();
  const outletId = formData.get('outletId') as string;
  const newPassword = formData.get('newPassword') as string;

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(outletId, {
    password: newPassword,
  });

  if (error) {
    redirect('/admin?error=' + encodeURIComponent(error.message));
  }

  await logAdminAction(adminId, 'set_password', outletId);
  revalidatePath('/admin');
  redirect('/admin?success=' + encodeURIComponent('Password updated'));
}

export async function adminSendResetEmail(formData: FormData) {
  const adminId = await requireAdmin();
  const email = formData.get('email') as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    redirect('/admin?error=' + encodeURIComponent(error.message));
  }

  await logAdminAction(adminId, 'send_reset_email', null, email);
  revalidatePath('/admin');
  redirect('/admin?success=' + encodeURIComponent('Reset email sent to ' + email));
}

export async function adminDeleteOutlet(formData: FormData) {
  const adminId = await requireAdmin();
  const outletId = formData.get('outletId') as string;

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(outletId);

  if (error) {
    redirect('/admin?error=' + encodeURIComponent(error.message));
  }

  await logAdminAction(adminId, 'delete_outlet', outletId);
  revalidatePath('/admin');
  redirect('/admin?success=' + encodeURIComponent('Outlet removed'));
}

export async function adminDeleteListing(formData: FormData) {
  const adminId = await requireAdmin();
  const listingId = formData.get('listingId') as string;

  const admin = createAdminClient();
  await admin.from('listings').delete().eq('id', listingId);

  await logAdminAction(adminId, 'delete_listing', null, listingId);
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function adminGrantAccess(formData: FormData) {
  const adminId = await requireAdmin();
  const outletId = formData.get('outletId') as string;

  const admin = createAdminClient();
  await admin.from('profiles').update({ subscription_status: 'comp' }).eq('id', outletId);

  await logAdminAction(adminId, 'grant_comp_access', outletId);
  revalidatePath('/admin');
}

export async function adminVerifyBuyingGroup(formData: FormData) {
  const adminId = await requireAdmin();
  const outletId = formData.get('outletId') as string;

  const admin = createAdminClient();
  await admin.from('profiles').update({ buying_group_verified: true }).eq('id', outletId);

  await logAdminAction(adminId, 'verify_buying_group', outletId);
  revalidatePath('/admin');
}

export async function adminMarkReportReviewed(formData: FormData) {
  const adminId = await requireAdmin();
  const reportId = formData.get('reportId') as string;

  const admin = createAdminClient();
  await admin.from('content_reports').update({ status: 'reviewed' }).eq('id', reportId);

  await logAdminAction(adminId, 'mark_report_reviewed', null, reportId);
  revalidatePath('/admin');
}

export async function adminDismissReport(formData: FormData) {
  const adminId = await requireAdmin();
  const reportId = formData.get('reportId') as string;

  const admin = createAdminClient();
  await admin.from('content_reports').update({ status: 'dismissed' }).eq('id', reportId);

  await logAdminAction(adminId, 'dismiss_report', null, reportId);
  revalidatePath('/admin');
}

export async function adminUnverifyBuyingGroup(formData: FormData) {
  const adminId = await requireAdmin();
  const outletId = formData.get('outletId') as string;

  const admin = createAdminClient();
  await admin.from('profiles').update({ buying_group_verified: false }).eq('id', outletId);

  await logAdminAction(adminId, 'unverify_buying_group', outletId);
  revalidatePath('/admin');
}

export async function adminRevokeAccess(formData: FormData) {
  const adminId = await requireAdmin();
  const outletId = formData.get('outletId') as string;

  const admin = createAdminClient();
  await admin.from('profiles').update({ subscription_status: 'inactive' }).eq('id', outletId);

  await logAdminAction(adminId, 'revoke_access', outletId);
  revalidatePath('/admin');
}
