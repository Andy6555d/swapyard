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
  const files = formData.getAll('images') as File[];

  const imageUrls: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const fileName = `${user.id}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(fileName, file);
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(fileName);
      imageUrls.push(urlData.publicUrl);
    }
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
