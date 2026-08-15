'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

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

  const { error } = await supabase.auth.signUp({
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

  let imageUrls: string[] = [];
  try {
    imageUrls = JSON.parse((formData.get('imageUrls') as string) || '[]');
  } catch {
    imageUrls = [];
  }

  const { error } = await supabase.from('listings').insert({
    outlet_id: user.id,
    title,
    description,
    category,
    county,
    quantity,
    price,
    image_urls: imageUrls,
  });

  if (error) {
    redirect('/list?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/');
  revalidatePath('/my-listings');
  redirect('/my-listings');
}

export async function markSold(formData: FormData) {
  const supabase = await createClient();
  const listingId = formData.get('listingId') as string;
  await supabase.from('listings').update({ status: 'sold' }).eq('id', listingId);
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

export async function deleteListing(formData: FormData) {
  const supabase = await createClient();
  const listingId = formData.get('listingId') as string;
  await supabase.from('listings').delete().eq('id', listingId);
  revalidatePath('/');
  revalidatePath('/my-listings');
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

  const { error } = await supabase.from('requests').insert({
    outlet_id: user.id,
    title,
    description,
    category,
    county,
  });

  if (error) {
    redirect('/requests?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/requests');
  redirect('/requests');
}

export async function markRequestFulfilled(formData: FormData) {
  const supabase = await createClient();
  const requestId = formData.get('requestId') as string;
  await supabase.from('requests').update({ status: 'fulfilled' }).eq('id', requestId);
  revalidatePath('/requests');
}

export async function deleteRequest(formData: FormData) {
  const supabase = await createClient();
  const requestId = formData.get('requestId') as string;
  await supabase.from('requests').delete().eq('id', requestId);
  revalidatePath('/requests');
}
