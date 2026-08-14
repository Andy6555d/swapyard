import './globals.css';
import { createClient } from '@/lib/supabase/server';
import { logout } from './actions';

export const metadata = {
  title: 'SwapYard — Member Stock Exchange',
  description: 'Internal marketplace for buying group member outlets',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let outletName: string | null = null;
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('outlet_name, is_admin')
      .eq('id', user.id)
      .single();
    outletName = profile?.outlet_name ?? null;
    isAdmin = profile?.is_admin ?? false;
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header>
          <div className="wrap header-inner">
            <a className="logo" href="/">
              <span className="logo-mark"></span>SwapYard
            </a>
            {user && (
              <>
                <nav>
                  <a href="/browse">Browse Stock</a>
                  <a href="/list">List Stock</a>
                  <a href="/my-listings">My Listings</a>
                  {isAdmin && <a href="/admin">Admin</a>}
                </nav>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {outletName && <span className="nav-outlet">{outletName}</span>}
                  <form action={logout}>
                    <button className="logout-btn" type="submit">
                      Log out
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
