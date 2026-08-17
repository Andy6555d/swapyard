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
};

export async function createBulkListings(rows: BulkRow[], fallbackCounty: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

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

  const toInsert = validRows.map((r) => ({
    outlet_id: user.id,
    title: r.title.trim(),
    description: r.description.trim(),
    category: r.category.trim(),
    county: r.county.trim() || fallbackCounty,
    quantity: r.quantity?.trim() || null,
    price: Number(r.price),
    preferred_contact: 'email',
    image_urls: [],
  }));

  const { data: inserted, error } = await supabase.from('listings').insert(toInsert).select('id, category, county, title');

  if (error || !inserted) {
    return { success: false, count: 0 };
  }

  await Promise.all(
    inserted.map((listing) =>
      notifyMatchingSubscribers({
        category: listing.category,
        county: listing.county,
        title: listing.title,
        excludeOutletId: user.id,
        url: `/listings/${listing.id}`,
      }).catch(() => {})
    )
  );

  revalidatePath('/');
  revalidatePath('/my-listings');

  return { success: true, count: inserted.length };
}
