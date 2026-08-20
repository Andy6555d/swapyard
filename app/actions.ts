'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { notifyMatchingSubscribers } from '@/lib/notifySubscribers';
import { sendAdminNotification } from '@/lib/sendEmail';

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const outletName = formData.get('outletName') as string;
  const county = formData.get('county') as string;
  const contactPhone = formData.get('contactPhone') as string;
  const agreeTerms = formData.get('agreeTerms');

  if (agreeTerms !== 'yes') {
    redirect('/signup?error=' + encodeURIComponent('You must agree to the Terms of Service and Privacy Policy to register.'));
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        outlet_name: outletName,
        county,
        contact_phone: contactPhone || null,
      },
    },
  });

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(error.message));
  }

  sendAdminNotification(
    'New SwapYard signup',
    `<p>New outlet registered:</p><p><strong>${outletName}</strong> (${county})<br>${email}${contactPhone ? `<br>${contactPhone}` : ''}</p>`
  ).catch(() => {});

  // If Confirm Email is on, signUp() succeeds but creates no active
  // session until the link is clicked. Send them to a clear
  // "check your email" screen instead of assuming they're logged in.
  if (!data.session) {
    redirect('/signup/check-email');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function createListing(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const county = formData.get('county') as string;
  const quantity = formData.get('quantity') as string;
  const price = parseFloat(formData.get('price') as string);
  const preferredContact = (formData.get('preferredContact') as string) || 'email';
  const requestedVisibility = (formData.get('visibility') as string) || 'all';

  const { data: ownProfile } = await supabase
    .from('profiles')
    .select('buying_group, buying_group_verified')
    .eq('id', user.id)
    .single();
  const visibility =
    requestedVisibility === 'group' && ownProfile?.buying_group && ownProfile?.buying_group_verified
      ? 'group'
      : 'all';

  let imageUrls: string[] = [];
  try {
    imageUrls = JSON.parse((formData.get('imageUrls') as string) || '[]');
  } catch {
    imageUrls = [];
  }

  const { data: newListing, error } = await supabase
    .from('listings')
    .insert({
      outlet_id: user.id,
      title,
      description,
      category,
      preferred_contact: preferredContact,
      visibility,
      county,
      quantity,
      price,
      image_urls: imageUrls,
    })
    .select('id')
    .single();

  if (error) {
    redirect('/list?error=' + encodeURIComponent(error.message));
  }

  if (newListing) {
    notifyMatchingSubscribers({
      category,
      county,
      title,
      excludeOutletId: user.id,
      url: `/listings/${newListing.id}`,
      visibility,
      posterBuyingGroup: ownProfile?.buying_group ?? null,
    }).catch(() => {});

    sendAdminNotification(
      'New SwapYard listing',
      `<p><strong>${title}</strong></p><p>Category: ${category}<br>County: ${county}<br>Price: €${price}</p>`
    ).catch(() => {});
  }

  revalidatePath('/');
  revalidatePath('/my-listings');
  redirect('/my-listings');
}

export async function markSold(formData: FormData) {
  const supabase = await createClient();
  const listingId = formData.get('listingId') as string;
  const soldViaSwapYard = formData.get('soldViaSwapYard') === 'true';
  await supabase
    .from('listings')
    .update({ status: 'sold', sold_via_swapyard: soldViaSwapYard })
    .eq('id', listingId);
  revalidatePath('/');
  revalidatePath('/my-listings');
}

export async function markReserved(formData: FormData) {
  const supabase = await createClient();
  const listingId = formData.get('listingId') as string;
  await supabase.from('listings').update({ status: 'reserved' }).eq('id', listingId);
  revalidatePath('/');
  revalidatePath('/my-listings');
}

export async function relist(formData: FormData) {
  const supabase = await createClient();
  const listingId = formData.get('listingId') as string;
  await supabase.from('listings').update({ status: 'active' }).eq('id', listingId);
  revalidatePath('/');
  revalidatePath('/my-listings');
}

export async function addPhotosToListing(listingId: string, newUrls: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { data: listing } = await supabase
    .from('listings')
    .select('image_urls, outlet_id')
    .eq('id', listingId)
    .single();

  if (!listing || listing.outlet_id !== user.id) {
    return { success: false };
  }

  const existing: string[] = listing.image_urls ?? [];
  const combined = [...existing, ...newUrls].slice(0, 6);

  await supabase.from('listings').update({ image_urls: combined }).eq('id', listingId);

  revalidatePath('/my-listings');
  revalidatePath('/');
  return { success: true, count: combined.length };
}

export async function deleteListing(formData: FormData) {
  const supabase = await createClient();
  const listingId = formData.get('listingId') as string;

  const { data: listing } = await supabase
    .from('listings')
    .select('image_urls')
    .eq('id', listingId)
    .single();

  if (listing?.image_urls?.length) {
    const marker = '/listing-images/';
    const paths = (listing.image_urls as string[])
      .map((url) => {
        const idx = url.indexOf(marker);
        return idx === -1 ? null : url.slice(idx + marker.length);
      })
      .filter((p): p is string => !!p);
    if (paths.length) {
      await supabase.storage.from('listing-images').remove(paths);
    }
  }

  await supabase.from('listings').delete().eq('id', listingId);
  revalidatePath('/');
  revalidatePath('/my-listings');
}

export async function reportContent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const listingId = (formData.get('listingId') as string) || null;
  const requestId = (formData.get('requestId') as string) || null;
  const reason = formData.get('reason') as string;
  const detail = (formData.get('detail') as string) || null;

  if (!reason || (!listingId && !requestId)) {
    return { success: false };
  }

  await supabase.from('content_reports').insert({
    listing_id: listingId,
    request_id: requestId,
    reporter_id: user.id,
    reason,
    detail,
  });

  return { success: true };
}

