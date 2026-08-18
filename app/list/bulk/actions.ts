'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { CATEGORIES, COUNTIES } from '@/lib/constants';
import { notifyMatchingSubscribers } from '@/lib/notifySubscribers';

type BulkRow = {
  title: string;
  description: string;
  category: string;
  county: string;
  quantity: string;
  price: string;
  preferredContact: string;
  visibility: string;
};

export async function createBulkListings(rows: BulkRow[], fallbackCounty: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('contact_phone, outlet_name, buying_group')
    .eq('id', user.id)
    .single();
  const hasPhone = !!profile?.contact_phone;
  const outletName = profile?.outlet_name || 'An outlet';
  const buyingGroup = profile?.buying_group ?? null;

  const validRows = rows.filter((r) => {
    const priceNum = Number(r.price);
    return (
      r.title?.trim() &&
      r.description?.trim() &&
      CATEGORIES.includes(r.category?.trim()) &&
      COUNTIES.includes(r.county?.trim()) &&
      !isNaN(priceNum) &&
      priceNum >= 0
    );
  });

  if (validRows.length === 0) {
    return { success: false, count: 0 };
  }

  const toInsert = validRows.map((r) => {
    const contact = ['email', 'phone', 'both'].includes(r.preferredContact)
      ? r.preferredContact
      : 'email';
    const safeContact = (contact === 'phone' || contact === 'both') && !hasPhone ? 'email' : contact;
    const visibility = r.visibility === 'group' && buyingGroup ? 'group' : 'all';

    return {
      outlet_id: user.id,
      title: r.title.trim(),
      description: r.description.trim(),
      category: r.category.trim(),
      county: r.county.trim() || fallbackCounty,
      quantity: r.quantity?.trim() || null,
      price: Number(r.price),
      preferred_contact: safeContact,
      visibility,
      image_urls: [],
    };
  });

  const { data: inserted, error } = await supabase
    .from('listings')
    .insert(toInsert)
    .select('id, category, county, title, visibility');

  if (error || !inserted) {
    return { success: false, count: 0 };
  }

  const groups = new Map<string, { category: string; county: string; visibility: string; count: number }>();
  for (const listing of inserted) {
    const key = `${listing.category}|${listing.county}|${listing.visibility}`;
    const existing = groups.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      groups.set(key, { category: listing.category, county: listing.county, visibility: listing.visibility, count: 1 });
    }
  }

  await Promise.all(
    Array.from(groups.values()).map((g) =>
      notifyMatchingSubscribers({
        category: g.category,
        county: g.county,
        title: `${outletName} added ${g.count} ${g.category} item${g.count > 1 ? 's' : ''}`,
        excludeOutletId: user.id,
        url: `/browse`,
        visibility: g.visibility,
        posterBuyingGroup: buyingGroup,
      }).catch(() => {})
    )
  );

  revalidatePath('/');
  revalidatePath('/my-listings');

  return { success: true, count: inserted.length };
}
