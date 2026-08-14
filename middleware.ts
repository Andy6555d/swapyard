import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isApiRoute = path.startsWith('/api/');
  const isPublicPath =
    isApiRoute ||
    path === '/' ||
    path.startsWith('/login') ||
    path.startsWith('/signup') ||
    path.startsWith('/privacy') ||
    path.startsWith('/terms');

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && (path.startsWith('/login') || path.startsWith('/signup'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/browse';
    return NextResponse.redirect(url);
  }

  // Paywall gate: logged-in, non-admin outlets need an active subscription
  // (or comp access) to use the app beyond the billing page itself.
  if (user && !isApiRoute && !isPublicPath && path !== '/subscribe') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, subscription_status')
      .eq('id', user.id)
      .single();

    const hasAccess =
      profile?.is_admin || profile?.subscription_status === 'active' || profile?.subscription_status === 'comp';

    if (!hasAccess) {
      const url = request.nextUrl.clone();
      url.pathname = '/subscribe';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