export async function logContactReveal(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('listing_events').insert({
    listing_id: listingId,
    event_type: 'contact_revealed',
    viewer_id: user.id,
  });
}

export async function logRequestInterest(requestId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('listing_events').insert({
    request_id: requestId,
    event_type: 'request_interest',
    viewer_id: user.id,
  });
}

export async function createRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const county = formData.get('county') as string;
  const requestedVisibility = (formData.get('visibility') as string) || 'all';

  const { data: ownProfile } = await supabase
    .from('profiles')
    .select('buying_group, buying_group_verified')
    .eq('id', user.id)
    .single();
  const visibility =
    requestedVisibility === 'group' && ownProfile?.buying_group && ownProfile?.buying_group_verified
      ? 'group'
      : 'all';

  const { data: newRequest, error } = await supabase
    .from('requests')
    .insert({
      outlet_id: user.id,
      title,
      description,
      category,
      visibility,
      county,
    })
    .select('id')
    .single();

  if (error) {
    redirect('/requests?error=' + encodeURIComponent(error.message));
  }

  if (newRequest) {
    notifyMatchingSubscribers({
      category,
      county,
      title: `Request: ${title}`,
      excludeOutletId: user.id,
      url: `/requests`,
      visibility,
      posterBuyingGroup: ownProfile?.buying_group ?? null,
    }).catch(() => {});
  }

  revalidatePath('/requests');
  redirect('/requests');
}

export async function markRequestFulfilled(formData: FormData) {
  const supabase = await createClient();
  const requestId = formData.get('requestId') as string;
  const fulfilledViaSwapYard = formData.get('fulfilledViaSwapYard') === 'true';
  await supabase
    .from('requests')
    .update({ status: 'fulfilled', fulfilled_via_swapyard: fulfilledViaSwapYard })
    .eq('id', requestId);
  revalidatePath('/requests');
}

export async function deleteRequest(formData: FormData) {
  const supabase = await createClient();
  const requestId = formData.get('requestId') as string;
  await supabase.from('requests').delete().eq('id', requestId);
  revalidatePath('/requests');
}
