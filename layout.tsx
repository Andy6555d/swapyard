import './globals.css';
import { createClient } from '@/lib/supabase/server';
import { logout } from './actions';
import Footer from '@/components/Footer';
import InstallPrompt from '@/components/InstallPrompt';

export const metadata = {
  title: 'SwapYard — Merchant Stock Exchange',
  description: 'Internal marketplace for independent merchant outlets',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1C2B39" />
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
                <input type="checkbox" id="nav-toggle" className="nav-toggle-checkbox" />
                <label htmlFor="nav-toggle" className="nav-toggle-label" aria-label="Menu">
                  ☰
                </label>
                <nav>
                  <a href="/browse">Browse Stock</a>
                  <a href="/list">List Stock</a>
                  <a href="/requests">Requests</a>
                  <a href="/my-listings">My Listings</a>
                  <details className="nav-dropdown">
                    <summary>Account</summary>
                    <div className="nav-dropdown-menu">
                      <a href="/account">Settings</a>
                      <a href="/subscribe">Billing</a>
                      <a href="/alerts">Alerts</a>
                    </div>
                  </details>
                  {isAdmin && <a href="/admin">Admin</a>}
                </nav>
                <div className="header-actions">
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
        <InstallPrompt />
        {children}
        <Footer />
      </body>
    </html>
  );
}
